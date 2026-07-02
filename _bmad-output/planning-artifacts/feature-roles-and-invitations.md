# Feature Plan — Roles, Invitations & Instructor Dashboard

Status: DRAFT (pending Alex's confirmation)
Stack chosen: **Supabase** (Postgres + magic-link auth) + **Resend** (email)

## 1. Goal
Add two roles (instructor, student). Instructors build exam templates from the question
bank and invite students by email / WhatsApp link. Students take the exam **once** per
invitation; results are computed on the server, stored, emailed automatically, and shown
to the instructor in a results table.

## 2. Why a database is required
Today the app is 100% client-side (`src/lib/storage.ts` = localStorage). None of these
features can be trusted or shared without a server:
- instructor viewing ALL students' results (must be central, not per-browser)
- "one attempt only" (a browser flag can be reset; must be server-enforced)
- magic-link auth + roles
- sending email (API keys cannot live in the browser)

## 3. Data model (Supabase / Postgres)
- **profiles** — `id (=auth.users.id)`, `email`, `full_name`, `role: 'instructor' | 'student'`, `created_at`
- **exam_templates** — `id`, `instructor_id`, `title`, `description`, `question_uids jsonb`, `pass_mark`, `max_score`, `time_limit_min`, `created_at`
- **invitations** — `id`, `token (unique)`, `template_id`, `instructor_id`, `student_email`, `status: 'pending'|'used'|'expired'`, `expires_at`, `used_at`, `created_at`
- **attempts** — `id`, `invitation_id`, `student_id`, `template_id`, `score`, `max_score`, `passed`, `answers jsonb`, `started_at`, `finished_at`

**One-attempt rule:** when an attempt is finished, `invitation.status → 'used'`. A retake
needs a brand-new invitation. Enforced with a DB constraint + RLS.

## 4. Auth & roles (magic link)
- Supabase magic-link (passwordless email).
- Role lives in `profiles.role`.
- Student's login email must match `invitation.student_email`.
- OPEN Q: how is the FIRST instructor granted? (seed a whitelist email — simplest.)

## 5. Flows
1. Instructor logs in (magic link) → `/instructor` dashboard.
2. Instructor builds a template (pick questions from bank) → stores `question_uids`.
3. Instructor creates an invitation for a student email → gets a link + `wa.me` share button + optional email send.
4. Student opens link → magic-link login → takes exam (reuse existing exam UI).
5. On finish → server grades (reuse `gradeExam` from `src/lib/scoring.ts`), saves attempt, marks invitation used, emails result via Resend.
6. Instructor dashboard shows a table: student, template, score, passed, date.

## 6. Pages / routes
- `/login` — magic link
- `/instructor` — results table (dashboard)
- `/instructor/templates` — list + create (question picker)
- `/instructor/invite` — create/send invitation (+ wa.me link)
- `/exam/[token]` — student exam (adapts `src/app/examen`)
- Server actions / route handlers: `createInvitation`, `submitAttempt`

## 7. Reuse from existing code
- `src/lib/scoring.ts` (`gradeExam`) — grade server-side.
- `src/app/examen/page.tsx` + `QuestionCard` / `ExamResults` components — student exam UI.
- `src/data/questions*.json` — question bank (templates reference `uid`s).

## 8. Phased roadmap
- **P0** Supabase project + schema + RLS + env vars + auth scaffolding.
- **P1** Magic-link login + roles + instructor dashboard shell.
- **P2** Exam templates + question picker.
- **P3** Invitations + Resend email + wa.me share link.
- **P4** Student exam via token + one-attempt enforcement.
- **P5** Auto-email results + instructor results table.

## 9. Open questions for Alex
1. First-instructor bootstrap: whitelist your email? (recommended)
2. Should the **instructor** also get a copy of each result email?
3. WhatsApp: start with a free `wa.me` prefilled link (no API), yes?
4. Per-template settings: keep fixed 270/360, or let instructor set pass mark & time limit?
5. Student login: require magic-link (secure), or allow token-only access (simpler, less secure)?
