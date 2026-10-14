# Campus AI — Delivery Roadmap

**Institution:** Yenepoya School of Technology (YSET)  
**Product:** Campus AI  
**Document type:** Implementation roadmap  
**Status:** Adapted for a project where `frontend/` and `backend/` folders already exist.

---

## 1. Delivery approach

Build Campus AI as a **modular monolith** and deliver vertical slices. Each phase should connect the UI, API, database, permissions, tests, and documentation. Avoid building every screen with mock data before connecting real workflows.

**Estimated duration:** Approximately 15–20 focused development days for a small MVP, depending on experience and scope. This is a planning estimate, not a guarantee.

### Existing work

The `frontend/` and `backend/` folders already exist. **Do not recreate them or restart the project.** Inspect their current structure and preserve working code. Adapt the suggested paths in this document to the actual repository.

Suggested top-level structure:

```text
campus-ai/
├── frontend/             # Existing frontend
├── backend/              # Existing backend
├── docs/                 # Project documentation
├── tests/                # Optional shared/e2e tests
├── .gitignore
└── README.md
```

Your actual project may differ. Do not move files merely to match this example.

## 2. Phase 0 — Product and architecture decisions

### Tasks

- Confirm the exact institutional email domain: `yenepoya.edu.in`.
- Confirm whether email verification alone is sufficient or a student roster/invitation is required.
- Decide between secure server-side sessions and short-lived access tokens with rotating refresh sessions.
- Decide the AI provider and acceptable budget/quotas.
- Decide allowed upload types and size limits.
- Define retention/deletion rules for chats and documents.
- Review PRD, TRD, API specification, database schema, app flow, architecture, design, coding rules, and security documents.
- Record important decisions in Architecture Decision Records (ADRs).

### Deliverables

- Approved MVP scope.
- Architecture diagram.
- Initial schema plan.
- Security assumptions and unresolved questions.
- Confirmed frontend/backend stack and local run commands.

### Exit criteria

- The team agrees on authentication, storage, AI provider, roles, and MVP scope.
- No production secrets or real student data are committed to the repository.

## 3. Phase 1 — Inspect and complete the existing foundation (Days 1–2)

Since the frontend and backend folders already exist, focus on validating and completing the current setup rather than creating the folders again.

### Tasks

- Inspect the existing folder tree and `package.json` files.
- Confirm the frontend and backend frameworks and versions.
- Confirm the current development commands and verify both apps start.
- Configure TypeScript, formatting, linting, and scripts where missing.
- Configure PostgreSQL and Prisma if they are part of the selected stack.
- Add `.env.example`, `.gitignore`, and startup configuration validation.
- Add a backend health endpoint and centralized error handler.
- Set up shared layout, navigation, form components, and design tokens in the frontend.
- Configure CI for linting, type checking, tests, and builds.
- Add or update the README with setup instructions.

### Deliverables

- Existing apps run locally using documented commands.
- CI checks pass.
- The first migration applies to a clean development database, if using a database.
- No existing working features are broken by setup changes.

### Exit criteria

A new developer can clone the repository, configure environment variables, install dependencies, run migrations and synthetic seed data, and start both apps.

## 4. Phase 2 — Authentication and access control (Days 3–4)

### Tasks

- Implement exact institutional email domain validation on the server.
- Implement student registration and duplicate-account checking.
- Hash passwords securely or integrate the selected identity provider.
- Implement email verification with token expiry and single-use consumption.
- Implement login, logout, `/auth/me`, password reset, and session lifecycle.
- Implement controlled faculty/admin provisioning.
- Add role middleware and resource-ownership checks.
- Add protected frontend routes and role-aware redirects.
- Add rate limits, safe errors, and audit events.

### Tests

- Non-institutional email is rejected by the server.
- Public registration cannot assign `ADMIN` or `FACULTY`.
- Unverified or suspended users cannot access protected APIs.
- Invalid, expired, or reused reset tokens are rejected.
- Cross-user resource access is denied.

### Exit criteria

Authentication and authorization tests pass. No role or permission is trusted from client payloads.

## 5. Phase 3 — University administration (Days 5–7)

### Tasks

- University profile/settings where needed.
- Departments and programs.
- Academic years/terms.
- Courses, course offerings, and sections.
- User provisioning.
- Student enrollments.
- Faculty assignments.
- Search, pagination, form validation, and audit logs.

### Tests

