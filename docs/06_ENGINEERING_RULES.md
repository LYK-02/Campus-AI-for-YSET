# Engineering Rules, Good Practices, and Extensibility

## 1. Core rules

1.  Build a modular monolith first.
2.  Keep business rules out of React components and HTTP controllers.
3.  Keep external providers behind adapters.
4.  Validate all untrusted input at the server boundary.
5.  Treat authorization as a backend responsibility.
6.  Use migrations for schema changes.
7.  Add tests with each feature.
8.  Keep secrets out of Git and frontend bundles.
9.  Prefer simple, explicit code over premature abstraction.
10. Document important architectural decisions.

## 2. Module boundaries

Recommended modules: - Auth and sessions. - Users and roles. -
University/tenant configuration. - Departments/programs/academic
years. - Courses/offerings/sections. - Enrollments and teaching
assignments. - Materials and storage. - Assignments and submissions. -
Attendance. - Announcements/notifications. - AI chats, document
ingestion, retrieval, and AI usage. - Audit and analytics.

Each module should own its routes, validation schemas, service logic,
persistence queries, and tests where practical. Avoid cross-module
direct database logic scattered throughout controllers. Shared modules
should remain small and stable.

## 3. Repository conventions

-   Use TypeScript for new application code if the team can support it.
-   Enable strict type checking progressively.
-   Use one formatter and linter with consistent rules.
-   Use descriptive names and avoid unexplained abbreviations.
-   Keep functions focused and small enough to test.
-   Avoid giant controllers, giant React components, and generic "utils"
    dumping grounds.
-   Separate domain types from provider SDK types.
-   Use enums/unions for known statuses and modes.
-   Avoid `any`; when unavoidable, isolate and document it.
-   Use UTC in persistence and explicit timezone conversion in the UI.
-   Do not swallow errors silently.

## 4. Validation and error handling

-   Validate every API body, query, and path parameter.
-   Validate external provider responses before trusting them.
-   Use a central error handler.
-   Use stable error codes.
-   Return user-safe messages; log details server-side with a request
    ID.
-   Never return stack traces in production.
-   Distinguish validation errors, authorization errors, conflicts, rate
    limits, and provider failures.
-   Do not reveal account existence through login/reset messages.

## 5. Frontend rules

-   Use reusable layout and form components.
-   Keep auth state centralized and refresh it from `/auth/me` after
    reload.
-   Treat client-side route guards as UX only.
-   Do not store long-lived JWTs in localStorage.
-   Render AI Markdown safely; sanitize HTML and avoid unsafe raw HTML.
-   Provide loading, error, empty, and success states.
-   Ensure forms have labels and accessible validation messages.
-   Avoid duplicating API logic across components; use a shared API
    client.
-   Do not hardcode permissions only in the UI.
-   Do not expose secret environment variables with frontend-public
    prefixes.

## 6. Backend rules

-   Authenticate before protected operations.
-   Authorize role and resource ownership for every request.
-   Scope database queries by tenant and allowed relationships.
-   Use transactions for multi-record operations that must succeed or
    fail together.
-   Apply rate limits and timeouts.
-   Use structured logging and request IDs.
-   Keep secrets and provider SDK calls in integration adapters.
-   Use idempotency where retries could duplicate critical actions.
-   Use safe, bounded retries for transient external errors.
-   Do not perform long PDF/OCR/embedding tasks synchronously in an HTTP
    request once workload grows; use a worker queue.

## 7. Database rules

-   Use Prisma migrations; commit them.
-   Add foreign keys and appropriate unique constraints.
-   Index foreign keys and common list filters.
-   Avoid unbounded list endpoints.
-   Use transactions for enrollment/role/account workflows.
-   Avoid cascading deletes for important academic records unless
    explicitly intended.
-   Define deletion and retention behavior for chat, materials,
    submissions, and audit logs.
-   Keep raw file bytes in private object storage.
-   Store tokens hashed and expire them.
-   Use synthetic seed data only.

## 8. Plugin and integration architecture

Make future integrations easy by defining interfaces instead of calling
provider SDKs throughout the codebase.

Examples: - `AIProvider`: generate text and optionally stream output. -
`EmbeddingProvider`: create embeddings. - `DocumentExtractor`: extract
text and page metadata. - `ObjectStorage`: upload, delete, and authorize
downloads. - `EmailProvider`: send verification, reset, and invitation
messages. - `NotificationProvider`: send email/in-app notifications. -
`CalendarProvider`: future calendar integration. - `LMSProvider`: future
learning management integration. - `IdentityProvider`: future SSO
integration. - `AnalyticsProvider`: future analytics export.

Each adapter should: 1. Have a documented interface. 2. Validate
configuration at startup. 3. Define timeouts and failure behavior. 4.
Emit safe structured logs and usage metadata. 5. Have unit/contract
tests. 6. Be replaceable without changing domain logic. 7. Be disabled
gracefully if optional and not configured.

Use feature flags/configuration for optional modules. Do not add a
plugin marketplace or dynamic arbitrary code execution to the MVP.

## 9. Git and pull request rules

-   Use feature branches.
-   Keep pull requests focused.
-   Require review for authentication, authorization, migrations, and AI
    data-access changes.
-   CI must run lint, typecheck, unit tests, integration tests where
    configured, and build.
-   Include migration and rollback/forward-fix notes.
-   Update docs/API contracts when behavior changes.
-   Never commit `.env`, keys, production dumps, or real student
    records.
-   Use secret scanning and dependency scanning where available.

Suggested commit format: -
`feat(auth): add institutional email verification` -
`fix(ai): enforce chat ownership checks` -
`docs(db): document enrollment constraints` -
`test(auth): cover refresh token reuse`

## 10. Architecture Decision Records

Create `docs/adr/NNN-title.md` for choices with long-term consequences.
Each ADR includes: - Context. - Options considered. - Decision. -
Positive/negative consequences. - Security/operational implications. -
Date and status.

## 11. Definition of done

A feature is done only when: - Requirements and permissions are
defined. - Validation and error states exist. - Tests cover happy path
and key negative cases. - Logging avoids secrets and unnecessary
sensitive data. - Database migration is committed if needed. - API and
UI documentation are updated. - Accessibility and responsive behavior
are checked. - Authorization is verified server-side. - Deployment
configuration is documented.
