# Technical Requirements Document (TRD)

## 1. Architecture principles

1.  Modular monolith first; do not start with microservices.
2.  Separate UI, HTTP transport, business logic, persistence, and
    provider integrations.
3.  Enforce authorization server-side and as close to data access as
    practical.
4.  Use explicit schemas and validation at trust boundaries.
5.  Keep provider-specific AI code behind an adapter.
6.  Keep file storage private and separate from relational metadata.
7.  Make migrations, logs, tests, and deployment repeatable.
8.  Prefer standards-based components and replaceable integrations.

## 2. Recommended stack

### Frontend

-   React, Vite, TypeScript, Tailwind CSS.
-   React Router or equivalent route system.
-   A consistent component library/design system.
-   A query/cache library if helpful for API state.
-   Runtime validation for API payloads where appropriate.

### Backend

-   Node.js LTS, Express, TypeScript.
-   Zod or an equivalent schema validator.
-   Prisma ORM.
-   Structured logging.
-   Centralized error handler.
-   Rate limiting and security middleware.
-   OpenAPI documentation for the HTTP API.

### Data and infrastructure

-   PostgreSQL.
-   pgvector for embeddings if RAG is enabled.
-   Private object storage with signed URLs or authenticated download
    proxy.
-   Email delivery provider for verification, invitations, and password
    resets.
-   Optional Redis for distributed rate limits, queues, and session
    storage as scale requires.
-   Background worker/queue for large document processing.
-   CI pipeline for lint, typecheck, tests, and build.

## 3. Logical architecture

-   **Web client:** presentation, forms, accessible interaction, API
    calls.
-   **API layer:** routing, request validation, authentication,
    authorization, response formatting.
-   **Domain modules:** auth, university, users, departments, programs,
    courses, enrollments, materials, assignments, attendance,
    announcements, AI.
-   **Application services:** use cases and business rules.
-   **Persistence layer:** Prisma repositories/queries and transaction
    boundaries.
-   **Integration adapters:** email, AI model, embeddings, object
    storage, optional identity provider.
-   **Workers:** email dispatch, document extraction, chunking,
    embedding, cleanup.
-   **Observability:** structured logs, metrics, tracing where
    practical, error reporting.

## 4. Suggested repository structure

``` text
campus-ai/
  client/
    src/
      app/
      components/
      features/
        auth/
        admin/
        courses/
        assignments/
        ai-chat/
      layouts/
      lib/
      services/
  server/
    src/
      app.ts
      server.ts
      config/
      middleware/
      modules/
        auth/
        users/
        university/
        departments/
        courses/
        enrollments/
        materials/
        assignments/
        submissions/
        attendance/
        announcements/
        ai/
      integrations/
        ai/
        email/
        storage/
      workers/
      lib/
    prisma/
      schema.prisma
      migrations/
      seed.ts
  docs/
  tests/
  .env.example
  .gitignore
  README.md
```

Keep modules cohesive. Do not make every module depend on every other
module. Use service interfaces for external providers and avoid circular
imports.

## 5. Environments

Maintain separate local, test, staging, and production configuration.
Use environment variables or a secret manager for credentials. Commit
`.env.example` with placeholders, never actual secrets.

Required configuration varies by implementation but may include: -
`DATABASE_URL` - `APP_ORIGIN` - `API_ORIGIN` - `SESSION_SECRET` or JWT
signing key configuration - `EMAIL_PROVIDER_*` - `AI_PROVIDER_*` -
`OBJECT_STORAGE_*` - `LOG_LEVEL`

Validate required environment variables at startup and fail fast if
production configuration is incomplete.

## 6. API conventions

-   Prefix API routes with `/api/v1` once the initial contract is
    stable.
