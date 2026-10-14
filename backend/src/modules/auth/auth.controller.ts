import type { Request, Response, NextFunction } from "express";
import { authService, AuthError } from "./auth.service.js";

const COOKIE_NAME = "refreshToken";

function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/api/v1/auth",
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, studentId, password } = req.body;
      const result = await authService.registerStudent({
        name,
        email,
        studentId,
        password,
      });

      res.status(201).json(result);
    } catch (err: any) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
            requestId: req.headers["x-request-id"],
            details: err.details,
          },
        });
        return;
      }
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      res.status(200).json(result);
    } catch (err: any) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
            requestId: req.headers["x-request-id"],
          },
        });
        return;
      }
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await authService.login({
        email,
        password,
        ipAddress,
        userAgent,
      });

      setRefreshTokenCookie(res, result.refreshToken, result.expiresAt);

      res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err: any) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
            requestId: req.headers["x-request-id"],
          },
        });
        return;
      }
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await authService.refreshSession(refreshToken, ipAddress, userAgent);

      setRefreshTokenCookie(res, result.refreshToken, result.expiresAt);

      res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err: any) {
      clearRefreshTokenCookie(res);
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
            requestId: req.headers["x-request-id"],
          },
        });
        return;
      }
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      clearRefreshTokenCookie(res);

      res.status(200).json({
        message: "Successfully logged out.",
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
            requestId: req.headers["x-request-id"],
          },
        });
        return;
      }

      const user = await authService.getMe(req.user.id);
      res.status(200).json({ user });
    } catch (err: any) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
            requestId: req.headers["x-request-id"],
          },
        });
        return;
      }
      next(err);
    }
  }
}

export const authController = new AuthController();
