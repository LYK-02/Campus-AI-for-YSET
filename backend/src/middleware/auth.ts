import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: Role[];
  universityId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required to access this resource.",
        requestId: req.headers["x-request-id"],
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      sub: string;
      email: string;
      roles: Role[];
      universityId: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
      universityId: decoded.universityId,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: err.name === "TokenExpiredError" ? "Access token has expired." : "Invalid access token.",
        requestId: req.headers["x-request-id"],
      },
    });
  }
}

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
          requestId: req.headers["x-request-id"],
        },
      });
      return;
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
          requestId: req.headers["x-request-id"],
        },
      });
      return;
    }

    next();
  };
}
