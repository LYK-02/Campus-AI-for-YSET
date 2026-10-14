import fs from "fs";
import path from "path";
import { prisma } from "../../lib/prisma.js";
import { MaterialVisibility, ProcessingStatus, Role } from "@prisma/client";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "materials");

export class MaterialsService {
  constructor() {
    try {
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn("Could not create uploads directory:", err);
    }
  }

  /**
   * Faculty/Admin: Register/upload course learning material
   */
  async createMaterial(data: {
    universityId: string;
    ownerId: string;
    courseId?: string;
    title: string;
    description?: string;
    storageKey?: string;
    originalFilename: string;
    mimeType?: string;
    sizeBytes?: number;
    visibility?: MaterialVisibility;
    fileBase64?: string;
  }) {
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        throw new Error("Course not found");
      }
    }

    let finalStorageKey = data.storageKey;
    let finalSizeBytes = data.sizeBytes || 1024 * 1024;
    const finalMimeType = data.mimeType || "application/pdf";

    // If actual file content was provided via base64, write to disk
    if (data.fileBase64) {
      try {
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        // Strip data:application/pdf;base64, prefix if present
        const base64Data = data.fileBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        finalSizeBytes = buffer.length;

        const safeFilename = `${Date.now()}-${data.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const filePath = path.join(UPLOAD_DIR, safeFilename);

        fs.writeFileSync(filePath, buffer);
        finalStorageKey = `uploads/materials/${safeFilename}`;
      } catch (err: any) {
        console.error("Failed to write uploaded PDF file to disk:", err);
        throw new Error(`File upload storage failed: ${err.message}`);
      }
    }

    if (!finalStorageKey) {
      finalStorageKey = `materials/${Date.now()}_${data.originalFilename}`;
    }

    return prisma.material.create({
      data: {
        universityId: data.universityId,
        ownerId: data.ownerId,
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        storageKey: finalStorageKey,
        originalFilename: data.originalFilename,
        mimeType: finalMimeType,
        sizeBytes: finalSizeBytes,
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
   * Get single material by ID
   */
  async getMaterialById(id: string, universityId: string) {
    return prisma.material.findFirst({
      where: { id, universityId },
      include: {
        course: {
          select: { id: true, code: true, name: true },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Get material file buffer (from disk or generated PDF fallback)
   */
  async getMaterialFile(material: {
    title: string;
    originalFilename: string;
    storageKey: string;
    mimeType: string;
    course?: { code: string; name: string } | null;
  }): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const relativeOrAbs = material.storageKey;
    const directPath = path.resolve(process.cwd(), relativeOrAbs);
    const inUploads = path.resolve(UPLOAD_DIR, path.basename(relativeOrAbs));

    if (fs.existsSync(directPath)) {
      return {
        buffer: fs.readFileSync(directPath),
        filename: material.originalFilename,
        mimeType: material.mimeType || "application/pdf",
      };
    }

    if (fs.existsSync(inUploads)) {
      return {
        buffer: fs.readFileSync(inUploads),
        filename: material.originalFilename,
        mimeType: material.mimeType || "application/pdf",
      };
    }

    // Dynamic valid PDF fallback for seeded materials without physical disk file
    const courseCode = material.course?.code || "YSET";
    const courseName = material.course?.name || "Curriculum Resource";
    const safeTitle = (material.title || "Course Material").replace(/[()\\]/g, "");
    const safeCourse = `${courseCode} - ${courseName}`.replace(/[()\\]/g, "");

    const pdfString = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 260 >> stream
BT
/F1 20 Tf
50 720 Td
(Yenepoya School of Technology - YSET) Tj
/F1 14 Tf
0 -40 Td
(${safeCourse}) Tj
/F1 16 Tf
0 -35 Td
(${safeTitle}) Tj
/F1 11 Tf
0 -30 Td
(Official Academic Learning Material - Verified Faculty Resource) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000261 00000 n 
0000000574 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
651
%%EOF`;

    return {
      buffer: Buffer.from(pdfString),
      filename: material.originalFilename.endsWith(".pdf")
        ? material.originalFilename
        : `${material.originalFilename}.pdf`,
      mimeType: "application/pdf",
    };
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

    // Attempt to remove physical file from disk if present
    try {
      const directPath = path.resolve(process.cwd(), material.storageKey);
      if (fs.existsSync(directPath)) {
        fs.unlinkSync(directPath);
      }
    } catch {
      // Ignore physical delete errors
    }

    return prisma.material.delete({
      where: { id },
    });
  }
}

export const materialsService = new MaterialsService();
