import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./modules/health/health.router.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { coursesRouter, timetableRouter } from "./modules/courses/courses.router.js";
import { assignmentsRouter, materialsRouter, announcementsRouter } from "./modules/academic/academic.router.js";

export const app = express();

// Security headers
app.use(helmet());

// CORS configuration (allowlisted origin with credentials)
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  })
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser(env.COOKIE_SECRET));

// Request tracking & logging
app.use(requestIdMiddleware);
if (env.NODE_ENV !== "test") {
  app.use(morgan(":method :url :status :res[content-length] - :response-time ms [req-id: :res[x-request-id]]"));
}

// Root redirect / greeting
app.get("/", (_req, res) => {
  res.json({
    name: "YSET API",
    institution: "Yenepoya School of Technology (YSET)",
    docs: "/api/v1/health",
  });
});

// API v1 routes
app.use(`${env.API_PREFIX}/health`, healthRouter);
app.use(`${env.API_PREFIX}/auth`, authRouter);
app.use(`${env.API_PREFIX}/courses`, coursesRouter);
app.use(`${env.API_PREFIX}/timetable`, timetableRouter);
app.use(`${env.API_PREFIX}/assignments`, assignmentsRouter);
app.use(`${env.API_PREFIX}/materials`, materialsRouter);
app.use(`${env.API_PREFIX}/announcements`, announcementsRouter);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);
