# Detailed Delivery Roadmap

## Delivery approach

Build a modular monolith and deliver vertical slices: each phase should
connect UI, API, database, permissions, tests, and documentation. Avoid
building every screen with mock data before connecting real workflows.

Estimated duration: approximately 15--20 focused development days for a
small MVP, depending on experience and scope. This is a planning
estimate, not a guarantee.

## Phase 0 --- Product and architecture decisions

### Tasks

-   Confirm exact institutional domain `yenepoya.edu.in`.
-   Confirm whether email verification alone is sufficient or a student
    roster/invitation is required.
-   Decide session-cookie vs JWT+refresh-session strategy.
-   Decide AI provider and acceptable budget/quotas.
-   Decide allowed upload types and size limits.
-   Define retention/deletion rules for chats and documents.
-   Create initial PRD, TRD, API and schema documents.
-   Record decisions in ADRs.

### Deliverables

-   Approved MVP scope.
-   Architecture diagram.
-   Initial schema plan.
-   Security assumptions and unresolved questions.

### Exit criteria

-   Team agrees on authentication, storage, AI provider, roles, and
    scope.
-   No production secrets or real student data in the repository.

## Phase 1 --- Repository and foundation (Days 1--2)

### Tasks

-   Create repository with `client/`, `server/`, `docs/`, and `tests/`.
-   Configure TypeScript, formatting, linting, and scripts.
-   Configure local PostgreSQL and Prisma.
-   Add `.env.example`, `.gitignore`, and startup validation.
-   Create health endpoint and centralized error handler.
-   Build shared layout, navigation, form components, and landing page.
-   Set up CI for lint, typecheck, test, and build.

### Deliverables

-   App runs locally from documented commands.
-   CI passes.
-   First migration can be applied to a clean database.

### Exit criteria

-   New developer can clone, configure, migrate, seed synthetic data,
    and run both apps.

## Phase 2 --- Authentication and access control (Days 3--4)

### Tasks

-   Implement exact institutional email domain validation.
-   Implement student registration and duplicate checking.
-   Hash passwords or integrate selected identity provider.
-   Implement email verification and token expiry/consumption.
-   Implement login, logout, `/auth/me`, password reset, and session
    lifecycle.
-   Implement controlled faculty/admin provisioning.
-   Add role middleware and resource-ownership checks.
-   Add protected frontend routes and role-aware redirects.
-   Add rate limits, safe errors, and audit events.

### Tests

-   Non-institutional email rejected on server.
-   Public registration cannot assign ADMIN/FACULTY.
-   Unverified/suspended users cannot access protected APIs.
-   Invalid/expired/reused reset tokens rejected.
-   Cross-user resource access denied.

### Exit criteria

-   Authentication and authorization tests pass; no role trust comes
    from client payloads.

## Phase 3 --- University administration (Days 5--7)

### Tasks

-   University profile/settings.
-   Departments and programs.
-   Academic years/terms.
-   Courses/course offerings/sections.
-   User provisioning.
-   Student enrollments.
-   Faculty assignments.
-   Search, pagination, form validation, audit logs.

### Tests

-   Duplicate codes rejected within the correct scope.
-   Cross-university assignments rejected.
-   Non-admin cannot mutate configuration.
-   Transactions preserve consistency during enrollment/assignment.

### Exit criteria

-   Admin can create a course and assign faculty and students using real
    database records.

## Phase 4 --- Faculty and student workflows (Days 8--10)

### Tasks

-   Faculty course list and detail pages.
-   Private material upload and authorized download.
-   Assignment creation and deadline rules.
-   Student assignment list and submission.
-   Faculty review and feedback.
-   Announcements.
-   Basic attendance only if time permits.
-   Student dashboard connected to real enrollments.

### Tests

-   Faculty can only manage assigned courses.
-   Student can only access enrolled course resources.
-   Submission rules and deadlines are enforced server-side.
-   Private uploads cannot be accessed by guessing URLs.

### Exit criteria

-   Faculty uploads material and creates an assignment; enrolled student
    sees the course and can submit work.

## Phase 5 --- AI chat (Days 11--12)

### Tasks

-   Create provider adapter and server-side API integration.
-   Implement chat CRUD and message persistence.
-   Add general study mode.
-   Add quotas, timeouts, safe errors, usage logging, and feedback.
-   Build history sidebar, streaming where supported, copy and
    regenerate.
-   Add deletion/retention behavior.

### Tests

-   Chat ownership enforced.
-   Provider errors do not corrupt history.
-   Message size and usage limits work.
-   API keys are never sent to the browser.
-   UI safely renders AI Markdown.

### Exit criteria

-   Authenticated student can create chats, ask questions, and revisit
    saved history.

## Phase 6 --- Document Q&A and RAG (Days 13--14)

### Tasks

-   Add private file storage.
-   Validate upload type/signature/size/quota.
-   Extract PDF text and page metadata.
-   Store processing status and document chunks.
-   Add embeddings/vector search if time permits.
-   Filter retrieval by authorized sources.
-   Return source citations.
-   Add retry and cleanup for failed processing jobs.

### Tests

-   Cross-user source retrieval is impossible.
-   Prompt injection in a document cannot change permissions.
-   Unanswerable questions return uncertainty.
-   Source references are generated from actual indexed metadata.
-   Deletion removes or schedules deletion of original and derived
    content.

### Exit criteria

-   Student asks a question about an uploaded/authorized document and
    receives an answer with valid source references when available.

## Phase 7 --- Quality, release, and demo (Days 15--20)

### Tasks

-   End-to-end tests for the full admin/faculty/student workflow.
-   Accessibility and responsive UI pass.
-   Security review and dependency/secret scans.
-   Production environment configuration.
-   Database migration and backup/restore rehearsal.
-   Configure monitoring, logs, alerts, quotas, and provider limits.
-   Deploy frontend, API, database, email, and private storage.
-   Prepare synthetic demo accounts and seed content.
-   Update README and operator runbook.

### Exit criteria

-   All critical acceptance criteria pass.
-   Staging smoke tests pass.
-   Restore procedure is documented and tested.
-   No known critical/high severity release-blocking security issue
    remains unresolved.
-   Demo uses synthetic records and provisioned accounts.

## Scope cuts if schedule is tight

Keep: 1. Authentication/domain policy. 2. Admin course and user
provisioning. 3. Faculty material upload. 4. Student course access. 5.
AI chat with document Q&A. 6. Ownership/role tests.

Defer: - Advanced attendance. - Predictive analytics. - Native apps. -
Calendar/SSO integrations. - Multi-provider AI routing. - Complex
timetable optimization. - Automated high-stakes grading.

## Release gates

Do not proceed to production if: - A student can access another
student's chat/file/submission. - Public registration can create
privileged roles. - Institutional domain enforcement exists only in the
frontend. - Secrets are committed or exposed in browser bundles. - AI
citations can be fabricated or unauthorized sources retrieved. -
Backup/restore and session revocation are untested.
