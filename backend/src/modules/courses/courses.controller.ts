import type { Request, Response, NextFunction } from "express";
import { coursesService } from "./courses.service.js";
import { Role } from "@prisma/client";

export class CoursesController {
  async listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user?.universityId || "university-placeholder";
      const branchId = (req.query.branchId as string) || "cse-aift";
      const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : 1;
      const isAdmin = req.user?.roles?.includes(Role.ADMIN) ?? false;

      const courses = await coursesService.getCourses({
        universityId,
        branchId,
        semester,
        isAdmin,
      });

      res.json({
        data: courses,
        meta: {
          total: courses.length,
          branchId,
          semester,
          isAdminView: isAdmin,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async setVisibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isPublished } = req.body;
      const universityId = req.user!.universityId;

      if (typeof isPublished !== "boolean") {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Field 'isPublished' must be a boolean.",
          },
        });
        return;
      }

      const updated = await coursesService.setCourseVisibility(id, universityId, isPublished);

      res.json({
        data: updated,
        message: `Course ${updated.code} is now ${isPublished ? "visible to students" : "hidden from students"}.`,
      });
    } catch (err) {
      next(err);
    }
  }

  async generateTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const { branchId = "cse-aift", semester = 1 } = req.body;

      const semNum = typeof semester === "number" ? semester : parseInt(semester, 10);

      const timetable = await coursesService.autoGenerateTimetable({
        universityId,
        branchId,
        semester: semNum,
      });

      res.status(201).json({
        data: timetable,
        message: `Successfully auto-generated weekly timetable for ${branchId.toUpperCase()} Semester ${semNum}.`,
        meta: {
          totalSlots: timetable.length,
          branchId,
          semester: semNum,
        },
      });
    } catch (err: any) {
      if (err.message && err.message.includes("Cannot auto-generate timetable")) {
        res.status(400).json({
          error: {
            code: "SCHEDULE_GENERATION_FAILED",
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  async getTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user?.universityId || "university-placeholder";
      const branchId = (req.query.branchId as string) || "cse-aift";
      const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : 1;
      const isAdmin = req.user?.roles?.includes(Role.ADMIN) ?? false;

      const timetable = await coursesService.getTimetable({
        universityId,
        branchId,
        semester,
        isAdmin,
      });

      res.json({
        data: timetable,
        meta: {
          totalSlots: timetable.length,
          branchId,
          semester,
          isAdminView: isAdmin,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async clearTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.user!.universityId;
      const branchId = (req.body.branchId || req.query.branchId || "cse-aift") as string;
      const semester = parseInt((req.body.semester || req.query.semester || "1") as string, 10);

      await coursesService.clearTimetable({
        universityId,
        branchId,
        semester,
      });

      res.json({
        message: `Timetable for ${branchId} Semester ${semester} has been reset.`,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const coursesController = new CoursesController();
