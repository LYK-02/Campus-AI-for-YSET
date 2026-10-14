# Product Requirements Document (PRD)

**Product:** Campus AI\
**Version:** 1.0 baseline\
**Status:** Draft for implementation planning

## 1. Product vision

Campus AI is a university management web application that combines
academic administration with a personal AI academic assistant. Admins
configure and operate the university, faculty manage assigned teaching
activities, and students manage learning tasks and use AI grounded in
authorized academic material.

## 2. Problem statement

University information and academic workflows are often spread across
separate portals, files, and messaging channels. Students also need help
understanding course material, while faculty need a practical way to
distribute resources and support learning. Campus AI centralizes core
workflows and offers contextual AI assistance without making AI the
authority for official academic records.

## 3. Goals

1.  Provide secure authentication and role-specific dashboards.
2.  Allow authorized admins to configure university structure and
    accounts.
3.  Allow faculty to manage assigned courses, materials, assignments,
    and submissions.
4.  Allow students to view enrolled courses and academic tasks.
5.  Provide an AI chatbot for general study help, authorized course
    material, student uploads, and approved university knowledge.
6.  Keep data access auditable, scoped, and secure.
7.  Use modular architecture so future integrations can be added without
    rewriting core features.

## 4. Non-goals for the first release

-   Native iOS/Android apps.
-   Payment processing or tuition accounting.
-   Full student information system replacement.
-   Automated high-stakes grading or disciplinary decisions.
-   AI-generated official university policy without verified source
    material.
-   Public multi-university self-service tenant creation.
-   Complex timetable optimization.
-   Predictive at-risk student scoring.
-   Voice assistant or real-time video classes.

## 5. User roles and personas

### Admin

Responsible for university configuration and authorized operations. Can
manage departments, courses, user provisioning, enrollments, faculty
assignments, announcements, AI configuration, and audit review. Admin
actions must be auditable.

### Faculty

Responsible for assigned courses. Can upload course materials, create
assignments, review submissions, provide feedback, record attendance if
enabled, and use faculty AI tools. Faculty cannot manage unrelated
courses or university-wide roles unless separately granted a permission.

### Student

Uses a verified institutional account to view enrolled courses,
materials, assignments, announcements, personal progress, and AI
conversations. A student can access personal uploads and authorized
course material only.

## 6. Authentication and institutional eligibility

-   Accepted domain: `yenepoy.edu.in` (exact domain; confirm with the
    institution before launch).
-   Normalize email addresses by trimming whitespace and lowercasing
    before comparison.
-   Validate the domain on the server for registration and login;
    client-side validation is only a usability aid.
-   Require verification of mailbox ownership before activating a
    self-registered student account.
-   Do not accept a role field from public registration.
-   Public registration creates `STUDENT` only.
-   Faculty accounts are created through authorized
    invitation/provisioning.
-   Admin accounts are created through a controlled bootstrap or
    authorized provisioning process.
-   Apply the institutional-domain policy to existing accounts as well
    as new accounts.
-   Domain validation alone is not proof of enrollment or employment.
    Add roster/invitation validation if the university requires it.

## 7. Functional requirements

### 7.1 Authentication

-   FR-AUTH-01: A user can log in with a valid institutional email and
    password or configured identity provider.
-   FR-AUTH-02: A student can register using an eligible institutional
    email.
-   FR-AUTH-03: The system verifies email ownership before activating a
    student account.
-   FR-AUTH-04: A user can log out and invalidate the current session.
-   FR-AUTH-05: A user can request a password reset without revealing
    whether an account exists.
-   FR-AUTH-06: The user can view their own profile and role
    memberships.
-   FR-AUTH-07: Suspended, disabled, unverified, or revoked users cannot
    access protected resources.
-   FR-AUTH-08: Faculty/admin provisioning is restricted to authorized
    operators.
-   FR-AUTH-09: Authentication endpoints are rate-limited and audited
    without recording secrets.

### 7.2 Admin

-   FR-ADM-01: Create and update departments.
-   FR-ADM-02: Create and update programs, academic years, terms, and
    courses.
-   FR-ADM-03: Provision users and assign allowed roles.
-   FR-ADM-04: Enroll students and assign faculty to courses/sections.
-   FR-ADM-05: Publish university-wide or scoped announcements.
-   FR-ADM-06: Configure AI limits and approved university knowledge
    sources.
-   FR-ADM-07: View permitted system analytics and audit records.

### 7.3 Faculty

-   FR-FAC-01: View assigned courses and enrolled students.
-   FR-FAC-02: Upload course materials with visibility settings.
-   FR-FAC-03: Create assignments and deadlines.
-   FR-FAC-04: View and review submissions for assigned courses.
-   FR-FAC-05: Record attendance if the module is enabled.
-   FR-FAC-06: Publish course announcements.
-   FR-FAC-07: Generate study resources with AI, subject to configured
    limits.

### 7.4 Student

