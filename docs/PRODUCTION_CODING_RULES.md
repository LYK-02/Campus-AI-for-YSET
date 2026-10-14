# Campus AI — Production Engineering & Coding Rules

**Document type:** Mandatory engineering standard  
**Applies to:** Frontend, backend, database, AI services, tests, CI/CD, infrastructure  
**Status:** Proposed baseline; adapt to university policy and deployment environment.

## 1. Core principles

1. Correctness, security, privacy, accessibility, and maintainability take priority over speed of delivery.
2. Every change must be reviewable, tested, observable, and reversible.
3. Do not merge code that is known to be insecure, untested, or inconsistent with this document.
4. Never treat frontend validation, hidden UI controls, prompts, or client-supplied roles as security boundaries.
5. Prefer simple, explicit implementations over clever abstractions.
6. Do not claim a feature is production-ready until its acceptance criteria, failure modes, monitoring, and operational ownership are documented.

## 2. Architecture boundaries

Use a modular monolith initially unless a documented scaling or isolation requirement justifies a separate service.

Recommended boundaries:

- `apps/web`: React + Vite UI.
- `apps/api`: Express HTTP API.
- `packages/contracts`: shared request/response schemas and generated API types, where useful.
- `packages/config`: validated configuration shared only where appropriate.
- PostgreSQL: authoritative relational data store.
- Private object storage: uploaded PDFs and other files.
- AI provider adapter: server-only integration with the selected model provider.
- Retrieval pipeline: permission-aware indexing and retrieval for university knowledge and user documents.

Backend modules should be separated by business capability, for example `auth`, `users`, `departments`, `courses`, `materials`, `assignments`, `chat`, `knowledge`, and `audit`.

**Rules**
- HTTP controllers handle transport concerns only; business logic belongs in services/use cases.
- Database access belongs in repositories or a clearly defined data-access layer.
- External providers must be behind adapters so vendors can be replaced.
- Avoid circular dependencies and cross-module imports into another module's private implementation.
- Do not introduce microservices, event buses, caches, or queues without a written need and operational plan.
- Define ownership for every database table and domain event.

## 3. TypeScript and code quality

- Use TypeScript for frontend and backend unless an approved exception exists.
- Enable `strict: true`, `noImplicitAny`, `strictNullChecks`, and `noUncheckedIndexedAccess` where practical.
- Do not use `any` as an escape hatch. Prefer `unknown`, narrow it, and document unavoidable exceptions.
- Avoid non-null assertions (`!`) unless the invariant is proven and documented.
- Use explicit return types on exported functions and public service methods.
- Use named, intention-revealing functions and variables.
- Keep functions focused; extract logic when doing so clarifies behavior.
- Avoid duplicated business rules. Put shared domain rules in one authoritative server-side location.
- Avoid unexplained magic numbers and strings; use named constants or configuration.
- Do not swallow errors with empty `catch` blocks.
- Do not log secrets, passwords, tokens, session cookies, authorization headers, private prompts containing personal data, or uploaded document contents.
- Remove dead code, debug prints, commented-out code, temporary bypasses, and unused dependencies before merge.

## 4. Repository and dependency management

- Commit the lockfile and use the package manager consistently.
- Pin runtime versions and use supported LTS releases.
- Use the minimum dependency set needed; evaluate maintenance, license, security history, and transitive dependencies.
- Never install a package solely because a blog post recommends it; inspect package provenance and activity.
- Run dependency vulnerability scanning in CI and review findings before release.
- Do not use wildcard dependency versions in production applications.
- Keep secrets out of `.env` files committed to source control; commit only `.env.example` with placeholder values.
- Protect the default branch, require review, and require CI checks to pass.
- Use small, descriptive commits and pull requests.
- Every migration, configuration change, and feature flag must be reviewed.

## 5. Naming, formatting, and project conventions

Adopt and enforce formatting and linting automatically.

Suggested conventions:
- React components and component files: `PascalCase`.
- Variables, functions, hooks: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants.
- Database tables and columns: one consistent convention, preferably Prisma's mapped model names with snake_case database names if required by the project.
- API paths: plural nouns, predictable nesting, and versioning such as `/api/v1`.
- Environment variables: `UPPER_SNAKE_CASE`.
- Tests: colocated or under a predictable `tests/` directory using `.test.ts` / `.spec.ts`.

Formatting and linting must run in CI; do not rely on developers remembering to run them manually.

## 6. API engineering rules

