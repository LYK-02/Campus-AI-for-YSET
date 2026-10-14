# API Specification

## 1. General conventions

-   Base path: `/api/v1`.
-   JSON request/response by default; multipart form data for file
    upload.
-   HTTPS required in production.
-   Authentication required unless explicitly marked public.
-   Validate body, query, and route parameters.
-   Use pagination for list endpoints.
-   Return stable error codes and a request ID.
-   Do not expose stack traces, secrets, database internals, or
    sensitive account existence information.

Suggested success envelope (optional; use consistently):

``` json
{
  "data": {},
  "meta": {
    "requestId": "request-id"
  }
}
```

Suggested error envelope:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted fields.",
    "requestId": "request-id",
    "details": []
  }
}
```

HTTP status guidance: - `200` successful read/update. - `201` resource
created. - `202` accepted for asynchronous processing. - `204`
successful operation with no body. - `400` malformed request. - `401`
unauthenticated/invalid authentication. - `403` authenticated but not
authorized. - `404` missing or deliberately concealed resource. - `409`
conflict/duplicate state. - `413` upload too large. - `415` unsupported
media type. - `422` semantically invalid input if used consistently. -
`429` rate limit/quota exceeded. - `500` unexpected server error. -
`502`/`503` external provider unavailable.

## 2. Authentication endpoints

### POST `/auth/register`

Public, but creates STUDENT only.

Request:

``` json
{
  "name": "Example Student",
  "email": "student@yenepoy.edu.in",
  "password": "user-supplied-password"
}
```

Rules: - Normalize and validate the exact institutional domain. -
Validate name/password policy. - Reject duplicate normalized email
within the university. - Do not accept a role field. - Create a
pending/unverified account. - Hash password using Argon2id or bcrypt. -
Send a single-use email verification link. - Do not activate the account
until verification and eligibility rules pass.

Response should not expose password hashes or internal tokens. Return a
generic confirmation that explains next steps without exposing sensitive
account state.

### POST `/auth/login`

Request:

``` json
{
  "email": "student@yenepoy.edu.in",
  "password": "user-supplied-password"
}
```

Rules: - Apply domain validation. - Rate-limit attempts. - Verify
password and account status. - Require email verification if
configured. - Establish secure session or issue the configured
token/cookie strategy. - Return safe user profile data and role
memberships. - Do not return password hashes or refresh-token secrets.

### POST `/auth/logout`

Authenticated. Revoke current session/refresh session and clear cookies.
Return `204` where appropriate.

### GET `/auth/me`

Authenticated. Return current user profile, role memberships, university
membership, and safe account status.

### POST `/auth/refresh`

Only if refresh-session strategy is used. Rotate refresh token/session
and reject revoked, expired, or reused refresh tokens.

### POST `/auth/forgot-password`

Public, rate-limited, generic response. If account is eligible, send a
single-use, expiring reset token.

### POST `/auth/reset-password`

Public with valid reset token. Validate new password, consume token
atomically, and revoke relevant sessions.

### POST `/auth/verify-email`

Public with a valid single-use verification token. Consume token and
activate only if other eligibility checks pass.

## 3. Admin endpoints

-   `GET /admin/overview`
-   `GET|POST /departments`
-   `GET|PATCH|DELETE /departments/:departmentId`
-   `GET|POST /programs`
-   `GET|POST /academic-years`
-   `GET|POST /courses`
-   `GET|PATCH|DELETE /courses/:courseId`
-   `GET|POST /users`
-   `PATCH /users/:userId/status`
-   `POST /users/invitations`
-   `GET|POST /enrollments`
-   `GET|POST /teaching-assignments`
-   `GET /audit-logs`
-   `GET|PATCH /admin/ai-settings`

Every endpoint must verify admin permission and the applicable
university scope. Destructive operations should use explicit
confirmation and audit logging.

## 4. Faculty endpoints

-   `GET /faculty/courses`
-   `GET /courses/:courseId`
-   `GET|POST /courses/:courseId/materials`
-   `GET|POST /courses/:courseId/assignments`
-   `GET /assignments/:assignmentId/submissions`
-   `PATCH /submissions/:submissionId/feedback`
-   `POST /courses/:courseId/attendance-sessions`
-   `POST /attendance-sessions/:sessionId/records`
-   `POST /courses/:courseId/announcements`
-   `POST /ai/teaching-tools/generate`

Course assignment and ownership must be checked on every request.

## 5. Student endpoints

-   `GET /student/dashboard`
-   `GET /student/courses`
-   `GET /courses/:courseId/materials`
-   `GET /student/assignments`
-   `POST /assignments/:assignmentId/submissions`
-   `GET /student/announcements`
-   `GET /student/attendance`
-   `GET /student/progress`

Only return the current student's records and courses they are enrolled
in.

## 6. AI endpoints

-   `POST /ai/chats`
-   `GET /ai/chats`
-   `GET /ai/chats/:chatId`
-   `PATCH /ai/chats/:chatId` --- e.g. rename
-   `DELETE /ai/chats/:chatId`
-   `POST /ai/chats/:chatId/messages`
-   `POST /ai/uploads`
-   `GET /ai/uploads/:fileId`
-   `DELETE /ai/uploads/:fileId`
-   `POST /ai/messages/:messageId/feedback`

Example message request:

``` json
{
  "message": "Explain process synchronization using my course notes.",
  "mode": "MY_COURSES",
  "sourceIds": []
}
```

Rules: - `mode` must be an enum, not an arbitrary prompt override. -
Verify chat ownership before reading or writing messages. - Verify
access to every source ID. - Do not accept arbitrary storage paths from
clients. - Apply request length, rate, and usage limits. - Save messages
and usage metadata according to retention rules. - Stream responses only
after authorization and quota checks. - Return citations as structured
source objects, e.g. source title and page number, not fabricated
citation strings.

## 7. Materials and uploads

-   `POST /materials` or `/ai/uploads` accepts multipart upload or a
    controlled signed-upload workflow.
-   Server validates size, extension, MIME, signature, ownership, quota,
    and visibility.
-   `GET` endpoints authorize every download.
-   Deletion removes/queues deletion of original file and derived
    chunks/embeddings.
-   Use asynchronous processing status for long-running extraction.

## 8. Pagination, sorting, filtering

Use a consistent scheme such as:
`?page=1&pageSize=20&sort=createdAt:desc`

Enforce maximum page size. Whitelist sortable/filterable fields; never
interpolate raw user-provided sort strings into SQL.

## 9. API versioning and compatibility

-   Use `/api/v1`.
-   Make additive changes backward-compatible where possible.
-   Deprecate fields before removing them.
-   Update OpenAPI docs and tests in the same pull request.
-   Keep frontend and backend types/contracts synchronized.
