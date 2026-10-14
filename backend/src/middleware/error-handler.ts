import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-error.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.id || "unknown";

  // AppError (Known operational domain errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    });
    return;
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const issues = (err as any).issues || (err as any).errors || [];
    const details = issues.map((e: { path: (string | number)[]; message: string }) => ({
      field: Array.isArray(e.path) ? e.path.join(".") : String(e.path || ""),
      message: e.message,
    }));

    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check the submitted fields.",
        requestId,
        details,
      },
    });
    return;
  }

  // SyntaxError in JSON body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      error: {
        code: "MALFORMED_JSON",
        message: "Malformed JSON payload provided.",
        requestId,
      },
    });
    return;
  }

  // Unexpected Server Errors
  console.error(`[${requestId}] Unexpected Error:`, err);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected internal server error occurred.",
      requestId,
      ...(env.NODE_ENV === "development" && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
