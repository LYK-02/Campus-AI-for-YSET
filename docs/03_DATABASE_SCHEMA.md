# Database Schema and Data Rules

## 1. Database principles

-   PostgreSQL is the source of truth for users, courses, enrollments,
    assignments, submissions, chat metadata, and authorization
    relationships.
-   Use Prisma migrations; do not edit production schema manually.
-   Use foreign keys, unique constraints, check constraints where
    appropriate, and indexes for query patterns.
-   Store timestamps in UTC; convert to local timezone in the UI.
-   Prefer explicit status enums over arbitrary strings.
-   Store uploaded file bytes in private object storage, not in ordinary
    relational columns.
-   Store only metadata and storage keys in PostgreSQL.
-   Never rely on a client-provided `userId`, `universityId`, or role
    for authorization.
-   For a single-institution MVP, retain `universityId` on tenant-owned
    records where it makes isolation explicit and future
    multi-institution support possible.

## 2. Core entities

### University

-   `id`, `name`, `emailDomain`, `settings`, `createdAt`, `updatedAt`.
-   Domain should be normalized and configured by an authorized
    operator.
-   Do not treat `emailDomain` as proof of enrollment.

### User

-   `id`, `universityId`, `name`, `emailNormalized`, `passwordHash` if
    local auth, `status`, `emailVerifiedAt`, timestamps.
-   Unique constraint on `(universityId, emailNormalized)`.
-   If using an external identity provider, store a stable provider
    subject in a separate identity mapping rather than assuming email is
    immutable.

### UserRole

-   `userId`, `role`.
-   Role enum: `ADMIN`, `FACULTY`, `STUDENT`.
-   Public registration may only create a `STUDENT` role.
-   Role grants must be authorized and audited.

### AuthSession

-   `id`, `userId`, hashed refresh token or opaque session identifier,
    `expiresAt`, `revokedAt`, `createdAt`, optional device metadata.
-   Never store a raw refresh token.
-   Rotate refresh tokens on use if that strategy is selected.

### VerificationToken / PasswordResetToken

-   Store a cryptographic hash of the token, user reference, expiration,
    consumed timestamp, and creation time.
-   Tokens are single-use and expire quickly.
-   Do not store raw reset/verification tokens in the database.

### Department / Program / AcademicYear / Term / Section

-   University-owned academic structure.
-   Use stable IDs, codes, names, active status, and appropriate unique
    constraints scoped to university.
-   Terms belong to an academic year; sections belong to a course
    offering or equivalent.

### Course / CourseOffering

Distinguish a reusable catalog course from a particular course run when
the model needs multiple terms/sections: - `Course`: code, name,
description, department, credits. - `CourseOffering`: course, term,
section, capacity/status. - If MVP simplicity requires a single `Course`
record per term, document the trade-off and avoid an unplanned redesign
later.

### Enrollment

-   Student and course offering relationship, status, enrollment date.
-   Unique constraint such as `(studentId, courseOfferingId)`.
-   Validate student role and matching university before insertion.

### TeachingAssignment

-   Faculty and course offering relationship.
-   Unique constraint on `(facultyId, courseOfferingId)` unless
    co-teaching rules require more detail.
-   Validate faculty role and university scope.

### Material

-   `id`, `universityId`, `ownerId`, optional `courseOfferingId`,
    `storageKey`, `originalFilename`, `mimeType`, `sizeBytes`,
    `checksum`, `visibility`, `processingStatus`, timestamps.
-   Visibility should be an enum such as `PRIVATE`, `COURSE`,
    `UNIVERSITY`.
-   Access is not granted by visibility alone: role, enrollment, course
    assignment, and university checks still apply.
-   Use generated storage keys; do not use untrusted filenames as paths.

### DocumentChunk

-   `id`, `materialId`, `chunkIndex`, `text`, optional `pageNumber`,
    optional embedding vector, metadata.
-   Unique constraint on `(materialId, chunkIndex)`.
-   Include appropriate indexes for vector similarity and metadata
    filters.
-   Filter retrieval by authorized material IDs or tenant scope before
    returning content.

### Chat / Message

-   `Chat`: `id`, `userId`, `universityId`, `title`, `mode`, timestamps,
    optional deletedAt.
-   `Message`: `id`, `chatId`, `role`, `content`, `createdAt`, optional
    usage metadata and status.
-   Role enum should distinguish `USER`, `ASSISTANT`, and optionally
    internal tool/system records without exposing internal prompts.
-   A chat belongs to one user. Every read, update, delete, and message
    operation checks ownership.
-   Keep provider secrets, hidden prompts, and raw internal reasoning
    out of messages.

### Assignment / Submission

-   Assignment includes course offering, creator, title, instructions,
    due date, max marks, status.
