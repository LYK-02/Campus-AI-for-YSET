# Campus AI — UI/UX Design Specification

**Institution:** Yenepoya School of Technology  
**Abbreviation:** YSET  
**Product:** Campus AI  
**Audience:** Students, faculty, administrators, designers, and frontend engineers  
**Platform:** Responsive web application for desktop, laptop, tablet, and mobile  
**Status:** Design specification; verify official institutional brand assets before release.

---

## 1. Project overview

Design a modern, premium, production-quality university management and AI-powered campus platform called **Campus AI — Yenepoya School of Technology (YSET)**.

The product combines a student portal, academic management dashboard, and AI-powered campus assistant into one cohesive experience. It should feel like a real SaaS product for a modern technology university—not a generic college website, basic admin template, or flashy AI landing page.

### Design goals

- Professional, trustworthy, academic, modern, and student-friendly.
- Clear information hierarchy, consistent spacing, and low-friction workflows.
- A consistent application shell with role-specific experiences for students, faculty, and administrators.
- Strong usability on desktop and mobile.
- Accessible controls, readable text, and meaningful loading, empty, error, success, and permission-denied states.
- Reusable components and design tokens suitable for implementation in React.

## 2. Visual identity and design system

### Brand direction

Use subtle visual references to engineering, learning, innovation, and artificial intelligence. Use the full name **Yenepoya School of Technology** in appropriate branding areas, **YSET** as the short institutional identifier, and **Campus AI** as the product name.

Do not invent an official university logo or imply that proposed colors are official brand colors. Use a typographic wordmark or neutral logo placeholder until approved assets are supplied.

### Proposed color palette

| Token | Color | Intended use |
|---|---|---|
| Primary | `#142B4A` | Deep navy, navigation, primary brand surfaces |
| Secondary | `#315EAA` | Secondary actions, links, highlights |
| Accent | `#17A89B` | AI-related features and selected accents |
| Background | `#F6F8FC` | Main page background |
| Surface | `#FFFFFF` | Cards, dialogs, forms |
| Text primary | `#172033` | Headings and body text |
| Text secondary | `#68758A` | Supporting text and metadata |
| Border | `#E3E8F0` | Dividers, outlines, card borders |
| Success | `#16845B` | Successful states |
| Warning | `#D99019` | Warnings and approaching deadlines |
| Error | `#D64545` | Errors and destructive states |

Use navy and blue for navigation and primary actions, teal for AI-related features, and neutral backgrounds for readability. Maintain accessible contrast. Avoid excessive gradients, glowing effects, heavy shadows, and decorative clutter.

### Typography

- Use Inter, Manrope, or a similar clean sans-serif font.
- Use clear page titles, compact section headings, readable body text, and consistent form labels.
- Define a consistent type scale and line height.
- Avoid overly small metadata and low-contrast text.

### Components and tokens

- Cards: approximately 12–16 px corner radius.
- Subtle borders and restrained shadows.
- Consistent primary, secondary, tertiary, and destructive button styles.
- Lucide-style icons.
- Consistent spacing, icon sizes, form heights, and focus states.
- Clearly distinguish hover, focus, selected, disabled, loading, empty, success, and error states.
- Use charts only when they communicate useful academic or administrative information.
- Create reusable tokens for color, spacing, typography, radii, shadows, and breakpoints.

## 3. Application shell and responsive layout

Create three role-specific experiences:

1. Student Portal.
2. Faculty Portal.
3. Administrator Dashboard.

Use a consistent shell across roles, with navigation and data appropriate to each user's permissions.

### Desktop

- Collapsible left sidebar.
- Top navigation with page title or breadcrumbs.
- Global search where useful.
- Notifications.
- User avatar and profile menu.
- Main content area with a consistent maximum width and responsive grid.

### Mobile and tablet

- Replace the sidebar with a mobile navigation drawer or bottom navigation where appropriate.
- Use responsive cards and tables.
- Make the AI assistant comfortable to use on small screens.
- Optimize forms and buttons for touch.
- Prevent horizontal overflow.
- Keep important actions visible without crowding the screen.

## 4. Required screens

### 4.1 Login

Create a polished Campus AI login page.

