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
