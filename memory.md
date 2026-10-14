# Campus AI — Project Memory & Status Tracker

**Institution:** Yenepoya School of Technology (YSET)  
**Accepted Domain:** `yenepoya.edu.in`  
**Current Phase:** Phase 1, 2, 3, 4 Complete & Polished (`feat/phase-4-faculty-student-workflows`) → Ready for Phase 5 (Vector Embeddings & RAG Ingestion)  
**Last Updated:** 2026-10-14  

---

## 1. Locked Architectural Decisions (Phase 0)

| Decision Item | Approved Design | Reference |
|---|---|---|
| **Architecture** | Modular monolith with vertical slices; backend and frontend decoupled. | `docs/DELIVERY_ROADMAP.md` |
| **Authentication** | Short-lived access JWT (15m) + rotating, revocable refresh tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies. Stored hashed in `AuthSession` with reuse detection. | `docs/04_AUTH_SECURITY.md` |
| **Domain Policy** | Exact suffix `@yenepoya.edu.in` enforced on the server. Self-registration is strictly for `STUDENT` role with mandatory Roll ID; faculty and admins are provisioned/invited. | `docs/01_PRD.md` |
| **AI Engine Adapter** | NVIDIA NIM (Nemotron 3 Ultra / `nvidia/llama-3.1-nemotron-70b-instruct`) using OpenAI-compatible REST adapter (`https://integrate.api.nvidia.com/v1`). | `docs/07_AI_ASSISTANT.md` |
| **Database & ORM** | PostgreSQL (running locally on port 5432) with Prisma ORM v6. | `docs/03_DATABASE_SCHEMA.md` |
| **Frontend Design** | React + Vite + TypeScript + Tailwind CSS v4 with YSET brand design tokens. Adheres strictly to `impeccable` craft floor rules (no gradient text, no eyebrow kickers, high contrast, browser surface theming). | `docs/DESIGN.md`, `craft-floor.md` |

---

## 2. Completed Foundation Deliverables (Phase 1)

### Repository Root
- `.gitignore`: Comprehensive ignore rules preventing `node_modules/`, `.env`, build artifacts (`dist/`), `uploads/`, and temporary caches from entering Git.
- `README.md`: Central documentation linking to all 16 specification files in `docs/`.

### Backend (`backend/`)
- **Runtime & Setup**: Node.js v24 + Express 5 + TypeScript in strict mode.
- **Dependencies**: `express`, `helmet`, `cors`, `cookie-parser`, `zod`, `morgan`, `uuid`, `bcryptjs`, `jsonwebtoken`, `@prisma/client`, `prisma`, `tsx`.
- **Environment Validation**: `src/config/env.ts` with strict Zod parsing at startup; `.env.example` and `.env` configured.
- **Middleware**:
  - `src/middleware/request-id.ts`: Injects correlation ID (`X-Request-Id`) across requests.
  - `src/middleware/error-handler.ts`: Centralized error handler returning spec-compliant JSON envelopes without leaking secrets.
  - `src/middleware/not-found.ts`: 404 route handler.
- **Health Check**: `GET /api/v1/health` returning uptime, timestamp, and database connectivity.
- **Database Schema**: `prisma/schema.prisma` containing all required models:
  - `University`, `User`, `UserRole`, `AuthSession`, `VerificationToken`, `PasswordResetToken`
  - `Department`, `Course`, `Enrollment`, `TeachingAssignment`, `TimetableSlot`
  - `Material`, `DocumentChunk`, `Chat`, `Message`
  - `Assignment`, `Submission`, `Announcement`, `AuditLog`, `AIUsageLog`
- **Validation**: Prisma client generated (`prisma generate`), TypeScript compile verified (`tsc`), and live HTTP 200 response confirmed.

### Frontend (`frontend/`)
- **Runtime & Setup**: Vite + React 19 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite`).
- **Brand Tokens (`src/index.css`)**:
  - Primary Navy: `#142B4A` (Hover: `#0F2038`)
  - Secondary Blue: `#315EAA` (Hover: `#264A86`)
  - AI Accent Teal: `#17A89B` (Hover: `#13897E`, Light: `#E8F7F6`)
  - Background: `#F6F8FC`
  - Surface: `#FFFFFF`
  - Text Primary: `#172033`
  - Text Secondary: `#68758A`
  - Border: `#E3E8F0`
- **Browser Surfaces & Typography**:
  - Inter & JetBrains Mono web fonts imported.
  - Custom `::selection` highlighting with institutional teal tint.
  - Sleek custom webkit scrollbars and `:focus-visible` accessible rings.
  - Tabular numeric alignment (`tabular-nums`) for academic data, credits, and timetables.
- **API Client**: `src/lib/api-client.ts` with automatic credential inclusion, token refresh interceptor, and `/api/v1` prefix.
- **Session State**: `src/context/auth-context.tsx` managing user profile and `/auth/me` checks.
- **Shared App Shell**: `src/components/layout/AppLayout.tsx` featuring YSET responsive sidebar navigation with role-specific items (`STUDENT`, `FACULTY`, `ADMIN`).

---

## 3. Completed Authentication & Access Control (Phase 2)

### Database Migration & Seeding
- **PostgreSQL 18**: Migration `0_init_yset_schema` successfully applied to database `campus_ai`.
- **Institutional Seeder (`backend/prisma/seed.ts`)**:
  - University: `Yenepoya School of Technology` (`yenepoya.edu.in`)
  - Department: `Computer Science & Engineering` (`CSE`)
  - Core curriculum courses for Semester 1 & 2
  - Default Admin: `admin@yenepoya.edu.in` / `Admin@YSET2026!`
  - Default Faculty: `faculty@yenepoya.edu.in` / `Faculty@YSET2026!`
  - Default Student: `student@yenepoya.edu.in` (`YSET-2026-CS-001`) / `Student@YSET2026!`