-   FR-STU-01: View enrolled courses and authorized materials.
-   FR-STU-02: View assignments, deadlines, submission state, and
    feedback.
-   FR-STU-03: Submit assignments within allowed rules.
-   FR-STU-04: View timetable, announcements, attendance, and progress
    where enabled.
-   FR-STU-05: Upload private study documents.
-   FR-STU-06: Create, revisit, rename, and delete their own AI chats.
-   FR-STU-07: Request summaries, explanations, flashcards, quizzes, and
    brainstorming.
-   FR-STU-08: See citations for source-grounded answers when sources
    are available.

### 7.5 AI assistant

-   FR-AI-01: Support `GENERAL`, `MY_DOCUMENTS`, `MY_COURSES`, and
    `UNIVERSITY_KNOWLEDGE` modes.
-   FR-AI-02: Verify user access to a chat and every retrieved document.
-   FR-AI-03: Save messages and usage metadata.
-   FR-AI-04: Return clear errors if the provider is unavailable or
    limits are reached.
-   FR-AI-05: Avoid claiming that a response is official unless grounded
    in an approved source.
-   FR-AI-06: Provide source names and page/chunk references where
    available.
-   FR-AI-07: Treat retrieved document text as untrusted content, not
    system instructions.
-   FR-AI-08: Enforce file size/type limits and isolate document
    processing.
-   FR-AI-09: Support user feedback and regeneration in a later
    iteration.

## 8. Core workflows

### Student registration

1.  Student submits name, institutional email, and password.
2.  Server normalizes and validates email domain and request data.
3.  Server checks duplicates and applicable enrollment eligibility.
4.  Password is hashed using an approved password-hashing algorithm.
5.  Account is created as pending/unverified.
6.  A short-lived, single-use verification token is sent.
7.  Verification activates the account if all checks pass.
8.  User logs in and sees the student dashboard.

### Faculty course workflow

1.  Admin provisions/invites faculty.
2.  Admin assigns faculty to a course/section.
3.  Faculty uploads material and creates an assignment.
4.  Enrolled students see the material and assignment.
5.  Faculty reviews authorized submissions and provides feedback.

### AI document chat

1.  Student uploads a supported document.
2.  Server checks authentication, quota, size, MIME/signature, and
    ownership.
3.  File is stored privately; metadata is recorded.
4.  Processing extracts text, chunks it, and optionally indexes
    embeddings.
5.  Student asks a question.
6.  Server verifies access to the chat and source documents.
7.  Retrieval selects relevant chunks and sends minimal necessary
    context to the model.
8.  Response is returned with source references and saved to the chat.

## 9. UX requirements

-   Responsive desktop-first layouts that remain usable on mobile.
-   Clear loading, empty, success, error, and unauthorized states.
-   Accessible labels, keyboard navigation, visible focus, and
    appropriate contrast.
-   Search/filter/pagination for administrative tables.
-   AI chat with history sidebar, new chat, mode selection, upload,
    citations, copy, and follow-up prompts.
-   Never expose raw server stack traces, secrets, or internal error
    details to users.
-   Do not use fabricated academic records as if they were real. Seed
    data must be clearly synthetic.

## 10. Success metrics

Initial targets should be agreed by the team and measured from a
baseline: - 100% of protected API routes have authentication and
permission tests. - 100% of registration/login paths enforce the
configured domain policy. - No cross-user chat or file access in
automated authorization tests. - Successful completion of the end-to-end
demo workflow. - AI response latency, provider error rate, token/cost
usage, and user feedback are observable. - Failed requests provide
actionable, non-sensitive errors. - Database migrations can be applied
to a clean environment and a staging database.

Do not set arbitrary AI accuracy targets before collecting
representative test questions and source documents.

## 11. Acceptance criteria for MVP

The MVP is accepted when: - An eligible student can register, verify
email, log in, and log out. - Non-institutional domains are rejected by
the server. - Faculty/admin access is provisioned, not self-assigned
through public signup. - Admin can create a department/course and assign
faculty. - Faculty can upload authorized course materials and create an
assignment. - Enrolled students can view the course and submit work. -
Students can chat with the AI and ask questions about a permitted PDF. -
Document answers include source references where extraction supports
them. - A student cannot access another user's chat or private upload by
changing IDs. - Automated tests cover authentication, role checks,
ownership, and key workflows. - The app can be deployed from documented
steps.

## 12. Risks and mitigations

-   **Email domain does not prove enrollment:** use verified email plus
    roster/invitation checks where needed.
-   **AI hallucination:** retrieve approved sources, show citations, and
    state uncertainty.
-   **Prompt injection in documents:** treat source text as untrusted;
    isolate it from system instructions.
-   **Data leakage:** enforce authorization at retrieval time, not just
    at upload time.
-   **Scope creep:** ship the MVP before advanced analytics and optional
    modules.
-   **Provider lock-in:** use an AI adapter interface and
    provider-neutral message schema.
-   **Unexpected costs:** rate limits, quotas, timeouts, usage logging,
    and per-user budgets.