- Version the API and publish an OpenAPI specification or equivalent machine-readable contract.
- Validate every request body, query parameter, path parameter, and relevant header at the server boundary using a schema validator.
- Reject unknown fields on sensitive write operations where feasible.
- Return stable error codes and a consistent error shape; never expose stack traces or internal SQL/provider errors to clients.
- Use appropriate HTTP status codes.
- Use pagination for potentially large collections. Set maximum page sizes.
- Apply explicit sorting and filtering allowlists; never concatenate untrusted SQL or ORM fragments.
- Use idempotency keys for operations where duplicate submission can cause harmful duplicate effects, such as payment-like actions or expensive job creation.
- Define request size, timeout, and rate limits.
- Set request correlation IDs and propagate them through logs and background jobs.
- Avoid leaking whether an account exists in password-reset and other sensitive flows.
- Keep internal administrative endpoints separate from student-facing workflows and enforce authorization on the server.
- Do not use GET requests for state-changing actions.
- Do not return full database models by default; serialize explicit response DTOs.

## 7. Frontend rules

- Treat all browser state as untrusted and potentially stale.
- Keep authorization decisions on the server; hiding a button is not authorization.
- Keep model-provider keys, database credentials, signing keys, and service credentials out of the frontend bundle.
- Use a centralized typed API client and consistent handling for loading, empty, success, and error states.
- Cancel or ignore stale requests when navigating or changing search terms.
- Do not put secrets, private documents, or long-lived authentication credentials in `localStorage` or `sessionStorage`.
- Render user-generated content safely. Sanitize Markdown/HTML according to a maintained allowlist; disallow arbitrary scripts, event handlers, and unsafe embedded content.
- Avoid `dangerouslySetInnerHTML`; if unavoidable, require a reviewed sanitizer and tests.
- Ensure keyboard navigation, visible focus, labels, accessible errors, contrast, and semantic HTML.
- Do not rely on color alone to communicate state.
- Avoid sending the same mutation multiple times; disable duplicate submissions and use server-side idempotency where appropriate.
- Keep UI state separate from server-authoritative domain state.
- Use environment variables only for public configuration intended for browser exposure.

## 8. Authentication and authorization integration

- Only students may self-register, and the server must enforce the exact allowed domain `yenepoy.edu.in` after normalizing and validating the email address.
- Faculty and admin accounts must be provisioned through an approved, auditable process; public signup must never let users choose these roles.
- Verify email ownership before activating student accounts.
- Use the centralized authentication and authorization middleware on protected routes.
- Deny access by default. Define permissions per operation and resource.
- Every resource access must check both the user's role and the resource's scope/ownership.
- Never trust `role`, `userId`, `departmentId`, `courseId`, `ownerId`, or similar authorization-sensitive fields supplied by a client.
- Choose either secure server-side sessions or a carefully designed short-lived access-token plus rotating refresh-session model. Document revocation, expiry, logout, and CSRF behavior.
- Do not store long-lived bearer tokens in browser storage. If cookie authentication is used, configure `HttpOnly`, `Secure`, and an appropriate `SameSite` policy, plus CSRF defenses where required.
- Passwords must be hashed with Argon2id or an appropriately configured bcrypt implementation; never encrypt or store plaintext passwords.
- Rate-limit login, registration, verification, password-reset, and refresh endpoints.

## 9. Database and data integrity

- Use migrations for every schema change; never manually edit production schema.
- Review migrations for locks, table rewrites, backfills, and rollback or forward-fix strategy.
- Use foreign keys, unique constraints, check constraints, and transactions to enforce invariants.
- Use transactions for multi-step state changes that must succeed or fail together.
- Use atomic database operations for counters and other concurrent updates.
- Use optimistic locking or explicit concurrency control when concurrent edits could overwrite data.
- Store timestamps consistently in UTC and display them in the user's locale.
- Use soft deletion only when retention, recovery, or audit requirements justify it; document purge behavior.
- Use database indexes based on measured query patterns and explain plans.
- Never expose raw ORM records to clients.
- Run production migrations as a controlled release step with backups and monitoring.

## 10. AI and retrieval engineering