**Desktop layout:** Split screen. The left side contains a branded visual panel with abstract geometric shapes inspired by engineering, learning, and digital innovation. The right side contains a clean login form on a white or very light background.

**Mobile layout:** Single column.

**Content:**
- YSET institutional identifier.
- Campus AI wordmark.
- Heading: “Welcome back”.
- Supporting text: “Your campus, courses, and AI assistant—all in one place.”
- Email address.
- Password with show/hide control.
- Remember-me option only if compatible with the selected authentication model.
- Forgot password link.
- Primary button: “Sign in”.
- Link to student registration.
- Footer: “Yenepoya School of Technology (YSET)”.
- Notice: “Use your authorized YSET account.”

Include validation, loading, generic authentication failure, and success/redirect states.

### 4.2 Student registration and email verification

Fields:
- Full name.
- Institutional email address.
- Student ID, if required by the enrollment process.
- Department or program, if appropriate.
- Password.
- Confirm password.

Requirements:
- Clearly state that student self-registration requires an `@yenepoya.edu.in` email address.
- Show inline validation and understandable error messages.
- Include password visibility controls and a link to login.
- Show a separate email-verification state after signup.
- Include loading, success, pending approval, expired verification link, and resend verification states.
- Do not show a role selector. Students cannot choose faculty or admin privileges.

The backend—not the UI—must enforce the domain, verification, and role rules.

### 4.3 Student dashboard

**Welcome section:**
- Heading: “Good morning, [Student Name]”.
- Supporting text: “Here's what's happening with your academics today.”
- Prominent “Ask Campus AI” action.

**Dashboard cards:**
- Enrolled courses.
- Upcoming assignments.
- Classes or academic events today.
- Pending tasks.
- Recent learning materials.
- Latest campus announcements.

**Layout:**
- Main column: upcoming deadlines, course activity, and announcements.
- Secondary column: Campus AI preview, upcoming events, and quick actions.

**Quick actions:**
- Ask Campus AI.
- View my courses.
- Open learning materials.
- View assignments.
- View timetable.
- Browse campus announcements.

Prioritize information the student needs immediately. Do not fill the dashboard with meaningless statistics. Sample data must be clearly illustrative.

### 4.4 Campus AI chatbot

Make this a distinctive, polished interface for a reliable academic assistant.

**Heading:** “Campus AI”  
**Supporting text:** “Your AI-powered academic and campus companion.”

**Layout:**
- Main conversation panel.
- Message-history sidebar on desktop.
- Clear visual distinction between student and assistant messages.
- Composer near the bottom of the conversation panel.
- Responsive mobile layout.
- New conversation action.
- Searchable conversation history where practical.

**Starter prompts:**
- “Explain my course material.”
- “Summarize this PDF.”
- “Help me prepare for an exam.”
- “Create a quiz from my notes.”
- “Find information about campus services.”
- “What assignments are due soon?”

**Response features:**
- Readable Markdown.
- Headings, lists, code blocks, and tables when appropriate.
- Source citations for university-policy and document-based answers.
- Expandable source cards showing document title and relevant page or section.
- Copy response.
- Regenerate response.
- Helpful feedback controls.
- Loading and error states.

**Composer:**
- Multiline text input.
- Send button.
- Attach-document button where permitted.
- Upload status.
- Keyboard shortcut hint.
- Character/file limits where useful.

**Assistant modes:**
- General Assistant.
- My Documents.
- My Courses.
- University Knowledge.

Explain that document and course answers use content the student is authorized to access. Do not imply that the AI can see all university records.

**Trust and safety UX:**
- Note: “AI responses may contain mistakes. Verify important academic and university information using the cited sources.”
- If reliable evidence is unavailable, show an honest response rather than fabricated citations.
- Do not display fake confidence percentages.
- Provide a clear provider-failure state and safe retry action.

### 4.5 My Courses and course details

Create a course overview page with:
- Page title: “My Courses”.
- Search and filter controls.
- Responsive course cards or a compact list.

Each course card may include:
- Course name and code.
- Faculty name.
- Semester.
- Progress indicator only when meaningful data exists.
- Upcoming assignment or next class.
- “Open Course” action.

Course details should include:
- Overview.
- Faculty information.
- Learning materials.
- Assignments.
- Announcements.
- Course-specific AI assistance.

