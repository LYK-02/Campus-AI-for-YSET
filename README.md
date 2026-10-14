# Campus AI --- Project Documentation Pack

Campus AI is a university management web application with role-based
Admin, Faculty, and Student experiences and an AI-powered academic
assistant. This documentation pack defines the product, architecture,
database, APIs, security, engineering standards, delivery phases,
testing, and deployment.

## Documents

-   `01_PRD.md` --- Product requirements, personas, workflows, scope,
    acceptance criteria, and success metrics.
-   `02_TRD.md` --- Technical architecture, stack, module boundaries,
    integration strategy, and non-functional requirements.
-   `03_DATABASE_SCHEMA.md` --- PostgreSQL/Prisma data model,
    relationships, constraints, indexes, and migration rules.
-   `04_AUTH_SECURITY.md` --- Institutional email policy,
    authentication, authorization, threat controls, privacy, and
    production security.
-   `05_API_SPEC.md` --- API conventions, endpoint inventory,
    request/response examples, errors, and versioning.
-   `06_ENGINEERING_RULES.md` --- Coding conventions, repository
    structure, branching, testing, observability, and extensibility
    rules.
-   `07_AI_ASSISTANT.md` --- Chatbot behavior, document ingestion, RAG
    pipeline, source citations, and AI safety rules.
-   `08_ROADMAP.md` --- Detailed delivery phases, dependencies,
    milestones, and definition of done.
-   `09_TESTING_DEPLOYMENT.md` --- Test strategy, release checklist,
    deployment, backups, monitoring, and incident response.

## Product decisions (initial defaults)

-   Institutional email domain: `yenepoy.edu.in`.
-   Roles: `ADMIN`, `FACULTY`, `STUDENT`.
-   Suggested stack: React + Vite + TypeScript + Tailwind CSS; Node.js +
    Express + TypeScript; PostgreSQL + Prisma; private object storage;
    an LLM provider behind a server-side adapter.
-   Authentication: use a secure session-cookie approach or short-lived
    access JWTs with rotating, revocable refresh sessions. Choose one
    design and implement it consistently.
-   Initial release: one institution, with `universityId`/tenant
    boundaries designed into data access so multi-institution support
    can be added safely later.
-   Student self-registration: students only. Faculty and admins are
    provisioned through an authorized invitation/admin process.
-   AI answers must not invent official university facts. Use approved
    data and citations for university-specific answers.

## How to use this pack

Treat these documents as the baseline contract for implementation.
Record any change to a product or architecture decision in an
Architecture Decision Record (ADR), update the relevant document, and
link the change in the pull request. Items marked "decision needed" must
be resolved before the related feature ships.

## Important disclaimer

This is an implementation blueprint, not a security certification or
legal opinion. Before production use, confirm the institution's actual
email domains, data retention rules, privacy requirements, AI-provider
terms, and approval process with the institution.
