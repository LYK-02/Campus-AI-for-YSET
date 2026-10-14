import { prisma } from "../../lib/prisma.js";
import { branches } from "../../data/branches.js";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;

export interface PeriodDefinition {
  periodNumber: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  label?: string;
}

export const PERIOD_SCHEDULE: PeriodDefinition[] = [
  { periodNumber: 1, startTime: "09:00 AM", endTime: "10:00 AM" },
  { periodNumber: 2, startTime: "10:00 AM", endTime: "11:00 AM" },
  { periodNumber: 3, startTime: "11:15 AM", endTime: "12:15 PM" },
  { periodNumber: 4, startTime: "01:15 PM", endTime: "02:15 PM" },
  { periodNumber: 5, startTime: "02:15 PM", endTime: "03:15 PM" },
  { periodNumber: 6, startTime: "03:15 PM", endTime: "04:15 PM" },
];

const ROOM_ALLOCATIONS = [
  "Tech Block - LH 201",
  "Tech Block - LH 202",
  "YSET AI & Computing Lab 3",
  "Hardware & Electronics Lab",
  "Smart Seminar Hall A",
  "Innovation Studio 104",
];

export class CoursesService {
  /**
   * Sync standard curriculum courses from branches data if not present in DB
   */
  async ensureBranchCourses(universityId: string, branchId: string, semesterNum: number) {
    const semString = `Semester ${semesterNum}`;
    const count = await prisma.course.count({
      where: {
        universityId,
        branchId,
        semester: semString,
      },
    });

    if (count > 0) return;

    // Look up branch and semester in branches.ts
    const branch = branches.find((b) => b.id === branchId) || branches[0];
    if (!branch) return;

    const semesterData = branch.semesters.find((s) => s.semester === semesterNum);
    if (!semesterData || !semesterData.subjects.length) return;

    // Find default department
    const department = await prisma.department.findFirst({
      where: { universityId },
    });
    if (!department) return;

    // Seed courses for this branch/semester
    for (let i = 0; i < semesterData.subjects.length; i++) {
      const sub = semesterData.subjects[i];
      const code = `${branch.shortName.replace(/[^a-zA-Z]/g, "")}-${semesterNum}0${i + 1}`;

      await prisma.course.upsert({
        where: {
          universityId_code: {
            universityId,
            code,
          },
        },
        update: {
          name: sub.name,
          credits: sub.credits,
          semester: semString,
          branchId,
          isPublished: true,
        },
        create: {
          universityId,
          departmentId: department.id,
          code,
          name: sub.name,
          credits: sub.credits,
          semester: semString,
          branchId,
          isPublished: true,
        },
      });
    }
  }

  /**
   * Get courses with role-aware visibility
   */
  async getCourses(params: {
    universityId: string;
    branchId?: string;
    semester?: number;
    isAdmin?: boolean;
  }) {
    const { universityId, branchId, semester, isAdmin = false } = params;

    // Ensure courses are seeded if branch and semester are specified
    if (branchId && semester) {
      await this.ensureBranchCourses(universityId, branchId, semester);
    }

    const where: any = { universityId };

    if (branchId) {
      where.branchId = branchId;
    }

    if (semester) {
      where.semester = `Semester ${semester}`;
    }

    // Only administrators can see unpublished/hidden courses
    if (!isAdmin) {
      where.isPublished = true;
    }

    return prisma.course.findMany({
      where,
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    });
  }

