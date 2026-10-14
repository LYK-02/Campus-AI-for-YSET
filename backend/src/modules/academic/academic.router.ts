import { Router } from "express";
import { academicController } from "./academic.controller.js";
import { authenticate, requireRoles } from "../../middleware/auth.js";
import { Role } from "@prisma/client";

// Assignments Router
export const assignmentsRouter = Router();

assignmentsRouter.get("/", authenticate, (req, res, next) =>
  academicController.listAssignments(req, res, next)
);
assignmentsRouter.post(
  "/",
  authenticate,
  requireRoles(Role.FACULTY, Role.ADMIN),
  (req, res, next) => academicController.createAssignment(req, res, next)
);
assignmentsRouter.get("/:id", authenticate, (req, res, next) =>
  academicController.getAssignment(req, res, next)
);
assignmentsRouter.post("/:id/submit", authenticate, (req, res, next) =>
  academicController.submitAssignment(req, res, next)
);
assignmentsRouter.patch(
  "/submissions/:submissionId/grade",
  authenticate,
  requireRoles(Role.FACULTY, Role.ADMIN),
  (req, res, next) => academicController.gradeSubmission(req, res, next)
);

// Materials Router
export const materialsRouter = Router();

materialsRouter.get("/", authenticate, (req, res, next) =>
  academicController.listMaterials(req, res, next)
);
materialsRouter.post(
  "/",
  authenticate,
  requireRoles(Role.FACULTY, Role.ADMIN),
  (req, res, next) => academicController.createMaterial(req, res, next)
);
materialsRouter.delete(
  "/:id",
  authenticate,
  requireRoles(Role.FACULTY, Role.ADMIN),
  (req, res, next) => academicController.deleteMaterial(req, res, next)
);

// Announcements Router
export const announcementsRouter = Router();

announcementsRouter.get("/", authenticate, (req, res, next) =>
  academicController.listAnnouncements(req, res, next)
);
announcementsRouter.post(
  "/",
  authenticate,
  requireRoles(Role.FACULTY, Role.ADMIN),
  (req, res, next) => academicController.createAnnouncement(req, res, next)
);
announcementsRouter.delete(
  "/:id",
  authenticate,
  requireRoles(Role.FACULTY, Role.ADMIN),
  (req, res, next) => academicController.deleteAnnouncement(req, res, next)
);
