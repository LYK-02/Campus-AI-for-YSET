import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function isAllowedInstitutionalEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.endsWith(`@${env.INSTITUTION_DOMAIN}`);
}

export class AuthService {
  /**
   * Register a new student account
   */
  async registerStudent(params: {
    name: string;
    email: string;
    studentId: string;
    password: string;
  }) {
    const { name, email, studentId, password } = params;

    // Validate email domain
    const emailNormalized = email.trim().toLowerCase();
    if (!isAllowedInstitutionalEmail(emailNormalized)) {
      throw new AuthError(
        "INVALID_DOMAIN",
        `Registration is strictly restricted to institutional accounts ending in @${env.INSTITUTION_DOMAIN}`,
        400,
        [{ field: "email", message: `Must end with @${env.INSTITUTION_DOMAIN}` }]
      );
    }

    // Validate mandatory Student ID / Roll ID
    const trimmedStudentId = studentId.trim();
    if (!trimmedStudentId) {
      throw new AuthError(
        "MISSING_STUDENT_ID",
        "Student Registration / Roll ID is mandatory.",
        400,
        [{ field: "studentId", message: "Student Registration / Roll ID is required" }]
      );
    }

    // Password requirements
    if (password.length < 8) {
      throw new AuthError(
        "WEAK_PASSWORD",
        "Password must be at least 8 characters long.",
        400,
        [{ field: "password", message: "Password must be at least 8 characters long" }]
      );
    }

    // Find University
    const university = await prisma.university.findFirst({
      where: { emailDomain: env.INSTITUTION_DOMAIN },
    });

    if (!university) {
      throw new AuthError(
        "UNIVERSITY_NOT_CONFIGURED",
        "University institutional profile is not configured.",
        500
      );
    }

    // Check duplicate email
    const existingEmail = await prisma.user.findFirst({
      where: { universityId: university.id, emailNormalized },
    });

    if (existingEmail) {
      throw new AuthError(
        "EMAIL_EXISTS",
        "An account with this institutional email already exists.",
        409,
        [{ field: "email", message: "Email is already registered" }]
      );
    }

    // Check duplicate studentId
    const existingStudentId = await prisma.user.findFirst({
      where: { universityId: university.id, studentId: trimmedStudentId },
    });

    if (existingStudentId) {
      throw new AuthError(
        "STUDENT_ID_EXISTS",
        "An account with this Student Registration / Roll ID already exists.",
        409,
        [{ field: "studentId", message: "Student ID is already registered" }]
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in PENDING status
    const user = await prisma.user.create({
      data: {
        universityId: university.id,
        name: name.trim(),
        emailNormalized,
        studentId: trimmedStudentId,
        passwordHash,
        status: UserStatus.PENDING,
        roles: {
          create: [{ role: Role.STUDENT }],
        },
      },
      include: {
        roles: true,
      },
    });

    // Create single-use verification token (expires in 24 hours)
    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawVerificationToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Simulated email delivery (logged to server console in dev)
    const verificationUrl = `${env.CLIENT_ORIGIN}/verify-email?token=${rawVerificationToken}`;
    console.log(`\n======================================================`);
    console.log(`✉️ [EMAIL DISPATCH] Verification Link for ${user.emailNormalized}`);
    console.log(`🔗 Link: ${verificationUrl}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
    console.log(`======================================================\n`);

    return {
      message: "Student account created successfully. Please check your institutional email to verify your address.",
      user: {
        id: user.id,
        name: user.name,
        email: user.emailNormalized,
        studentId: user.studentId,
        status: user.status,
      },
    };
  }

  /**
   * Verify email address using token
   */
  async verifyEmail(rawToken: string) {
    if (!rawToken || typeof rawToken !== "string") {
      throw new AuthError("INVALID_TOKEN", "Verification token is required.", 400);
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new AuthError("TOKEN_EXPIRED", "Verification link is invalid or has expired.", 400);
    }

    // Mark token used
    await prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    // Mark email verified
    const updatedUser = await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        emailVerifiedAt: new Date(),
        // Keep status PENDING for administrative approval if required, or ACTIVE
        status: UserStatus.ACTIVE,
      },
    });

    return {
      message: "Email verified successfully. Your account is now active.",
      user: {
        id: updatedUser.id,
        email: updatedUser.emailNormalized,
        emailVerifiedAt: updatedUser.emailVerifiedAt,
      },
    };
  }

  /**
   * Authenticate user with email and password
   */
  async login(params: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { email, password, ipAddress, userAgent } = params;
    const emailNormalized = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { emailNormalized },
      include: {
        roles: true,
        university: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AuthError("INVALID_CREDENTIALS", "Invalid institutional email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AuthError("INVALID_CREDENTIALS", "Invalid institutional email or password.", 401);
    }

    // Email verification check
    if (!user.emailVerifiedAt) {
      throw new AuthError(
        "EMAIL_NOT_VERIFIED",
        "Your institutional email has not been verified yet. Please check your inbox for the activation link.",
        403
      );
    }

    // Account status check
    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthError("ACCOUNT_SUSPENDED", "Your account has been suspended. Please contact the YSET Administration.", 403);
    }

    if (user.status === UserStatus.DISABLED) {
      throw new AuthError("ACCOUNT_DISABLED", "Your account has been disabled. Please contact the YSET Administration.", 403);
    }

    // Generate access token (15 mins)
    const roles = user.roles.map((r) => r.role);
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.emailNormalized,
        roles,
        universityId: user.universityId,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );

    // Generate rotating refresh token (7 days)
    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.emailNormalized,
        roles,
        status: user.status,
        studentId: user.studentId,
        universityId: user.universityId,
        universityName: user.university.name,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  /**
   * Refresh session and rotate tokens
   */
  async refreshSession(rawRefreshToken: string, ipAddress?: string, userAgent?: string) {
    if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
      throw new AuthError("INVALID_REFRESH_TOKEN", "Refresh token is missing.", 401);
    }

    const refreshTokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

    const session = await prisma.authSession.findFirst({
      where: { refreshTokenHash },
      include: {
        user: {
          include: {
            roles: true,
            university: true,
          },
        },
      },
    });

    if (!session) {
      throw new AuthError("INVALID_REFRESH_TOKEN", "Session is invalid.", 401);
    }

    // Check if session has been revoked (Reuse detection)
    if (session.revokedAt) {
      // Security measure: Revoke all sessions for this user due to potential token theft
      await prisma.authSession.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new AuthError(
        "TOKEN_REUSE_DETECTED",
        "Security alert: Refresh token reuse detected. All sessions have been terminated.",
        401
      );
    }

    // Check expiry
    if (new Date() > session.expiresAt) {
      await prisma.authSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new AuthError("SESSION_EXPIRED", "Session has expired. Please log in again.", 401);
    }

    const user = session.user;
    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthError("ACCOUNT_INACTIVE", "User account is no longer active.", 403);
    }

    // Rotate refresh token
    const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRawRefreshToken).digest("hex");
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent,
      },
    });

    // Issue new access token
    const roles = user.roles.map((r) => r.role);
    const newAccessToken = jwt.sign(
      {
        sub: user.id,
        email: user.emailNormalized,
        roles,
        universityId: user.universityId,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      expiresAt: newExpiresAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.emailNormalized,
        roles,
        status: user.status,
        studentId: user.studentId,
        universityId: user.universityId,
        universityName: user.university.name,
      },
    };
  }

  /**
   * Revoke session on logout
   */
  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;
    const refreshTokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

    await prisma.authSession.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Get current authenticated user details
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        university: true,
      },
    });

    if (!user) {
      throw new AuthError("USER_NOT_FOUND", "User account not found.", 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.emailNormalized,
      roles: user.roles.map((r) => r.role),
      status: user.status,
      studentId: user.studentId,
      universityId: user.universityId,
      universityName: user.university.name,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }
}

export const authService = new AuthService();