  /**
   * Admin: Toggle visibility of a course to students
   */
  async setCourseVisibility(courseId: string, universityId: string, isPublished: boolean) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, universityId },
    });

    if (!course) {
      throw new Error("Course not found or access denied.");
    }

    return prisma.course.update({
      where: { id: courseId },
      data: { isPublished },
    });
  }

  /**
   * Admin: Auto-generate 5-day timetable using published courses
   */
  async autoGenerateTimetable(params: {
    universityId: string;
    branchId: string;
    semester: number;
  }) {
    const { universityId, branchId, semester } = params;

    // Ensure standard courses exist
    await this.ensureBranchCourses(universityId, branchId, semester);

    // Fetch ONLY published courses for this branch and semester
    const publishedCourses = await prisma.course.findMany({
      where: {
        universityId,
        branchId,
        semester: `Semester ${semester}`,
        isPublished: true,
      },
    });

    if (publishedCourses.length === 0) {
      throw new Error(
        "Cannot auto-generate timetable: No courses are published for this semester. Please publish at least one course."
      );
    }

    // Calculate slots allocation (30 periods in a week: 5 days x 6 periods)
    const totalPeriods = 30;
    const totalCredits = publishedCourses.reduce((sum, c) => sum + (c.credits || 3), 0);

    // Build course allocation queue based on credit weighting
    const periodQueue: typeof publishedCourses = [];
    for (const course of publishedCourses) {
      const cr = course.credits || 3;
      // Proportional allocation (at least 2 periods per course)
      const allocatedPeriods = Math.max(2, Math.round((cr / totalCredits) * totalPeriods));
      for (let p = 0; p < allocatedPeriods; p++) {
        periodQueue.push(course);
      }
    }

    // Adjust length to exactly totalPeriods
    while (periodQueue.length < totalPeriods) {
      // Repeat from highest credit courses
      periodQueue.push(publishedCourses[periodQueue.length % publishedCourses.length]);
    }
    const finalQueue = periodQueue.slice(0, totalPeriods);

    // Shuffle slightly to distribute subjects evenly across days
    // Grid: 5 days (rows) x 6 periods (cols)
    // We populate column by column or striped to prevent duplicate subjects in the same morning/afternoon
    const timetableEntries: Array<{
      universityId: string;
      branchId: string;
      semester: number;
      dayOfWeek: string;
      periodNumber: number;
      startTime: string;
      endTime: string;
      room: string;
      courseId: string;
      facultyName: string;
    }> = [];

    let queueIdx = 0;
    // Map of days to track course counts per day
    const dayCourseMap = new Map<string, Map<string, number>>();
    DAYS_OF_WEEK.forEach((d) => dayCourseMap.set(d, new Map()));

    for (let periodIdx = 0; periodIdx < PERIOD_SCHEDULE.length; periodIdx++) {
      const periodDef = PERIOD_SCHEDULE[periodIdx];

      for (let dayIdx = 0; dayIdx < DAYS_OF_WEEK.length; dayIdx++) {
        const day = DAYS_OF_WEEK[dayIdx];
        const dayCounts = dayCourseMap.get(day)!;

        // Find a course from the queue that hasn't appeared more than twice on this day
        let chosenCourse = finalQueue[queueIdx % finalQueue.length];
        let attempts = 0;
        while (attempts < finalQueue.length) {
          const candidate = finalQueue[(queueIdx + attempts) % finalQueue.length];
          const countToday = dayCounts.get(candidate.id) || 0;
          if (countToday < 2) {
            chosenCourse = candidate;
            queueIdx = (queueIdx + attempts) % finalQueue.length;
            break;
          }
          attempts++;
        }

        queueIdx++;
        dayCounts.set(chosenCourse.id, (dayCounts.get(chosenCourse.id) || 0) + 1);

        // Select suitable room
        const isLab =
          chosenCourse.name.toLowerCase().includes("programming") ||
          chosenCourse.name.toLowerCase().includes("web") ||
          chosenCourse.name.toLowerCase().includes("electronics") ||
          chosenCourse.name.toLowerCase().includes("lab");

        const room = isLab
          ? chosenCourse.name.toLowerCase().includes("electronics")
            ? "Hardware & Electronics Lab (B2-04)"
            : "YSET AI & Computing Lab 3 (T-302)"
          : ROOM_ALLOCATIONS[dayIdx % ROOM_ALLOCATIONS.length];

        timetableEntries.push({
          universityId,
          branchId,
          semester,
          dayOfWeek: day,
          periodNumber: periodDef.periodNumber,
          startTime: periodDef.startTime,
          endTime: periodDef.endTime,
          room,
          courseId: chosenCourse.id,
          facultyName: "YSET CSE Faculty Panel",
        });
      }
    }

    // Atomically replace existing timetable for this branch & semester
    await prisma.$transaction(async (tx) => {
      await tx.timetableSlot.deleteMany({
        where: {
          universityId,
          branchId,
          semester,
        },
      });

      await tx.timetableSlot.createMany({
        data: timetableEntries,
      });
    });

    return this.getTimetable({
      universityId,
      branchId,
      semester,
      isAdmin: true,
    });
  }

  /**
   * Get weekly timetable
   */
  async getTimetable(params: {
    universityId: string;
    branchId: string;
    semester: number;
    isAdmin?: boolean;
  }) {
    const { universityId, branchId, semester, isAdmin = false } = params;

    const slots = await prisma.timetableSlot.findMany({
      where: {
        universityId,
        branchId,
        semester,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            isPublished: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
    });

    // If student, filter out slots whose course is unpublished
    if (!isAdmin) {
      return slots.filter((slot) => slot.course && slot.course.isPublished);
    }

    return slots;
  }

  /**
   * Clear timetable for a branch & semester
   */
  async clearTimetable(params: {
    universityId: string;
    branchId: string;
    semester: number;
  }) {
    const { universityId, branchId, semester } = params;
    return prisma.timetableSlot.deleteMany({
      where: {
        universityId,
        branchId,
        semester,
      },
    });
  }
}

export const coursesService = new CoursesService();
