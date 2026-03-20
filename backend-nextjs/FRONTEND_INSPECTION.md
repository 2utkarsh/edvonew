# Frontend Inspection Summary

This backend scaffold was shaped from the current Next.js frontend, not from the Laravel application.

## Directly observed API usage in the frontend

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/courses`
- `GET /api/jobs`
- `POST /api/subscribes`

## Strongly implied data domains from the frontend structure

- Users and role-based auth (`student`, `instructor`, `admin`)
- Courses with nested curriculum, mentors, plans, offerings, FAQs, testimonials, and pricing
- Exams with categories, pricing, duration, attempts, FAQs, outcomes, and reviews
- Jobs / job circulars with filters, deadlines, skills, and company metadata
- Enrollments for both courses and exams
- Dashboard analytics for students and admins
- CMS-like pages and system settings for header/footer/page content
- Newsletter subscriptions

## Frontend files that strongly informed the backend shape

- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/courses/page.tsx`
- `src/app/courses/[id]/page.tsx`
- `src/app/jobs/page.tsx`
- `src/components/subscribe-input.tsx`
- `src/app/dashboard/admin/courses/page.tsx`
- `src/app/dashboard/admin/index.tsx`
- `src/app/dashboard/student/page.tsx`
- `src/layouts/dashboard/partials/routes.tsx`
- `src/types/index.ts`

## Route design intent

The backend routes are split into:

- Public API: auth, courses, course details, exams, exam details, jobs, subscriptions
- Student API: dashboard summary and enrollments-oriented reads
- Admin API: CRUD and analytics for users, courses, exams, jobs, pages, settings

## Deliberate non-goals in this pass

- No frontend integration yet
- No Laravel compatibility layer
- No payment gateway implementation yet
- No file storage implementation yet
- No background jobs or email provider integration yet

