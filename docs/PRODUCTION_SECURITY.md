# Campus AI — Production Security Requirements

**Document type:** Mandatory security baseline  
**System:** Campus AI university management platform and AI assistant  
**Applies to:** Identity, APIs, database, uploads, AI/RAG, infrastructure, operations  
**Status:** Baseline; validate against university policies, applicable law, and a formal threat model.

## 1. Security objectives

Campus AI must preserve:
- **Confidentiality:** users see only data they are authorized to access.
- **Integrity:** users cannot alter records, roles, assignments, or documents beyond their permissions.
- **Availability:** abuse, provider outages, and malformed input do not easily take down the service.
- **Accountability:** sensitive actions can be investigated through protected audit records.
- **Privacy:** collect, use, retain, and disclose only data required for defined purposes.

Security must be enforced server-side and at the data-access boundary. Frontend checks are usability features, not security controls.

## 2. Assets and threat model

### High-value assets
- Student and faculty identities, email addresses, profile data, and academic records.
- Password hashes, sessions, refresh tokens, verification tokens, and signing secrets.
- Courses, departments, assignments, grades, and private faculty/student documents.
- Uploaded files, extracted text, embeddings, chat histories, prompts, and AI responses.
- Database backups, logs, API keys, cloud credentials, and audit trails.

### Threat actors and common threats
- Unauthenticated internet users and automated credential-stuffing bots.
- Authenticated students attempting horizontal privilege escalation.
- Compromised faculty/admin accounts.
- Malicious or compromised uploaded documents and prompt-injection content.
- Vulnerable dependencies, misconfigured infrastructure, insider misuse, and accidental data leakage.
- Denial of service and uncontrolled AI-provider cost consumption.

Maintain a living threat model covering data flows, trust boundaries, abuse cases, mitigations, and residual risks. Revisit it after major architecture or data-scope changes.

## 3. Identity and account lifecycle

### Student registration policy
- Self-registration is available only to students.
- The server must validate and normalize the email, then enforce the exact domain `yenepoy.edu.in`. Reject lookalike domains such as `yenepoy.edu.in.attacker.com`, malformed addresses, and other domains.
- Use a well-tested email parser and compare the normalized domain as a complete domain label; do not use a simple substring match.
- Verify ownership of the email address with a single-use, high-entropy token delivered to that address.
- Verification tokens must expire, be stored hashed where practical, be single-use, and be invalidated after successful use or replacement.
- Email-domain membership alone is not proof of student status. If required by university policy, reconcile registration with an approved roster or administrator approval.
- Public registration must never accept a role from the client. New self-registered accounts receive only the approved student role and only after required verification/approval.

### Faculty and administrator accounts
- Faculty and admin accounts must be created through authorized provisioning or invitations.
- Invitations must be single-use, time-limited, auditable, and bound to the intended identity and role.
- Privileged roles require explicit approval and a recorded actor/reason.
- Require MFA for administrators and strongly recommend or require it for faculty based on university policy.
- Never allow a user to promote themselves by editing a profile, request body, JWT claim, or database-facing API field.

### Account recovery and lifecycle
- Password-reset responses must not reveal whether an email exists.
- Reset tokens must be high entropy, short-lived, single-use, and invalidated after use.
- Changing email, password, role, or MFA settings must require appropriate reauthentication and notification.
- Disable or suspend compromised, departed, or revoked accounts promptly.
- Account deactivation must revoke active sessions and refresh tokens.
- Define how graduation, staff departure, domain changes, and account disputes are handled.

## 4. Authentication and session security

Select one coherent architecture and document it.

### Preferred browser pattern
For a first-party web application, consider server-side sessions in cookies. If using JWT access tokens plus refresh sessions, use short-lived access tokens and rotating, revocable refresh sessions. JWTs are not automatically more secure than sessions.

Requirements:
- Passwords are hashed using Argon2id with parameters selected for the production environment; bcrypt may be used where Argon2id is unavailable, with a suitable work factor.
- Never store plaintext passwords or reversibly encrypted passwords.
- Never store long-lived bearer or refresh tokens in `localStorage`.
- Cookie-based sessions use `HttpOnly`, `Secure` in production, and an appropriate `SameSite` setting.
- Apply CSRF protections to cookie-authenticated state-changing requests where cross-site requests could carry credentials.
- Regenerate session identifiers after login and privilege changes.
- Rotate refresh tokens on use; detect reuse and revoke the affected token family/session.
- Enforce idle and absolute session lifetimes.
- Logout invalidates server-side sessions/refresh tokens; deleting client state alone is insufficient.
- Validate issuer, audience, expiry, not-before, signature algorithm, and key rotation for JWTs. Never accept an algorithm chosen by untrusted input.
- Keep signing keys in a secrets manager or protected environment configuration, not source control.
- Rate-limit authentication, verification, reset, and refresh endpoints.
- Use generic failure messages and introduce progressive throttling or bot defenses proportionate to risk.
- Do not log passwords, one-time codes, tokens, session IDs, cookies, or authorization headers.

