import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers["x-request-id"];
  const id = typeof incomingId === "string" && incomingId.trim() ? incomingId : uuidv4();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
