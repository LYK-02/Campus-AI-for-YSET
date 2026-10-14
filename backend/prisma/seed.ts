import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { branches } from "../src/data/branches.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting YSET database seed...");

  // 1. University
  let university = await prisma.university.findFirst({
    where: { emailDomain: "yenepoya.edu.in" },
  });

  if (!university) {
    university = await prisma.university.create({
      data: {
        name: "Yenepoya School of Technology",
        emailDomain: "yenepoya.edu.in",
        settings: {
          institutionCode: "YSET",
          portalVersion: "1.0.0",
          academicYear: "2026-2027",
        },
      },
    });
    console.log("✅ Created University:", university.name);
  } else {
    console.log("ℹ️ University already exists:", university.name);
  }

  // 2. Department: Computer Science & Engineering
  let department = await prisma.department.findFirst({
    where: { universityId: university.id, code: "CSE" },
  });

  if (!department) {
    department = await prisma.department.create({
      data: {
        universityId: university.id,
        code: "CSE",
        name: "Computer Science & Engineering",
      },
    });
    console.log("✅ Created Department:", department.name);
  }

  // 3. Seed Semester 1 & 2 Core Courses from official CSE branches
  const cseAift = branches[0];
  if (cseAift && department) {
    for (const sem of cseAift.semesters.slice(0, 2)) {
      for (let i = 0; i < sem.subjects.length; i++) {
        const sub = sem.subjects[i];
        const courseCode = `CSE-${sem.semester}0${i + 1}`;
        const existing = await prisma.course.findFirst({
          where: { universityId: university.id, code: courseCode },
        });

        if (!existing) {
          await prisma.course.create({
            data: {
              universityId: university.id,
              departmentId: department.id,
              code: courseCode,
              name: sub.name,
              credits: sub.credits,
              semester: `Semester ${sem.semester}`,
              branchId: cseAift.id,
              isPublished: true,
            },
          });
        } else {
          await prisma.course.update({
            where: { id: existing.id },
            data: {
              branchId: cseAift.id,
              isPublished: true,
            },
          });
        }
      }
    }
    console.log("✅ Seeded/Updated curriculum courses for Semester 1 & 2 with branchId");
  }

  // 4. Default Super Admin
  const adminEmail = "admin@yenepoya.edu.in";
  let admin = await prisma.user.findFirst({
    where: { universityId: university.id, emailNormalized: adminEmail },
  });

  if (!admin) {
    const adminPasswordHash = await bcrypt.hash("Admin@YSET2026!", 12);
    admin = await prisma.user.create({
      data: {
        universityId: university.id,
        name: "YSET Administrator",
        emailNormalized: adminEmail,
        passwordHash: adminPasswordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        roles: {
          create: [{ role: Role.ADMIN }, { role: Role.FACULTY }],
        },
      },
    });
    console.log("✅ Created Admin User: admin@yenepoya.edu.in / Admin@YSET2026!");
  }

  // 5. Default Faculty Member
  const facultyEmail = "faculty@yenepoya.edu.in";
  let faculty = await prisma.user.findFirst({
    where: { universityId: university.id, emailNormalized: facultyEmail },
  });

  if (!faculty) {
    const facultyPasswordHash = await bcrypt.hash("Faculty@YSET2026!", 12);
    faculty = await prisma.user.create({
      data: {
        universityId: university.id,
        name: "Dr. Ananya Rao",
        emailNormalized: facultyEmail,
        passwordHash: facultyPasswordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        roles: {
          create: [{ role: Role.FACULTY }],
        },
      },
    });
    console.log("✅ Created Faculty User: faculty@yenepoya.edu.in / Faculty@YSET2026!");
  }

  // 6. Default Verified Student
  const studentEmail = "student@yenepoya.edu.in";
  let student = await prisma.user.findFirst({
    where: { universityId: university.id, emailNormalized: studentEmail },
  });

  if (!student) {
    const studentPasswordHash = await bcrypt.hash("Student@YSET2026!", 12);
    student = await prisma.user.create({
      data: {
        universityId: university.id,
        name: "Rahul Sharma",
        emailNormalized: studentEmail,
        studentId: "YSET-2026-CS-001",
        passwordHash: studentPasswordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        roles: {
          create: [{ role: Role.STUDENT }],
        },
      },
    });
    console.log("✅ Created Student User: student@yenepoya.edu.in / Student@YSET2026!");
  }

  // 7. Seed Sample Course Enrollments & Teaching Assignments
  const mathCourse = await prisma.course.findFirst({
    where: { universityId: university.id, code: "CSE-101" },
  });
  const progCourse = await prisma.course.findFirst({
    where: { universityId: university.id, code: "CSE-103" },
  });

  if (mathCourse && faculty && student) {
    // Teaching assignment
    await prisma.teachingAssignment.upsert({
      where: {
        facultyId_courseId: { facultyId: faculty.id, courseId: mathCourse.id },
      },
      update: {},
      create: { facultyId: faculty.id, courseId: mathCourse.id },
    });

    // Student enrollment
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: mathCourse.id },
      },
      update: {},
      create: { studentId: student.id, courseId: mathCourse.id },
    });

    // Sample Assignment 1: Mathematics
    let mathAssignment = await prisma.assignment.findFirst({
      where: { courseId: mathCourse.id, title: "Problem Set 1: Matrix Inversion & Linear Systems" },
    });
    if (!mathAssignment) {
      mathAssignment = await prisma.assignment.create({
        data: {
          courseId: mathCourse.id,
          creatorId: faculty.id,
          title: "Problem Set 1: Matrix Inversion & Linear Systems",
          description: "Complete all problem sets from Chapter 3 on Gaussian Elimination, LU Decomposition, and Eigenvalues. Submit hand-written or LaTeX solutions.",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          maxMarks: 100,
        },
      });

      // Sample graded submission for student
      await prisma.submission.upsert({
        where: {
          assignmentId_studentId: { assignmentId: mathAssignment.id, studentId: student.id },
        },
        update: {},
        create: {
          assignmentId: mathAssignment.id,
          studentId: student.id,
          content: "Detailed solution steps completed for Gaussian Elimination and Eigenvalue calculations (LaTeX PDF).",
          marks: 92,
          feedback: "Excellent precision on matrix row operations! Clear explanation of basis vectors.",
          status: "GRADED",
          gradedAt: new Date(),
        },
      });
    }

    // Sample Material
    const existingMat = await prisma.material.findFirst({
      where: { courseId: mathCourse.id, title: "Unit 1: Linear Algebra & Matrix Transformations Lecture Notes" },
    });
    if (!existingMat) {
      await prisma.material.create({
        data: {
          universityId: university.id,
          ownerId: faculty.id,
          courseId: mathCourse.id,
          title: "Unit 1: Linear Algebra & Matrix Transformations Lecture Notes",
          description: "Official lecture handouts covering vector spaces, linear transformations, and matrix diagonalization.",
          storageKey: "materials/cse101_unit1_linear_algebra.pdf",
          originalFilename: "YSET_CSE101_Unit1_Notes.pdf",
          mimeType: "application/pdf",
          sizeBytes: 2450000,
          visibility: "COURSE",
          processingStatus: "READY",
        },
      });
    }
  }

  if (progCourse && faculty && student) {
    // Teaching assignment
    await prisma.teachingAssignment.upsert({
      where: {
        facultyId_courseId: { facultyId: faculty.id, courseId: progCourse.id },
      },
      update: {},
      create: { facultyId: faculty.id, courseId: progCourse.id },
    });

    // Student enrollment
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: progCourse.id },
      },
      update: {},
      create: { studentId: student.id, courseId: progCourse.id },
    });

    // Sample Assignment 2: Python Programming
    const progAssignment = await prisma.assignment.findFirst({
      where: { courseId: progCourse.id, title: "Lab Exercise 2: Python Data Structures & Algorithmic Complexity" },
    });
    if (!progAssignment) {
      await prisma.assignment.create({
        data: {
          courseId: progCourse.id,
          creatorId: faculty.id,
          title: "Lab Exercise 2: Python Data Structures & Algorithmic Complexity",
          description: "Implement custom Hash Table and Binary Search Tree in Python 3. Include unit tests for collision resolution and benchmark time complexities.",
          dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          maxMarks: 50,
        },
      });
    }

    // Sample Material 2
    const existingProgMat = await prisma.material.findFirst({
      where: { courseId: progCourse.id, title: "Python Programming Style Guide & Lab Manual 2026" },
    });
    if (!existingProgMat) {
      await prisma.material.create({
        data: {
          universityId: university.id,
          ownerId: faculty.id,
          courseId: progCourse.id,
          title: "Python Programming Style Guide & Lab Manual 2026",
          description: "Official YSET CSE laboratory guidelines, PEP 8 standards, and submission rubric.",
          storageKey: "materials/cse103_python_lab_manual.pdf",
          originalFilename: "YSET_Python_Lab_Manual_2026.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1820000,
          visibility: "COURSE",
          processingStatus: "READY",
        },
      });
    }
  }

  // 8. Sample University Announcements
  const existingAnn1 = await prisma.announcement.findFirst({
    where: { universityId: university.id, title: "Mid-Term Examination Schedule & Room Allocations - Oct 2026" },
  });
  if (!existingAnn1 && admin) {
    await prisma.announcement.create({
      data: {
        universityId: university.id,
        creatorId: admin.id,
        title: "Mid-Term Examination Schedule & Room Allocations - Oct 2026",
        content: "The mid-term examination timetable for all B.Tech semesters has been officially confirmed. Students are required to report to their designated lecture halls with physical university ID cards.",
        isPinned: true,
      },
    });
  }

  const existingAnn2 = await prisma.announcement.findFirst({
    where: { universityId: university.id, title: "Guest Lecture: AI & Full Stack Architecture in Modern Industry" },
  });
  if (!existingAnn2 && faculty) {
    await prisma.announcement.create({
      data: {
        universityId: university.id,
        creatorId: faculty.id,
        title: "Guest Lecture: AI & Full Stack Architecture in Modern Industry",
        content: "Join us this Friday at 2:00 PM in Seminar Hall A for an industry keynote on scalable cloud microservices, presented by senior engineering leads.",
        isPinned: false,
      },
    });
  }

  console.log("✅ Seeded initial assignments, materials, and campus announcements");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