## 5. Authorization and access control

Use deny-by-default role-based access control combined with resource-level authorization.

### Baseline roles
- `STUDENT`
- `FACULTY`
- `ADMIN`

Roles are not sufficient by themselves. Access also depends on ownership, enrollment, department/course scope, assignment, visibility, and record state.

### Required authorization rules
- Centralize permission checks and use them on every protected server route/service.
- Check permissions for every read, create, update, delete, export, download, and AI retrieval operation.
- A student can access only their own private profile, chats, submissions, and private documents, plus explicitly published course/university content.
- Faculty access is limited to assigned courses and approved department scopes.
- Admin permissions must be granular where practical; not every admin needs unrestricted access to every sensitive record.
- Never trust client-provided `userId`, `ownerId`, `role`, `departmentId`, `courseId`, `visibility`, or `isAdmin`.
- Query only within the authorized scope. Prefer scoped database queries rather than fetching a broad record and relying on UI filtering.
- Return a consistent denial response that does not leak the existence or contents of another user's resource.
- Protect bulk export, search, list, and count endpoints against cross-scope disclosure.
- Re-check authorization in background jobs and immediately before sensitive side effects.
- Add automated tests for horizontal and vertical privilege escalation.

## 6. API and application security

- Validate all request inputs on the server with explicit schemas and length/range limits.
- Use parameterized queries and Prisma safely; never concatenate user-controlled SQL.
- Prevent mass assignment by mapping validated fields explicitly into updates.
- Use context-appropriate output encoding and safe rendering to prevent XSS.
- Configure a restrictive Content Security Policy and other appropriate security headers.
- Configure CORS with an explicit allowlist of trusted origins; never combine wildcard origins with credentials.
- Enforce HTTPS in production and redirect HTTP safely at the edge.
- Set request body, upload, and response limits; define timeouts and concurrency limits.
- Rate-limit by account, IP/network signal, and expensive operation where appropriate. Avoid trusting forwarded IP headers unless the proxy chain is configured correctly.
- Use CSRF defenses where cookie credentials are automatically attached.
- Do not expose stack traces, environment variables, SQL errors, provider errors, or internal paths in API responses.
- Restrict methods and content types; reject unexpected content types on sensitive endpoints.
- Prevent open redirects by allowlisting destination URLs.
- Use secure random generators for tokens and identifiers that must be unpredictable.
- Apply idempotency protection to sensitive or expensive repeated actions.
- Ensure production errors are handled by a centralized error handler.

## 7. Database and secrets

### Database
- Place the database on a private network; do not expose it directly to the public internet.
- Use separate credentials for development, migrations, and runtime where feasible.
- Runtime credentials should have only the permissions required by the application.
- Enforce TLS for database connections when supported by the deployment environment.
- Use foreign keys, unique constraints, and transactions to protect integrity.
- Encrypt storage and backups at rest using managed encryption where available.
- Restrict direct database access, log privileged access, and periodically review access.
- Test restore procedures, not just backup creation.
- Never copy production student data into development environments without approved minimization and de-identification.

### Secrets
- Store secrets in a managed secrets service or protected deployment environment.
- Never commit secrets, private keys, access tokens, or production `.env` files.
- Use separate secrets per environment and least-privilege credentials.
- Rotate secrets after suspected exposure and on a defined schedule appropriate to risk.
- Remove leaked secrets from active use immediately; deleting a Git commit does not invalidate a secret.
- Scan repositories, build logs, container images, and artifacts for accidental secrets.
- Keep AI provider keys exclusively on the server.

## 8. File upload and document processing

Treat every uploaded file as hostile.

