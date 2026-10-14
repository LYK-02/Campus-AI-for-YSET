import { Router } from "express";
import { coursesController } from "./courses.controller.js";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { Role } from "@prisma/client";

export const coursesRouter = Router();

// Courses endpoints
coursesRouter.get("/", authenticate, (req, res, next) => coursesController.listCourses(req, res, next));
coursesRouter.patch(
  "/:id/visibility",
  authenticate,
  requireRoles(Role.ADMIN),
  (req, res, next) => coursesController.setVisibility(req, res, next)
);

// Timetable endpoints
export const timetableRouter = Router();

timetableRouter.get("/", authenticate, (req, res, next) => coursesController.getTimetable(req, res, next));
timetableRouter.post(
  "/generate",
  authenticate,
  requireRoles(Role.ADMIN),
  (req, res, next) => coursesController.generateTimetable(req, res, next)
);
timetableRouter.delete(
  "/",
  authenticate,
  requireRoles(Role.ADMIN),
  (req, res, next) => coursesController.clearTimetable(req, res, next)
);