Use tabs or segmented navigation for Overview, Materials, Assignments, and Announcements.

### 4.6 Learning materials

Features:
- Search materials.
- Filter by course, type, and upload date.
- File cards for PDFs, presentations, documents, and links.
- Title, course, faculty/uploader, file type, size, and upload date when available.
- Preview/download actions subject to permission.
- Empty, loading, and upload/download error states.

Use recognizable file-type icons and consistent layouts. Never show private faculty drafts or files belonging to other students.

### 4.7 Assignments

Features:
- Tabs or filters: All, Upcoming, Submitted, Graded.
- Assignment title, course, faculty, due date/time, status, submission action, and feedback/grade when authorized.
- Status labels: Upcoming, Submitted, Overdue, Graded.

Assignment details:
- Instructions.
- Due date.
- Attached resources.
- Submission area.
- Submission confirmation.
- Faculty feedback and grade when released.

Make deadlines easy to scan without relying on color alone. Include validation, upload progress, confirmation, and submission receipt states.

### 4.8 Faculty dashboard

Heading: “Faculty Workspace”.

Summary cards:
- Courses assigned.
- Active assignments.
- Pending submissions to review.
- Upcoming classes or academic events.

Main sections:
- My Courses.
- Recent submissions.
- Upcoming deadlines.
- Recent course announcements.
- Quick actions.

Quick actions:
- Upload learning material.
- Create assignment.
- Publish announcement.
- Review submissions.
- Open course.

Faculty must see only courses and student records they are authorized to manage.

### 4.9 Faculty course management

Use tabs:
- Overview.
- Students.
- Materials.
- Assignments.
- Submissions.
- Announcements.

Features:
- Upload course materials.
- Create and edit assignments.
- Set deadlines.
- Publish announcements.
- Review student submissions.
- Provide feedback and grades when authorized.
- Filter submissions by status.

Use confirmation dialogs for destructive actions. Distinguish drafts from published content and show publication status.

### 4.10 Administrator dashboard

Create a professional administration interface for clarity and efficient management.

Sidebar:
- Overview.
- Users.
- Departments.
- Courses.
- Faculty.
- Students.
- Announcements.
- Knowledge Base.
- AI Usage.
- Audit Logs.
- Settings.

Overview may include:
- Active students.
- Faculty accounts.
- Active courses.
- Published materials.
- Recent administrative activity.
- System health indicators only when connected to real monitoring data.
- AI usage/cost summaries only when supported by actual backend data.

Use charts sparingly and label them clearly. Never fabricate live system-health values.

### 4.11 User management

Features:
- Search users.
- Filter by role, department, account status, and verification status.
- Pagination and sortable columns.
- User details drawer or detail page.
- Invite/provision faculty and admin accounts.
- Activate, suspend, or deactivate accounts according to permissions.
- Trigger verification or access recovery flows where authorized.

Table columns:
- Name.
- Institutional email.
- Role.
- Department.
- Status.
- Created date.
- Actions.

Use confirmation dialogs for suspension, role changes, and other high-impact operations. Show administrative actor context when available. Do not provide public admin registration.

### 4.12 Department and course management

**Departments:**
- Department name.
- Department code.
- Head/coordinator where applicable.
- Number of courses.
- Status.

**Courses:**
- Course name and code.
- Department.
- Semester.
- Assigned faculty.
- Enrollment count.
- Publication/active status.

Use validated forms, confirmation states, clear errors, and dependency warnings before deleting or archiving entities.

### 4.13 University Knowledge Base

Design an admin/faculty interface for managing approved documents used by Campus AI.

Features:
- Upload approved policies, academic calendars, campus guides, FAQs, and course documents.
- Document list with title, category, visibility, owner, version, and processing status.
- Search and filters.
- Preview metadata.
- Retry failed processing.
- Publish, archive, or remove documents based on permission.
- Show indexing status and last successful update.

Processing states:
- Uploaded.
- Processing.
- Ready.
- Failed.
- Archived.

Make clear that uploaded documents are not automatically public. The uploader or administrator must set an appropriate visibility scope.

### 4.14 AI usage and audit logs

Create a restricted administrative page.

