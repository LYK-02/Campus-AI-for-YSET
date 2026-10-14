import { prisma } from "../../lib/prisma.js";
import { AssignmentStatus, SubmissionStatus, Role } from "@prisma/client";

export class AssignmentsService {
  /**
   * Faculty/Admin: Create a new assignment for a course
   */
  async createAssignment(data: {
    courseId: string;
    creatorId: string;
    title: string;
    description: string;
    dueDate: Date | string;
    maxMarks?: number;
  }) {
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    return prisma.assignment.create({
      data: {
        courseId: data.courseId,
        creatorId: data.creatorId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        maxMarks: data.maxMarks || 100,
        status: AssignmentStatus.PUBLISHED,
      },
      include: {
        course: {
          select: { id: true, code: true, name: true },
        },
        creator: {
          select: { id: true, name: true, emailNormalized: true },
        },
      },
    });
  }

  /**
   * List assignments filtered by course or user role
   */
  async getAssignments(params: {
    universityId: string;
    courseId?: string;
    studentId?: string;
    facultyId?: string;
    role?: Role;
  }) {
    const { universityId, courseId, studentId } = params;

    const where: any = {
      course: {
        universityId,
      },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: { id: true, code: true, name: true, semester: true },
        },
        creator: {
          select: { id: true, name: true },
        },
        submissions: studentId
          ? {
              where: { studentId },
              select: {
                id: true,
                status: true,
                marks: true,
                feedback: true,
                submittedAt: true,
                gradedAt: true,
                content: true,
              },
            }
          : {
              select: {
                id: true,
                status: true,
                marks: true,
                submittedAt: true,
                studentId: true,
                student: {
                  select: { id: true, name: true, studentId: true, emailNormalized: true },
                },
              },
            },
      },
      orderBy: { dueDate: "asc" },
    });

    return assignments;
  }

  /**
   * Get single assignment with submissions
   */
  async getAssignmentById(id: string, universityId: string) {
    return prisma.assignment.findFirst({
      where: {
        id,
        course: { universityId },
      },
      include: {
        course: true,
        creator: {
          select: { id: true, name: true, emailNormalized: true },
        },
        submissions: {
          include: {
            student: {
              select: { id: true, name: true, studentId: true, emailNormalized: true },
            },
          },
        },
      },
    });
  }

  /**
   * Student: Submit assignment
   */
  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    content?: string;
    storageKey?: string;
  }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    return prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
      },
      update: {
        content: data.content,
        storageKey: data.storageKey,
        status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        content: data.content,
        storageKey: data.storageKey,
        status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
      },
      include: {
        assignment: {
          select: { id: true, title: true, maxMarks: true },
        },
      },
    });
  }

  /**
   * Faculty/Admin: Grade a submission with marks & feedback
   */
  async gradeSubmission(data: {
    submissionId: string;
    marks: number;
    feedback?: string;
  }) {
    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    if (data.marks > submission.assignment.maxMarks) {
      throw new Error(`Marks cannot exceed maximum of ${submission.assignment.maxMarks}`);
    }

    return prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        marks: data.marks,
        feedback: data.feedback,
        status: SubmissionStatus.GRADED,
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: { id: true, name: true, studentId: true },
        },
        assignment: {
          select: { id: true, title: true, maxMarks: true },
        },
      },
    });
  }
}

export const assignmentsService = new AssignmentsService();