- Allow only explicitly supported extensions and content types; neither extension nor client MIME type alone proves file safety.
- Enforce size, page count, decompressed size, processing-time, and per-user storage limits.
- Validate file signatures and parse with maintained libraries in a constrained worker/process.
- Generate storage names server-side; do not use user-supplied paths as filesystem paths.
- Store uploads in private object storage, outside the web root, with access controlled through the application.
- Use short-lived signed download URLs only after authorization, or stream files through an authorized service.
- Scan files for malware where feasible and quarantine suspicious uploads.
- Defend against path traversal, archive bombs, parser exploits, oversized PDFs, and malformed files.
- Do not render uploaded HTML or active content directly from the application's trusted origin.
- Extract text and generate embeddings in isolated, resource-limited jobs.
- Track processing state (`pending`, `processing`, `ready`, `failed`, `quarantined`) and prevent retrieval before processing and authorization are complete.
- On deletion, remove or schedule removal of the original object, extracted text, embeddings, cached copies, and derived chunks according to the retention policy.
- Log file lifecycle events without logging full document contents.

## 9. AI assistant, RAG, and prompt-injection security

AI is a probabilistic component, not a security authority.

### Data isolation
- Every document and chunk must carry access-control metadata, including owner, visibility, course/department scope, source, and deletion/version state.
- Apply access-control filters before similarity search where supported; do not retrieve globally and merely hide citations afterward.
- Re-check authorization for every retrieved chunk before adding it to a prompt or returning a citation.
- Keep separate retrieval scopes for personal documents, course content, and university-wide knowledge.
- Do not use a shared conversation or cache key that can mix users' private context.
- Ensure cache keys include the full authorization scope and relevant content version, or disable caching for sensitive outputs.
- Deleting/revoking a document must prevent future retrieval promptly and remove derived indexes according to the documented deletion process.

### Prompt injection and unsafe output
- Treat user prompts, uploaded documents, retrieved chunks, OCR output, and tool results as untrusted content.
- Clearly delimit retrieved text and instruct the model that document text is data, not privileged instructions. This is defense in depth, not a complete prompt-injection solution.
- Never place secrets or unnecessary private records in model context.
- Do not let model output directly execute SQL, shell commands, arbitrary URLs, code, or privileged tools.
- If tools are enabled, use explicit allowlists, strict argument schemas, server-side authorization, user confirmation for high-impact actions, and per-tool timeouts.
- The model must not determine user permissions or override application authorization.
- Render model output safely; sanitize Markdown/HTML and disallow unsafe active content.
- Test indirect prompt injection in PDFs, text files, and retrieved university documents.

### Grounding, privacy, and provider use
- Cite sources for policy and university-knowledge answers where feasible.
- If evidence is absent, contradictory, stale, or outside scope, say so and direct the user to an authoritative contact or document.
- Do not represent generated text as official university policy unless supported by an approved source.
- Obtain university approval for provider use, retention settings, data processing terms, data residency, and any use of student records.
- Minimize prompt content and redact unnecessary identifiers.
- Set per-user and global limits for requests, tokens, concurrency, and cost.
- Define provider timeouts, bounded retries, fallback behavior, and a safe degraded mode.
- Do not log raw prompts, full retrieved passages, or responses by default when they may contain personal or academic data. Use redacted metadata and controlled, time-limited diagnostic capture when approved.

## 10. Privacy and data governance

- Maintain a data inventory with purpose, owner, classification, access, retention, and deletion method.
- Collect only data required for a defined product or university purpose.
- Publish a clear privacy notice and obtain required approvals/consents before processing personal data.
- Define retention periods for accounts, chats, uploads, logs, audit events, and backups.
- Provide a documented process for access, correction, export, and deletion requests where required by policy and applicable law.
- Do not use student content for model training unless explicitly approved and lawfully disclosed.
- Restrict production-data access to authorized personnel and record sensitive administrative access.
- Redact or pseudonymize data in analytics and support workflows.
- Review applicable Indian law, university rules, contracts, and any requirements relating to minors or education records with qualified counsel/compliance staff. This document is an engineering baseline, not legal advice.

## 11. Audit logging and incident response

Record security-relevant events such as:
- Login success/failure and suspicious authentication activity.
- Verification, password reset, MFA, and session revocation.
- Role, permission, account status, and invitation changes.
- Administrative reads/exports of sensitive data where required.
- File upload, download, visibility changes, and deletion.
- Authorization denials and unusual bulk access.
- AI provider/configuration changes and privileged tool actions.