**AI usage:**
- Requests over time.
- Token consumption.
- Provider error rate.
- Usage by authorized organizational scope.
- Estimated cost only when reliable cost data exists.
- Date filters.

**Audit logs:**
- Timestamp.
- Actor.
- Action.
- Target resource.
- Outcome.
- Request ID.

Provide pagination and filters. Mask sensitive data. Never display passwords, session tokens, secret keys, or complete private document contents.

### 4.15 Notifications and profile

**Notifications:**
- Assignment deadlines.
- New course materials.
- Faculty announcements.
- Assignment feedback.
- Important account notices.

**Profile:**
- Name.
- Institutional email.
- Student/staff identifier where appropriate.
- Department/program.
- Account security options.
- Active-session controls if supported.

Do not expose role-changing controls to students.

## 5. Navigation and UX rules

- Use consistent navigation labels across the product.
- Keep the primary sidebar compact and scannable.
- Use breadcrumbs for deeply nested admin and faculty pages.
- Keep search, filters, and pagination consistent.
- Avoid unnecessary modal dialogs for complex workflows.
- Do not display controls that imply an unsupported feature is operational.
- Clearly distinguish sample data from real system data.
- Use confirmation steps for destructive or high-impact actions.
- Design accessible focus states and keyboard navigation.
- Use semantic HTML, visible focus, proper labels, and accessible error messaging.
- Do not rely on color alone to communicate status.
- Every action should provide appropriate loading, success, and failure feedback.

## 6. Required UI states

For every important screen, design:
- Default state.
- Loading state, with skeletons where useful.
- Empty state with a helpful next action.
- Validation errors.
- API failure state with retry options where safe.
- Success confirmation.
- Disabled state.
- Permission-denied or unavailable state.
- Confirmation dialog for destructive actions.
- Responsive mobile layout.

Use realistic, varied content rather than repeated placeholder text. Keep tables readable and forms compact. Make the primary action on each screen visually obvious.

## 7. Security and privacy UX requirements

- Student registration must visibly explain the `@yenepoya.edu.in` requirement.
- Do not offer a role selector during public signup.
- Display only data the signed-in user is permitted to access.
- Do not show private drafts or another user's private documents.
- AI source cards must link only to authorized sources.
- Do not expose secrets or full private document contents in audit screens.
- Use generic authentication errors where revealing account existence could create risk.
- Show account verification, pending approval, suspension, and expired-session states clearly.
- Treat UI permission checks as presentation only; backend authorization remains authoritative.

## 8. Stitch deliverables

Generate a coherent design system and high-fidelity responsive screens for:

1. Login.
2. Student registration and email verification.
3. Student dashboard.
4. Campus AI chatbot.
5. My Courses.
6. Course details.
7. Learning materials.
8. Assignments and assignment details.
9. Faculty dashboard.
10. Faculty course management.
11. Admin dashboard.
12. User management.
13. Department and course management.
14. University Knowledge Base.
15. AI usage and audit logs.
16. Notifications and profile.

Use consistent reusable components, spacing, typography, colors, icons, and responsive behavior across all screens.

Prioritize the **Student Dashboard** and **Campus AI Chatbot** as the primary product experience, then design faculty and administrator workflows using the same design system.

## 9. Recommended generation order

To keep the design system consistent, generate/refine screens in this order:

1. Establish color tokens, typography, spacing, buttons, inputs, cards, tables, and sidebar.
2. Generate Login and Student Registration.
3. Generate Student Dashboard and Campus AI Chatbot.
4. Generate My Courses, Course Details, Materials, and Assignments.
5. Generate Faculty Dashboard and Faculty Course Management.
6. Generate Admin Dashboard, User Management, and Department/Course Management.
7. Generate Knowledge Base, AI Usage, and Audit Logs.
8. Generate Notifications/Profile and responsive mobile variants.
9. Review all screens for consistency, accessibility, and missing states.

## 10. Final design goal

Campus AI should feel like a premium, trustworthy, AI-enabled academic workspace built specifically for **Yenepoya School of Technology (YSET)**: clean enough for everyday student use, powerful enough for faculty, and structured enough for university administration.

The suggested colors are a proposed product palette, not a claim about YSET's official brand colors. Replace placeholder branding with approved institutional assets before release.
