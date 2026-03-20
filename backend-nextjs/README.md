# EDVO Next.js Backend

This is a separate Next.js backend scaffold for the current EDVO frontend. It does not connect the frontend yet and does not use the Laravel codebase.

## What it includes

- Next.js route-handler backend in a separate app folder
- MongoDB models for the main frontend domains
- JWT-based auth helpers for future frontend wiring
- Public routes for auth, courses, jobs, exams, and subscriptions
- Admin routes for users, courses, exams, jobs, pages, and settings
- Dashboard summary routes for student and admin views
- Frontend inspection notes so the backend shape stays aligned with the UI

## Install

```bash
cd backend-nextjs
npm install
cp .env.example .env.local
npm run dev
```

## Environment

- `MONGODB_URI`: Mongo connection string
- `JWT_SECRET`: signing key for access tokens
- `JWT_EXPIRES_IN`: token lifetime, for example `7d`

## Notes

- This backend is intentionally separate from the current frontend.
- The frontend is not wired to this backend yet.
- The route payloads are shaped around the observed Next.js frontend and its dashboard/course/job/auth flows.