- AI output is untrusted data, not executable code or authoritative policy.
- Keep provider keys and all model calls on the server.
- Use a provider adapter with explicit timeouts, retry policy, model selection, cost limits, and error handling.
- Enforce per-user and global token/request budgets.
- Treat user prompts, retrieved documents, uploaded files, and tool output as potentially adversarial.
- Do not allow model output to grant access, change roles, bypass approval, or decide authorization.
- Apply access filters before retrieval and re-check permissions before returning source snippets.
- Store document ownership, visibility, course/department scope, version, processing state, and deletion status in metadata.
- Use source citations for university-knowledge answers where possible; distinguish grounded facts from model-generated suggestions.
- When evidence is insufficient, the assistant should say so rather than fabricate policy or facts.
- Do not send student records or confidential documents to a provider unless the university has approved that provider and data-processing arrangement.
- Make AI requests observable without logging raw sensitive content by default.
- Handle provider failures gracefully and never silently report a failed operation as successful.

## 11. Logging, metrics, and observability

- Use structured logs with timestamp, severity, environment, request ID, route template, duration, outcome, and safe actor identifier where needed.
- Redact credentials and sensitive data before logs leave the process.
- Log security-relevant events: login outcomes, account changes, role changes, access denials, file uploads/deletions, exports, and admin actions.
- Do not log every successful read of every record unless justified; define audit scope and retention.
- Track latency, error rate, database pool saturation, queue lag, AI-provider failures, rate-limit triggers, and token/cost consumption.
- Define health and readiness endpoints that do not expose secrets or detailed infrastructure information.
- Alert on actionable conditions with a runbook and owner.
- Keep audit records distinct from ordinary application debug logs.

## 12. Testing requirements

Every change must include tests appropriate to its risk.

Required layers:
- Unit tests for domain logic and validation.
- Integration tests for database access, transactions, authentication, and authorization.
- API tests for request validation, status codes, and response shape.
- End-to-end tests for critical user journeys.
- Security regression tests for known vulnerabilities.
- AI evaluation tests for prompt injection, unauthorized retrieval, unsupported answers, and citation quality.
- Migration tests for fresh databases and supported upgrade paths.

Minimum high-risk test cases:
- Student cannot access another student's private records or documents.
- Student cannot create or promote an admin/faculty account.
- A valid email from a different domain is rejected.
- Case, whitespace, Unicode, and malformed email edge cases are handled consistently.
- A deleted or revoked account/session cannot continue to access protected endpoints.
- File upload rejects unsupported, oversized, malformed, or disallowed files.
- AI retrieval cannot expose documents from another user, course, department, or visibility scope.
- Rate limits and provider failures produce safe, predictable behavior.

Do not test only implementation details. Assert externally observable behavior and security invariants.

## 13. CI/CD and release gates

Every pull request must pass:
- Formatting and linting.
- Type checking.
- Unit and integration tests.
- Build checks.
- Dependency and secret scanning.
- Migration validation.
- Relevant security checks.

Release rules:
- Deploy immutable, versioned artifacts.
- Use separate development, staging, and production environments and credentials.
- Require approval for production release and database migrations.
- Use backward-compatible migrations when possible: expand, deploy, migrate data, then contract in a later release.
- Use feature flags for risky changes and ensure flags are access-controlled.
- Define rollback or forward-fix steps before release.
- Verify smoke tests, error rates, and critical workflows after deployment.
- Do not deploy from a developer's unreviewed local machine.

## 14. Pull-request checklist

A pull request is not ready until the author confirms:

- [ ] Scope and behavior are clearly described.
- [ ] Request validation and error behavior are defined.
- [ ] Authentication, authorization, and ownership checks are present.
- [ ] No secrets or sensitive content are exposed.
- [ ] Tests cover success, failure, boundary, and access-control cases.
- [ ] Database changes use reviewed migrations.
- [ ] Logging and metrics are appropriate and redacted.
- [ ] Accessibility and responsive behavior were considered for UI changes.
- [ ] Documentation and API contracts are updated.
- [ ] Dependency changes are justified.
- [ ] Deployment, rollback, and operational impact are understood.

## 15. Definition of done

A feature is done only when:
1. Acceptance criteria pass.
2. Security and privacy review is complete for the feature's risk.
3. Automated tests pass in CI.
4. API and user-facing documentation are updated.
5. Logs, metrics, and alerts exist where operationally necessary.
6. Failure and recovery behavior is understood.
7. The change is deployable, observable, and supportable.
8. No known critical/high-severity issue is left unaccepted by the designated owner.

## 16. Exceptions

Exceptions require a written record containing:
- The rule being waived.
- Business and technical justification.
- Risk and affected systems/data.
- Compensating controls.
- Owner and approver.
- Expiry or review date.

An exception is not approval to ignore legal, contractual, university, or platform requirements.