- Duplicate codes are rejected within the correct scope.
- Invalid cross-department or cross-university assignments are rejected where applicable.
- Non-admin users cannot mutate administrative configuration.
- Transactions preserve consistency during enrollment and faculty assignment.

### Exit criteria

An authorized admin can create a course and assign faculty and students using real database records.

## 6. Phase 4 — Faculty and student workflows (Days 8–10)

### Tasks

- Faculty course list and detail pages.
- Private material upload and authorized download.
- Assignment creation and deadline rules.
- Student assignment list and submission.
- Faculty review and feedback.
- Announcements.
- Basic attendance only if time permits and requirements are confirmed.
- Student dashboard connected to real enrollments and assignments.

### Tests

- Faculty can manage only assigned courses.
- Students can access only enrolled course resources or explicitly published content.
- Submission rules and deadlines are enforced server-side.
- Private uploads cannot be accessed by guessing URLs.
- Grades and feedback are visible only when authorized and released.

### Exit criteria

Faculty can upload a material and create an assignment; an enrolled student can see the course and submit work.

## 7. Phase 5 — AI chat (Days 11–12)

### Tasks

- Create a provider adapter and server-side API integration.
- Implement chat CRUD and message persistence.
- Add general study mode.
- Add quotas, timeouts, safe errors, usage logging, and feedback.
- Build chat history, copy, regenerate, and streaming where supported.
- Add deletion and retention behavior.

### Tests

- Chat ownership is enforced.
- Provider errors do not corrupt conversation history.
- Message-size and usage limits work.
- API keys are never sent to the browser.
- UI safely renders AI Markdown and untrusted content.

### Exit criteria

An authenticated student can create chats, ask questions, and revisit saved history.

## 8. Phase 6 — Document Q&A and RAG (Days 13–14)

### Tasks

- Add private file storage.
- Validate upload type/signature, size, and quota.
- Extract PDF text and page metadata.
- Store processing status and document chunks.
- Add embeddings/vector search when ready.
- Filter retrieval by authorized sources.
- Return citations tied to actual source metadata.
- Add retry and cleanup for failed processing jobs.

### Tests

- Cross-user source retrieval is impossible.
- Prompt injection in a document cannot change permissions.
- Unanswerable questions return uncertainty instead of fabricated facts.
- Source references come from actual indexed metadata.
- Deletion removes or schedules deletion of original and derived content according to policy.

### Exit criteria

A student can ask a question about an uploaded or otherwise authorized document and receive an answer with valid source references when available.

## 9. Phase 7 — Quality, release, and demo (Days 15–20)

### Tasks

- End-to-end tests for the complete admin/faculty/student workflow.
- Accessibility and responsive UI review.
- Security review and dependency/secret scans.
- Production environment configuration.
- Database migration and backup/restore rehearsal.
- Configure monitoring, logs, alerts, quotas, and provider limits.
- Deploy frontend, API, database, email, and private storage.
- Prepare synthetic demo accounts and seed content.
- Update README and operator runbook.

### Exit criteria

- All critical acceptance criteria pass.
- Staging smoke tests pass.
- Restore procedure is documented and tested.
- No known critical/high-severity release-blocking security issue remains unresolved.
- Demo uses synthetic records and provisioned accounts.

## 10. Scope cuts if schedule is tight

### Keep in the MVP

1. Authentication and institutional domain policy.
2. Admin course and user provisioning.
3. Faculty material upload.
4. Student course access.
5. AI chat with document Q&A.
6. Ownership and role tests.

### Defer

- Advanced attendance.
- Predictive analytics.
- Native mobile apps.
- Calendar/SSO integrations.
- Multi-provider AI routing.
- Complex timetable optimization.
- Automated high-stakes grading.

## 11. Release gates

Do not proceed to production if:

- A student can access another student's chat, file, submission, or private record.
- Public registration can create privileged roles.
- Institutional domain enforcement exists only in the frontend.
- Secrets are committed or exposed in browser bundles.
- AI citations can be fabricated or unauthorized sources retrieved.
- Backup/restore and session revocation are untested.
- Critical security checks or required CI checks are failing.

## 12. Recommended next action

Because `frontend/` and `backend/` already exist:

1. Inspect the current project structure and dependencies.
2. Run both applications and note any setup errors.
3. Confirm which database and authentication approach are already configured.
4. Complete any missing foundation work without replacing working code.
5. Begin Phase 2 only after the apps start reliably and the database foundation is understood.

**Delivery principle:** Build one complete vertical slice at a time. A feature is not complete until its UI, API, database behavior, authorization, tests, and documentation work together.