-   Submission includes assignment, student, storage key or text,
    status, submittedAt, feedback/grade fields with access rules.
-   Unique constraint `(assignmentId, studentId)` if only one current
    submission is supported.
-   If resubmissions are allowed, use a separate `SubmissionAttempt`
    model or versioned submissions.

### Attendance

-   AttendanceSession: course offering, session date, creator.
-   AttendanceRecord: session, student, status, recordedAt.
-   Unique constraint `(sessionId, studentId)`.
-   Validate that the student is enrolled and the faculty member can
    manage that course.

### Announcement

-   `id`, `universityId`, optional course offering, creator, title,
    body, publishAt, expiresAt, status.
-   Authorization and visibility depend on scope.

### AuditLog / AIUsageLog

-   Audit log: actor, action, entity type/id, timestamp, request ID,
    safe metadata.
-   AI usage log: user, university, provider/model, input/output usage
    if available, latency, status, estimated cost.
-   Avoid storing passwords, raw tokens, full sensitive prompts, or
    private document content unnecessarily.

## 3. Suggested Prisma schema baseline

This is an illustrative starting point, not a complete production
schema. Add all required models, indexes, constraints, and migrations as
modules are implemented.

``` prisma
enum Role {
  ADMIN
  FACULTY
  STUDENT
}

enum UserStatus {
  PENDING
  ACTIVE
  SUSPENDED
  DISABLED
}

enum MaterialVisibility {
  PRIVATE
  COURSE
  UNIVERSITY
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  READY
  FAILED
}

enum ChatMode {
  GENERAL
  MY_DOCUMENTS
  MY_COURSES
  UNIVERSITY_KNOWLEDGE
}

enum MessageRole {
  USER
  ASSISTANT
}

model University {
  id          String   @id @default(cuid())
  name        String
  emailDomain String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
  departments Department[]
  courses     Course[]
}

model User {
  id              String     @id @default(cuid())
  universityId    String
  name            String
  emailNormalized String
  passwordHash    String?
  status          UserStatus @default(PENDING)
  emailVerifiedAt DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  university University @relation(fields: [universityId], references: [id])
  roles      UserRole[]
  sessions   AuthSession[]
  chats      Chat[]

  @@unique([universityId, emailNormalized])
  @@index([universityId, status])
}

model UserRole {
  userId String
  role   Role
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, role])
}

model AuthSession {
  id               String   @id @default(cuid())
  userId           String
  refreshTokenHash String?
  expiresAt        DateTime
  revokedAt        DateTime?
  createdAt        DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
}

model Department {
  id           String @id @default(cuid())
  universityId String
  name         String
  code         String
  university   University @relation(fields: [universityId], references: [id])

  @@unique([universityId, code])
}

model Course {
  id           String @id @default(cuid())
  universityId String
  departmentId String
  code         String
  name         String
  credits      Int?
  university   University @relation(fields: [universityId], references: [id])
  department   Department @relation(fields: [departmentId], references: [id])

  @@unique([universityId, code])
}

model Chat {
  id           String   @id @default(cuid())
  userId       String
  universityId String
  title        String   @default("New chat")
  mode         ChatMode @default(GENERAL)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId, updatedAt])
  @@index([universityId, updatedAt])
}

model Message {
  id        String      @id @default(cuid())
  chatId    String
  role      MessageRole
  content   String
  createdAt DateTime    @default(now())

  chat Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)

  @@index([chatId, createdAt])
}
```

Before using this schema, add missing relations and models for course
offerings, enrollments, teaching assignments, materials, document
chunks, assignments, submissions, announcements, verification tokens,
reset tokens, and audit logs. If using pgvector, configure Prisma and
PostgreSQL support consistently with the selected versions.

## 4. Data access rules

-   Derive `userId` from the authenticated identity.
-   Derive or verify `universityId` from the authenticated user's
    membership.
-   Every tenant-owned query must include the tenant boundary.
-   Course material access checks course assignment/enrollment or
    explicit university-public visibility.
-   Private uploads are visible only to their owner and explicitly
    authorized services.
-   A user's chat queries must include `chat.userId = currentUser.id`.
-   Admin cross-user access should be explicitly permissioned and
    audited; do not make it implicit for all admin actions.
-   Never rely only on frontend route protection.
-   Consider PostgreSQL row-level security for defense in depth if the
    team can test and maintain its policies correctly.

## 5. Migration and seed rules

-   Commit every Prisma migration.
-   Run migrations in CI against a clean test database.
-   Use forward-only, reviewed production migrations.
-   Back up before risky schema changes.
-   Avoid destructive migrations in the same release that still requires
    old columns.
-   Seed only synthetic demo data; do not seed real passwords or real
    student data.
-   Create the initial admin through a secure one-time process, not a
    public seed endpoint.
