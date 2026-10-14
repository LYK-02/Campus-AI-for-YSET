import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (req: Request, res: Response) => {
  let dbStatus = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "disconnected";
  }

  res.status(200).json({
    status: "ok",
    service: "campus-ai-api",
    institution: "Yenepoya School of Technology (YSET)",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    requestId: req.id,
  });
});
