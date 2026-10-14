export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, code = "BAD_REQUEST", details?: unknown): AppError {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED"): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "Access denied", code = "FORBIDDEN"): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND"): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code = "CONFLICT", details?: unknown): AppError {
    return new AppError(message, 409, code, details);
  }

  static validation(message = "Validation failed", details?: unknown): AppError {
    return new AppError(message, 422, "VALIDATION_ERROR", details);
  }

  static tooManyRequests(message = "Rate limit exceeded", code = "RATE_LIMITED"): AppError {
    return new AppError(message, 429, code);
  }
}