-   Use nouns and HTTP semantics consistently.
-   Validate request body, query, and route parameters.
-   Return JSON with stable response shapes.
-   Use appropriate HTTP status codes.
-   Add pagination to list endpoints.
-   Use request IDs for log correlation.
-   Never return internal stack traces or secret configuration.
-   Document auth requirements and role/resource scope per endpoint.
-   Use idempotency keys for operations that may be retried and create
    duplicate effects, where appropriate.

## 7. Authentication architecture choice

Choose one of these and document the final decision in an ADR:

### Option A: Server-side session cookie

Recommended when simplicity and revocation are priorities. Store session
state in a server-side store; browser receives an opaque secure cookie.
Requires session-store availability and CSRF protection.

### Option B: JWT access token + rotating refresh session

Use short-lived access JWTs and a server-side record of refresh
sessions/tokens, stored hashed where feasible. Validate signature,
algorithm, issuer, audience, expiry, and session status. Rotate refresh
tokens and detect reuse. Avoid long-lived JWTs with no revocation path.

Do not create custom cryptographic protocols. Use well-maintained
libraries. For browser clients, prefer HttpOnly Secure cookies over
long-lived tokens in localStorage. Configure CORS, SameSite, cookie
domain, and CSRF defenses based on the deployment topology.

## 8. AI provider abstraction

Create a provider-neutral interface such as:

``` ts
export interface AIProvider {
  generate(input: {
    systemInstruction: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    context?: Array<{ sourceId: string; text: string }>;
    maxOutputTokens?: number;
  }): Promise<{
    text: string;
    usage?: { inputTokens?: number; outputTokens?: number };
    providerRequestId?: string;
  }>;
}
```

The exact interface can evolve, but domain modules should not import
provider-specific SDKs directly. Add adapters for embeddings and
document extraction as separate interfaces.

## 9. File-processing architecture

-   Upload to private storage using server-controlled keys.
-   Enforce size, type, content signature, ownership, and quota checks.
-   Record metadata and processing status in the database.
-   Queue extraction and embedding for larger files.
-   Use timeouts and memory limits; avoid processing unbounded files in
    request handlers.
-   Store extracted text/chunks with source and page metadata.
-   Allow retry of failed processing jobs.
-   Delete derived chunks/embeddings when a document is deleted, subject
    to retention rules.
-   Consider malware scanning and content disarm/reconstruction for
    production.
-   Never execute uploaded files.

## 10. Non-functional requirements

### Reliability

-   Centralized error handling.
-   Timeouts and bounded retries for external services.
-   Database transactions for multi-step critical operations.
-   Graceful AI/email/storage provider failure.
-   Health/readiness endpoints that do not leak secrets.

### Performance

-   Index foreign keys and common filters.
-   Paginate large lists.
-   Use connection pooling appropriately.
-   Cache only data with safe invalidation and authorization boundaries.
-   Stream AI responses only after authorization and quota checks.
-   Move heavy document processing to background jobs.

### Scalability

-   Keep API instances stateless where possible.
-   Use shared session/rate-limit stores when horizontally scaling.
-   Use queue workers for long tasks.
-   Separate provider quotas and user quotas.
-   Use database connection pooling and monitor slow queries.

### Accessibility

-   Keyboard operability, labels, focus states, sufficient contrast, and
    screen-reader-friendly errors.
-   Do not rely on color alone to communicate status.

### Maintainability

-   TypeScript strict mode where feasible.
-   Lint, formatting, type checking, tests, migrations, and documented
    decisions in CI.
-   Keep functions and modules focused.
-   Avoid premature microservices and unnecessary abstractions.

## 11. Architecture decision records (ADRs)

Create `docs/adr/` and record important decisions: - ADR-001: session
cookie vs JWT + refresh session. - ADR-002: institutional email
verification and enrollment validation. - ADR-003: AI provider
abstraction. - ADR-004: object storage and document-processing queue. -
ADR-005: tenant strategy and data isolation. - ADR-006: document
retention and deletion. - ADR-007: API versioning and error contract.

Each ADR should state context, options, decision, consequences, and
date.
