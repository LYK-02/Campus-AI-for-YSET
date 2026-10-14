import { prisma } from "../../lib/prisma.js";
import { Role } from "@prisma/client";

export class AnnouncementsService {
  /**
   * Faculty/Admin: Publish announcement
   */
  async createAnnouncement(data: {
    universityId: string;
    creatorId: string;
    courseId?: string;
    title: string;
    content: string;
    isPinned?: boolean;
    expiresAt?: Date | string;
  }) {
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        throw new Error("Course not found");
      }
    }

    return prisma.announcement.create({
      data: {
        universityId: data.universityId,
        creatorId: data.creatorId,
        courseId: data.courseId,
        title: data.title,
        content: data.content,
        isPinned: data.isPinned || false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, emailNormalized: true },
        },
        course: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  /**
   * Get announcements
   */
  async getAnnouncements(params: {
    universityId: string;
    courseId?: string;
  }) {
    const { universityId, courseId } = params;

    const where: any = { universityId };

    if (courseId) {
      where.courseId = courseId;
    }

    return prisma.announcement.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true },
        },
        course: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string, universityId: string, userId: string, roles: Role[]) {
    const announcement = await prisma.announcement.findFirst({
      where: { id, universityId },
    });

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    const isAdmin = roles.includes(Role.ADMIN);
    const isOwner = announcement.creatorId === userId;

    if (!isAdmin && !isOwner) {
      throw new Error("Access denied: only creator or admin can delete this announcement.");
    }

    return prisma.announcement.delete({
      where: { id },
    });
  }
}

export const announcementsService = new AnnouncementsService();
