import type { Request, Response, NextFunction } from "express";
import { assignmentsService } from "./assignments.service.js";
import { materialsService } from "./materials.service.js";
import { announcementsService } from "./announcements.service.js";
import { Role } from "@prisma/client";

export class AcademicController {
  // --- ASSIGNMENTS ---
  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId, title, description, dueDate, maxMarks } = req.body;
      const creatorId = req.user!.id;

      if (!courseId || !title || !description || !dueDate) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Fields courseId, title, description, and dueDate are required.",
          },
        });
        return;
      }

      const assignment = await assignmentsService.createAssignment({
        courseId,
        creatorId,
        title,
        description,
        dueDate,
        maxMarks: maxMarks ? parseInt(maxMarks, 10) : 100,
      });

      res.status(201).json({
        data: assignment,
        message: "Assignment created successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  async listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const courseId = req.query.courseId as string | undefined;
      const isStudent = req.user!.roles.includes(Role.STUDENT) && !req.user!.roles.includes(Role.ADMIN) && !req.user!.roles.includes(Role.FACULTY);

      const assignments = await assignmentsService.getAssignments({
        universityId,
        courseId,
        studentId: isStudent ? req.user!.id : undefined,
      });

      res.json({
        data: assignments,
        meta: { total: assignments.length },
      });
    } catch (err) {
      next(err);
    }
  }

  async getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const universityId = req.user!.universityId;

      const assignment = await assignmentsService.getAssignmentById(id, universityId);
      if (!assignment) {
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Assignment not found." },
        });
        return;
      }

      res.json({ data: assignment });
    } catch (err) {
      next(err);
    }
  }

  async submitAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignmentId = req.params.id as string;
      const studentId = req.user!.id;
      const { content, storageKey } = req.body;

      if (!content && !storageKey) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Either submission content or an attachment is required.",
          },
        });
        return;
      }

      const submission = await assignmentsService.submitAssignment({
        assignmentId,
        studentId,
        content,
        storageKey,
      });

      res.status(201).json({
        data: submission,
        message: "Assignment submitted successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissionId = req.params.submissionId as string;
      const { marks, feedback } = req.body;

      if (typeof marks !== "number") {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Field 'marks' is required and must be a number.",
          },
        });
        return;
      }

      const graded = await assignmentsService.gradeSubmission({
        submissionId,
        marks,
        feedback,
      });

      res.json({
        data: graded,
        message: "Submission graded successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  // --- MATERIALS ---
  async createMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const ownerId = req.user!.id;
      const {
        courseId,
        title,
        description,
        storageKey,
        originalFilename,
        mimeType,
        sizeBytes,
        visibility,
        fileBase64,
      } = req.body;

      if (!title || !originalFilename) {
        res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "Title and filename are required." },
        });
        return;
      }

      const material = await materialsService.createMaterial({
        universityId,
        ownerId,
        courseId,
        title,
        description,
        storageKey,
        originalFilename,
        mimeType: mimeType || "application/pdf",
        sizeBytes,
        visibility,
        fileBase64,
      });

      res.status(201).json({
        data: material,
        message: "Material uploaded successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  async listMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const courseId = req.query.courseId as string | undefined;

      const materials = await materialsService.getMaterials({
        universityId,
        courseId,
        userId: req.user!.id,
        roles: req.user!.roles,
      });

      res.json({
        data: materials,
        meta: { total: materials.length },
      });
    } catch (err) {
      next(err);
    }
  }

  async downloadMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const universityId = req.user!.universityId;

      const material = await materialsService.getMaterialById(id, universityId);
      if (!material) {
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Material resource not found." },
        });
        return;
      }

      const fileData = await materialsService.getMaterialFile(material);

      res.setHeader("Content-Type", fileData.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${fileData.filename}"`);
      res.setHeader("Content-Length", fileData.buffer.length);
      res.send(fileData.buffer);
    } catch (err) {
      next(err);
    }
  }

  async deleteMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const universityId = req.user!.universityId;

      await materialsService.deleteMaterial(id, universityId, req.user!.id, req.user!.roles);

      res.json({ message: "Material deleted successfully." });
    } catch (err) {
      next(err);
    }
  }

  // --- ANNOUNCEMENTS ---
  async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const creatorId = req.user!.id;
      const { courseId, title, content, isPinned, expiresAt } = req.body;

      if (!title || !content) {
        res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "Title and content are required." },
        });
        return;
      }

      const announcement = await announcementsService.createAnnouncement({
        universityId,
        creatorId,
        courseId,
        title,
        content,
        isPinned,
        expiresAt,
      });

      res.status(201).json({
        data: announcement,
        message: "Announcement posted successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  async listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const courseId = req.query.courseId as string | undefined;

      const announcements = await announcementsService.getAnnouncements({
        universityId,
        courseId,
      });

      res.json({
        data: announcements,
        meta: { total: announcements.length },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const universityId = req.user!.universityId;

      await announcementsService.deleteAnnouncement(id, universityId, req.user!.id, req.user!.roles);

      res.json({ message: "Announcement deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
}

export const academicController = new AcademicController();
