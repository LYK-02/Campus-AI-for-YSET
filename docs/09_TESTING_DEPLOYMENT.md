# Testing, Deployment, Operations, and Production Rules

## 1. Testing strategy

### Unit tests

Test: - Institutional email validation. - Password and token utility
behavior. - Role and permission functions. - Enrollment and assignment
rules. - AI mode/source validation. - File type/size policy. - Quota and
rate-limit logic.

### Integration tests

Use a test database and test external adapters where possible: -
Register, verify, login, logout, and reset password. - Create
department/course and assign faculty. - Enroll student and verify course
access. - Upload material and authorize download. - Create assignment
and submit work. - Create chat, save messages, and retrieve only owned
chats. - Retrieve only authorized document chunks. - Handle provider
timeout and malformed responses.

### End-to-end tests

Test the main user journeys: 1. Admin provisions faculty and creates a
course. 2. Faculty uploads material and creates assignment. 3. Student
registers with institutional email and verifies mailbox. 4. Student logs
in and sees only enrolled courses. 5. Student asks AI about authorized
notes. 6. Faculty reviews a submission. 7. Admin sees allowed aggregate
metrics.

### Security tests

-   Non-institutional email bypass attempts.
-   Public role escalation.
-   IDOR/BOLA by changing IDs.
-   Cross-university access attempts.
-   Expired/revoked session use.
-   CSRF and CORS configuration.
-   Brute-force/rate-limit behavior.
-   File spoofing, oversized uploads, path traversal, archive bombs.
-   Prompt injection and source leakage.
-   SQL injection/XSS regression cases.
-   Secret scanning and dependency scanning.

## 2. Test data

-   Use synthetic users, courses, PDFs, assignments, and grades.
-   Do not use real student records in local or CI environments.
-   Use separate test credentials and providers.
-   Keep test reset routines isolated from staging/production.
-   Never include a real administrator password in a seed file.

## 3. CI pipeline

Suggested pipeline: 1. Install dependencies with lockfile. 2. Lint. 3.
Typecheck. 4. Unit tests. 5. Integration tests with isolated test
database. 6. Prisma migration validation. 7. Build frontend and backend.
8. Dependency and secret scan. 9. Publish deployable artifact only after
required checks pass.

Protect main branch and require review for auth, permissions,
migrations, storage, and AI retrieval changes.

## 4. Deployment topology

-   Frontend served over HTTPS.
-   API served over HTTPS.
-   Managed PostgreSQL with private networking where available.
-   Private object storage.
-   Email delivery provider.
-   AI provider access from backend only.
-   Optional worker process for document ingestion.
-   Optional Redis for shared sessions, queues, and distributed rate
    limits.

Keep staging and production isolated. Use separate databases, storage
buckets, email settings, AI keys, and domains.

## 5. Production environment checklist

-   All secrets provided through a secret manager or secure environment
    configuration.
-   Startup validates required configuration.
-   HTTPS enforced.
-   CORS allowlist restricted to expected origins.
-   Cookies configured with Secure/HttpOnly and appropriate SameSite
    behavior.
-   CSRF protection configured where needed.
-   Database migrations reviewed and applied through release process.
-   Storage is private by default.
-   Upload limits and AI quotas configured.
-   Admin bootstrap path disabled after setup.
-   Logging and monitoring enabled.
-   Backups configured and restore tested.
-   Error responses do not reveal internals.
-   Synthetic demo data only.
-   Privacy notice and retention policy approved.

## 6. Database backups and recovery

-   Define recovery point objective (RPO) and recovery time objective
    (RTO) with the project owner.
-   Configure automated backups and point-in-time recovery if supported.
-   Test restore into a separate environment on a schedule.
-   Back up configuration and document recovery steps securely.
-   Treat backups as sensitive data.
-   Define retention and deletion for expired chats, files, embeddings,
    and logs.
-   Never assume a backup is valid without a restore test.

## 7. Monitoring and alerts

Track: - API availability and latency. - Error rate and failed
background jobs. - Database connection saturation and slow queries. -
Login failure spikes and suspicious access denials. - AI provider
latency, failures, usage, and cost. - File processing failures and
storage capacity. - Email delivery failure. - Backup success and restore
test status.

Use request IDs for correlation. Avoid collecting full message contents
or private documents in logs unless a reviewed operational need exists.

## 8. Incident response

Prepare a short runbook: 1. Detect and classify the incident. 2. Contain
access or disable affected feature/provider. 3. Revoke compromised
sessions/keys when applicable. 4. Preserve relevant safe audit evidence.
5. Assess data access and affected users. 6. Notify responsible
university contacts according to policy and applicable law. 7. Restore
safe service. 8. Document root cause and follow-up actions.

## 9. Release checklist

### Product

-   [ ] MVP acceptance criteria pass.
-   [ ] Role-specific workflows work.
-   [ ] Empty, loading, error, and unauthorized states are present.

### Security

-   [ ] Domain validation is server-side.
-   [ ] Email verification is enforced.
-   [ ] No public privileged-role creation.
-   [ ] Cross-user and cross-tenant access tests pass.
-   [ ] Private storage and AI retrieval permissions are verified.
-   [ ] Secrets/dependency scans pass.
-   [ ] Session revocation and password recovery are tested.

### Operations

-   [ ] Production environment variables are set.
-   [ ] Migrations are reviewed.
-   [ ] Backup and restore are tested.
-   [ ] Monitoring and alerts are active.
-   [ ] Provider quotas and cost limits are configured.
-   [ ] Incident and rollback/forward-fix plans exist.

### Documentation

-   [ ] README setup instructions are current.
-   [ ] API docs are updated.
-   [ ] ADRs document significant decisions.
-   [ ] Operator runbook is available.
-   [ ] Demo accounts and records are synthetic.

## 10. Production rule

A successful build is not the same as a production-ready service. Do not
launch with unresolved critical security issues, untested backups,
unbounded AI spending, public file storage, or missing authorization
checks.
