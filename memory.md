# Campus AI — Project Memory & Status Tracker

**Institution:** Yenepoya School of Technology (YSET)  
**Accepted Domain:** `yenepoya.edu.in`  
**Current Phase:** Phase 1 Complete → Ready for Phase 2 (Authentication & Access Control)  
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
| **Frontend Design** | React + Vite + TypeScript + Tailwind CSS v4 with YSET brand design tokens. | `docs/DESIGN.md` |

---

## 2. Completed Foundation Deliverables (Phase 1)

### Repository Root
- `.gitignore`: Comprehensive ignore rules preventing `node_modules/`, `.env`, build artifacts (`dist/`), and caches from entering Git.
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
  - `Department`, `Course`, `Enrollment`, `TeachingAssignment`
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
- **API Client**: `src/lib/api-client.ts` with automatic credential inclusion and `/api/v1` prefix.
- **Session State**: `src/context/auth-context.tsx` managing user profile and `/auth/me` checks.
- **Shared App Shell**: `src/components/layout/AppLayout.tsx` featuring:
  - YSET sidebar navigation with role-specific items (`STUDENT`, `FACULTY`, `ADMIN`)
  - Topbar with breadcrumbs, role badge, notifications, and quick "Ask Campus AI" action
  - Responsive mobile drawer navigation
- **Core Views**:
  - `LandingPage.tsx`: Institutional portal overview with feature cards and action CTAs.
  - `LoginPage.tsx`: Split-screen branded login matching `docs/DESIGN.md` §4.1.
  - `RegisterPage.tsx`: Student self-registration with `@yenepoya.edu.in` domain check and mandatory Roll ID. Branch and semester course enrollment are assigned post-verification by the administrator.
  - `StudentDashboard.tsx`: Enrolled courses, task deadlines, and AI study cards.
  - `FacultyDashboard.tsx`: Course assignments, submission review queue, and quick actions.
  - `AdminDashboard.tsx`: Institutional overview, user directory, knowledge base, and audit logs.
  - `AIChatPage.tsx`: Assistant UI supporting all 4 modes (`GENERAL`, `MY_COURSES`, `MY_DOCUMENTS`, `UNIVERSITY_KNOWLEDGE`) with citation card previews.
- **Branding & Model Attribution Polish**:
  - Replaced "Campus AI" with "YSET" across frontend navigation, headers, titles, and greetings.
  - Removed all user-facing references to "NVIDIA NIM Nemotron" and "NVIDIA NIM Nemotron contextual academic reasoning".
- **Official YSET Curriculum & Credit Sheets**:
  - Added official curriculum data for 4 B.Tech CSE branches across 8 semesters (`cse-aift`, `cse-aiml`, `cse-cs`, `cse-ds`) in `frontend/src/data/branches.ts` and `backend/src/data/branches.ts`.
  - Added interactive syllabus browser in `frontend/src/pages/student/CurriculumPage.tsx` with branch switcher, semester tabs (1–8), credit counts, and official PDF links.
  - Connected `StudentDashboard.tsx` to dynamically display the student's active branch, semester subjects, and credit weightage.
- **Validation**: Full build passed (`npm run build` -> 0 errors), dev server live test on port 5173 confirmed (HTTP 200).

---

## 3. Completed Authentication & Access Control (Phase 2)

### Database Migration & Seeding
- **PostgreSQL 18**: Migration `0_init_yset_schema` successfully applied to database `campus_ai`.
- **Prisma Client**: Generated v6.19.3.
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
- **AuthController & Router (`src/modules/auth/`)**: Registered under `/api/v1/auth`.

### Frontend Integration
- **`api-client.ts`**: Bearer token injection and automatic silent token refresh on 401.
- **`auth-context.tsx`**: Manages user profile, `login()`, `logout()`, and session restoration.
- **`LoginPage.tsx`**: Live authentication with role-based routing (`ADMIN`, `FACULTY`, `STUDENT`).
- **`RegisterPage.tsx`**: Student registration with mandatory Roll ID and `@yenepoya.edu.in` validation.
- **`VerifyEmailPage.tsx`**: Activation page mounted at `/verify-email`.

---

## 4. Next Phase: Timetable, Class Assignment & Administrative Verification

1. **Admin Verification Dashboard**:
   - List pending student registrations (`status: PENDING`).
   - Approve / reject student accounts and assign official branch (`cse-aift`, `cse-aiml`, etc.) and current semester.
2. **Timetable & Class Allocation System**:
   - Timetable creation interface for administrators.
   - Assign faculty and schedule periods/classrooms for approved subjects.
   - Interactive student and faculty timetable calendar views.
