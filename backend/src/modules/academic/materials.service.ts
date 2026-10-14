import { prisma } from "../../lib/prisma.js";
import { MaterialVisibility, ProcessingStatus, Role } from "@prisma/client";

export class MaterialsService {
  /**
   * Faculty/Admin: Register/upload course learning material
   */
  async createMaterial(data: {
    universityId: string;
    ownerId: string;
    courseId?: string;
    title: string;
    description?: string;
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    visibility?: MaterialVisibility;
  }) {
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        throw new Error("Course not found");
      }
    }

    return prisma.material.create({
      data: {
        universityId: data.universityId,
        ownerId: data.ownerId,
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        storageKey: data.storageKey,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        visibility: data.visibility || MaterialVisibility.COURSE,
        processingStatus: ProcessingStatus.READY,
      },
      include: {
        course: {
          select: { id: true, code: true, name: true },
        },
        owner: {
          select: { id: true, name: true, emailNormalized: true },
        },
      },
    });
  }

  /**
   * Get learning materials
   */
  async getMaterials(params: {
    universityId: string;
    courseId?: string;
    userId?: string;
    roles?: Role[];
  }) {
    const { universityId, courseId } = params;

    const where: any = { universityId };

    if (courseId) {
      where.courseId = courseId;
    }

    return prisma.material.findMany({
      where,
      include: {
        course: {
          select: { id: true, code: true, name: true, semester: true },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Delete material
   */
  async deleteMaterial(id: string, universityId: string, userId: string, roles: Role[]) {
    const material = await prisma.material.findFirst({
      where: { id, universityId },
    });

    if (!material) {
      throw new Error("Material not found");
    }

    const isAdmin = roles.includes(Role.ADMIN);
    const isOwner = material.ownerId === userId;

    if (!isAdmin && !isOwner) {
      throw new Error("Access denied: only the owner or an administrator can delete this material.");
    }

    return prisma.material.delete({
      where: { id },
    });
  }
}

export const materialsService = new MaterialsService();
