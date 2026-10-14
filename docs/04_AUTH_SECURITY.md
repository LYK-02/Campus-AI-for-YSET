# Authentication, Authorization, and Security Rules

## 1. Institutional email policy

Accepted domain: `yenepoya.edu.in` (confirmed official Yenepoya domain).

Rules: 1. Trim whitespace and lowercase the email before comparison. 2.
Require the exact suffix `@yenepoya.edu.in`; reject lookalike domains
such as `yenepoya.edu.in.attacker.example`. 3. Validate server-side on
registration and login. Frontend validation is for user experience only.
4. Verify mailbox ownership using a short-lived, single-use token. 5. If
needed, cross-check a student roster or invitation list; domain
ownership alone does not prove enrollment. 6. Public signup can assign
only `STUDENT`. 7. Faculty and admin accounts are provisioned by
authorized invitation or controlled setup. 8. Apply policy to existing
accounts and account recovery. 9. Avoid returning messages that reveal
whether an email is registered.

Example validation logic:

``` ts
export function isAllowedInstitutionalEmail(input: unknown): input is string {
  if (typeof input !== "string") return false;
  const email = input.trim().toLowerCase();
  if (email.length > 254) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith(".") ||
      local.endsWith(".") || local.includes("..")) return false;

  // Use a mature email validation library for full syntax validation.
  return domain === "yenepoya.edu.in";
}
```

Do not attempt to fully validate email syntax with a huge hand-written
regular expression. Use a well-maintained validation library plus exact
domain comparison.

## 2. Authentication strategy

Choose one primary approach:

### A. Server-side sessions

-   Server creates an unpredictable session ID.
-   Store session state in a shared session store for production.
-   Browser receives an HttpOnly, Secure cookie.
-   Logout revokes the server-side session.
-   Protect state-changing requests against CSRF.
-   Use session rotation after login and privilege changes.

### B. Short-lived JWT + refresh sessions

-   Access JWT has a short lifetime, for example 10--15 minutes,
    selected based on risk.
-   Validate signature, allowed algorithm, issuer, audience, expiration,
    and token purpose.
-   Refresh token/session is tracked server-side and stored hashed where
    feasible.
-   Rotate refresh tokens and detect reuse.
-   Revoke sessions on logout, account suspension, password reset, and
    security events.
-   Avoid long-lived access tokens with no revocation path.

For a browser application, prefer HttpOnly Secure cookies over
persistent tokens in localStorage. Never place tokens in URLs or logs.
Do not implement custom cryptography.

## 3. Passwords and recovery

-   Use Argon2id or bcrypt with an appropriate current work factor.
-   Never store plaintext passwords or reversible password encryption.
-   Rate-limit login and reset endpoints.
-   Use generic responses for password recovery.
-   Reset tokens must be random, single-use, short-lived, stored hashed,
    and invalidated after use.
-   Do not log reset tokens.
-   Consider revoking all existing sessions after password reset.
-   Require reauthentication for sensitive account changes.
-   Use a breached-password check if feasible and a reasonable length
    policy; do not rely on arbitrary composition rules alone.

## 4. Role and resource authorization

Roles: `ADMIN`, `FACULTY`, `STUDENT`.

-   Authentication middleware identifies the current user.
-   Authorization middleware checks allowed actions.
-   Service/data-access logic checks ownership and relationships.
-   Admin operations require explicit admin permission and should be
    audited.
-   Faculty access is scoped to assigned courses/sections.
-   Students access their own records and enrolled courses.
-   Student chats and private uploads are always user-scoped.
-   A user cannot grant their own roles by changing request JSON.
-   UI hiding is not authorization.
-   Test object-level authorization (IDOR/BOLA) for every endpoint
    accepting an object ID.

## 5. Web security baseline

-   HTTPS in production.
-   Secure cookie settings and appropriate SameSite policy.
-   CSRF defense for cookie-authenticated state-changing requests.
-   CORS allowlist limited to known frontend origins.
-   Helmet or equivalent security headers.
-   Request body and upload size limits.
-   Input validation and safe output rendering.
-   Parameterized database access through Prisma.
-   Rate limiting on authentication and AI endpoints.
-   Dependency scanning and regular updates.
-   No secrets in source control, frontend bundles, error messages, or
    logs.
-   Central error handling with safe user-facing messages.
-   Content Security Policy appropriate to the frontend.
-   Avoid unsafe HTML rendering of AI responses; sanitize/render
    Markdown safely.

## 6. File upload security

-   Allowlist supported types and validate file signature, not just
    extension or client MIME.
-   Set per-file and per-user size limits.
-   Use generated storage keys, not raw user-supplied paths.
-   Store files in private buckets/containers.
-   Use short-lived signed URLs or authorized download endpoints.
-   Scan files for malware where available.
-   Process files in a constrained worker with timeouts and memory
    limits.
-   Do not execute uploaded files.
-   Prevent path traversal and archive/decompression bombs.
-   Treat extracted text as untrusted content.
-   Delete original files, chunks, and embeddings according to
    deletion/retention rules.
-   Do not expose a public object URL as the sole authorization
    mechanism.

## 7. AI security and privacy

-   Never send unrelated student data to the AI provider.
-   Retrieve only material the requesting user is allowed to access.
-   Treat uploaded document text as untrusted input; prompt injection in
    a document must not override system policy.
-   Keep system prompts and provider credentials server-side.
-   Do not let the model directly execute privileged actions or issue
    database queries.
-   Any action proposed by AI must pass normal service authorization and
    validation.
-   Use explicit source citations for university-specific claims.
-   The model must admit when approved source content is missing or
    conflicting.
-   Avoid sending sensitive data unless necessary and permitted.
-   Review provider retention, training, residency, and contractual
    settings before production.
-   Give users a clear policy for chat retention and deletion.
-   Do not use AI outputs alone for high-impact grading or disciplinary
    decisions.

## 8. Logging and monitoring

Log: - Authentication success/failure events, without
passwords/tokens. - Role grants and account state changes. -
Administrative configuration changes. - Access denials and suspicious
patterns. - AI provider status, latency, usage, and cost metadata. -
File-processing errors and job status.

Do not log: - Passwords, raw session/refresh/reset tokens, API keys. -
Full sensitive documents by default. - Unnecessary personal data. -
Hidden model prompts or private data in general application logs.

Protect audit logs from unauthorized modification and define retention
periods.

## 9. Production security gate

Before launch: - Threat-model login, role changes, file upload, chat
retrieval, and admin provisioning. - Test domain enforcement and email
verification. - Test role escalation and object-level access controls. -
Test session expiry/revocation and CSRF/CORS settings. - Test upload
validation and private download authorization. - Scan dependencies and
secrets. - Confirm backups and restore procedures. - Document incident
response and credential rotation. - Review privacy obligations with the
institution.