Audit requirements:
- Include timestamp, actor, action, target identifier, outcome, and request/correlation ID where appropriate.
- Do not include secrets, passwords, full tokens, or unnecessary document contents.
- Restrict audit-log reading and modification; application users must not be able to rewrite their own audit history.
- Define retention, integrity protection, access review, and alert thresholds.
- Synchronize clocks and use UTC timestamps.

Maintain an incident response plan covering detection, triage, containment, credential rotation, evidence preservation, recovery, communication, and post-incident review. Identify responsible contacts before launch. Test the plan periodically.

## 12. Availability and abuse prevention

- Apply per-user and global rate limits, with stricter limits for login, password reset, uploads, search, AI, exports, and expensive endpoints.
- Bound concurrent AI requests and file-processing jobs.
- Enforce timeouts, maximum retries, circuit breakers where justified, and provider spend alerts.
- Apply queue backpressure and reject overload safely.
- Use database connection pooling and protect against unbounded queries.
- Set upload and response size limits.
- Use backups, tested restore procedures, and documented recovery objectives.
- Protect administrative endpoints and public signup from automated abuse.
- Monitor error rates, saturation, unusual traffic, token usage, and spend.
- Avoid retry storms and unbounded loops.

## 13. Infrastructure and deployment

- Separate development, staging, and production networks, credentials, data, and service accounts.
- Deploy only reviewed, scanned, versioned artifacts.
- Run containers as non-root where applicable; use minimal base images and do not include development tools or secrets in production images.
- Patch operating systems, runtimes, frameworks, and dependencies on a defined schedule.
- Restrict inbound network access and use least-privilege service identities.
- Configure TLS, secure headers, DNS, and domain settings deliberately.
- Keep admin dashboards and database management tools private or strongly protected.
- Use infrastructure as code where practical and review changes.
- Enable dependency, container, and secret scanning in CI.
- Document rollback, migration, backup, and recovery steps.
- Do not expose detailed health diagnostics, metrics, or traces publicly.

## 14. Security testing and release gates

Before launch and after significant changes, test:
- Authentication and account recovery abuse.
- Role escalation and object-level authorization failures.
- IDOR/BOLA against IDs for chats, files, courses, assignments, and profiles.
- SQL injection, XSS, CSRF, CORS misconfiguration, SSRF, open redirects, and unsafe deserialization where relevant.
- File parser abuse, path traversal, oversized files, and decompression bombs.
- Rate-limit bypass and resource exhaustion.
- Prompt injection and unauthorized RAG retrieval.
- Secret leakage through frontend bundles, logs, errors, source maps, and build artifacts.
- Session revocation, logout, and token rotation.
- Backup restoration and account/data deletion flows.

Release blockers:
- Any unresolved critical security vulnerability.
- Any known high-severity vulnerability without explicit risk acceptance and compensating controls.
- Any demonstrated cross-user or cross-role data disclosure.
- Any secret committed to the repository or exposed in a deployed artifact.
- Any production endpoint that relies solely on frontend authorization.
- Any AI retrieval path that can expose content outside the caller's authorized scope.

Use an agreed severity model, assign owners and deadlines, and document any risk acceptance.

## 15. Security checklist for every feature

- [ ] What data does the feature read, write, infer, export, or send to a provider?
- [ ] Who is allowed to perform each action?
- [ ] Are authorization and ownership checked server-side for every resource?
- [ ] Are inputs validated and bounded?
- [ ] Can errors or logs disclose sensitive data?
- [ ] Are concurrency, retries, rate limits, and timeouts bounded?
- [ ] Does the feature introduce a new dependency, secret, endpoint, or trust boundary?
- [ ] Does AI context/retrieval obey document visibility and ownership?
- [ ] Are tests included for denial, abuse, and boundary cases?
- [ ] Are retention, deletion, audit, and operational recovery addressed?

## 16. Required pre-production deliverables

Do not launch until the responsible team has reviewed and accepted:
1. Data-flow diagram and threat model.
2. Role/permission matrix.
3. Authentication, session, and account-recovery design.
4. Data inventory and retention/deletion policy.
5. AI provider and data-processing approval.
6. File upload and retrieval security design.
7. Secrets management and environment separation.
8. Backup/restore and incident response runbooks.
9. Automated security test results and dependency scan results.
10. Known-risk register with owners, mitigations, and review dates.

## 17. Exceptions and ownership

Every exception must identify the exact requirement, reason, impacted data/systems, threat and risk, compensating controls, approver, owner, and expiry/review date. High-risk exceptions require explicit security-owner approval. Legal, contractual, and university requirements cannot be waived by an engineering exception.