### Backend Authentication Slice
- **Middleware (`src/middleware/auth.ts`)**: JWT Bearer verification (`authenticate`) and role checking (`requireRoles`).
- **AuthService (`src/modules/auth/auth.service.ts`)**:
  - `registerStudent`: Enforces `@yenepoya.edu.in`, mandatory Roll ID, bcrypt password hashing, 24h verification token generation.
  - `verifyEmail`: Consumes single-use verification token and activates student account.
  - `login`: Validates credentials, checks email verification and status, issues 15-minute access JWT, issues 7-day rotating refresh token in `HttpOnly` cookie.
  - `refreshSession`: Session reuse detection, refresh token rotation, issues new access JWT.
  - `logout`: Revokes `AuthSession` and clears cookie.
  - `getMe`: Returns authenticated user profile.
- **Router (`src/modules/auth/`)**: Registered under `/api/v1/auth`.

---

## 4. Completed Timetable, Course Visibility & Academic Ops (Phase 3)

- **Branch**: `feat/phase-3-timetable-courses`
- **Admin Course Visibility Control**:
  - Course schema updated with `isVisibleToStudents: Boolean` (default `true`).
  - Admin toggle API: `PATCH /api/v1/academic/courses/:id/visibility`.
  - Student views (`StudentDashboard`, `CurriculumPage`, `TimetablePage`) strictly filter out hidden courses.
- **Algorithmic 5-Day Timetable Generator**:
  - Endpoint: `POST /api/v1/academic/timetable/generate`.
  - Distributes approved weekly courses across 5 weekdays (Monday–Friday) and 6 daily periods (09:00–16:15) with lunch break and conflict-free classroom allocation.
- **Timetable Views**:
  - Student & Faculty interactive timetable viewer (`/student/timetable`) with day filtering, ongoing class indicator pulse, period badges, and print view.

---

## 5. Completed Faculty & Student Workflows (Phase 4)

- **Branch**: `feat/phase-4-faculty-student-workflows`
- **PDF Materials Repository & Upload Architecture**:
  - Fixed PDF upload issues: increased Express JSON/URL-encoded body limit to 25MB, implemented disk persistence in `backend/uploads/materials/` with unique filenames.
  - Streaming download endpoint: `GET /api/v1/academic/materials/:id/download`.
  - Drag-and-drop file picker with file size formatting, PDF validation, and delete capabilities.
  - Student learning materials browser (`/student/materials`) with course filters and instant downloads.
- **Unified Coursework & Submissions Review**:
  - Combined duplicate `/faculty/assignments` and `/faculty/submissions` workflows into a single unified workspace with dual tabs:
    - Tab 1: `Assignments & Problem Sets` (create problem sets, specify max marks, rubrics, deadlines).
    - Tab 2: `Submissions & Grading Review` (inspect student deliverables, evaluation modal, score recording, qualitative feedback).
  - Student assignments portal (`/student/assignments`): view coursework, submission modal (text / LaTeX / repo link), real-time grade & feedback inspection.
- **Announcements & Circulars System**:
  - Real-time campus communication portal (`/announcements`) with priority badges, role targeting, and faculty/admin publishing.

---

## 6. Impeccable Design Audit & Hardening (Phase 4.5)

- **Impeccable Mechanical Detector**: Passed with 0 warnings (`[]`) across all 16 page and component files.
- **Craft Floor Rules Enforced**:
  - **No Eyebrow Kickers**: Removed floating uppercase tracking labels and pill tags above headings across all pages (`LandingPage`, `StudentDashboard`, `FacultyDashboard`, `FacultyAssignmentsPage`, `FacultyMaterialsPage`, `AdminDashboard`, `AdminCoursesPage`, `AnnouncementsPage`, `LoginPage`).
  - **No Gradient Text**: Replaced all `bg-clip-text` gradient titles with crisp solid institutional `#17A89B` / `#142B4A`.
  - **Color Contrast & Readability**: Replaced low-contrast gray text on colored backgrounds with $\ge 4.5:1$ compliant palettes.
  - **Solid Buttons**: Replaced gradient action buttons with crisp solid primary accents.
  - **No Pseudo-Monospace**: Replaced artificial font-mono styling with standard sans typography and `tabular-nums`.
- **Git Commit Discipline**: All file modifications committed individually with descriptive commit messages and pushed to remote branch `feat/phase-4-faculty-student-workflows`.

---

## 7. Next Up: Phase 5 (Vector Embeddings & RAG Ingestion)

1. **Document Ingestion Pipeline**:
   - Extract text from uploaded PDF materials in `backend/uploads/materials/`.
   - Chunk text using semantic sliding windows (`DocumentChunk` model).
2. **Embedding Generation**:
   - Integrate NVIDIA NIM / text embedding adapter (`nvidia/nv-embedqa-e5-v5` or compatible).
   - Store vectors with cosine similarity index in PostgreSQL (`pgvector`).
3. **AI Chat RAG Integration**:
   - Connect `AIChatPage.tsx` to live backend RAG query endpoint with role-scoped retrieval (`GENERAL`, `MY_COURSES`, `MY_DOCUMENTS`, `UNIVERSITY_KNOWLEDGE`).
   - Ground responses in verified course syllabus and return structured citations with page numbers.
