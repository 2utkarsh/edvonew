# Implementation Plan: Backend API Integration

## Overview

Build the JSON REST API layer on the existing Laravel 11 backend, wire the frontend proxy routes to forward to it, and ship a single SQL seed file for zero-terminal deployment. All backend work is in `deploy/packages/backend-edvo-laravel/`. Only 4 frontend files in `src/app/api/` are touched.

## Tasks

- [x] 1. Update CORS config and `.env.example`
  - In `deploy/packages/backend-edvo-laravel/config/cors.php`, set `allowed_origins` to `['*']`, add `Authorization` to `allowed_headers`, and ensure `supports_credentials` is `false`
  - In `deploy/packages/backend-edvo-laravel/.env.example`, add `OPS_TOKEN=`, `SANCTUM_STATEFUL_DOMAINS=`, and `FRONTEND_URL=` entries with inline comments
  - _Requirements: 7.2, 8.1, 8.2, 8.3_

- [x] 2. Create `CoursesApiController`
  - [x] 2.1 Implement `CoursesApiController` in `app/Http/Controllers/Api/CoursesApiController.php`
    - `index()`: query `courses` where `status = 'published'`, eager-load instructor user, category, reviews (avg rating + count), enrollments (count), apply `category`/`level`/`search`/`sort` query params, return `{ success, data, count }`
    - `show($id)`: load single course with sections, lessons, requirements, outcomes; return 404 JSON if not found
    - Map DB columns to frontend `Course` shape per the design field mapping table
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property test for course list shape and completeness (Property 1)
    - **Property 1: Course list response shape and completeness**
    - **Validates: Requirements 1.1, 1.5**
    - Insert N random published courses, GET `/api/courses`, assert `count == count(data)` and every item has all required fields
    - Use `->repeat(100)`

  - [ ]* 2.3 Write property test for course filter correctness (Property 2)
    - **Property 2: Course filter correctness**
    - **Validates: Requirements 1.2, 1.4**
    - Generate courses across random categories/levels, GET with filter param, assert every returned item satisfies the filter and no non-matching item appears
    - Use `->repeat(100)`

  - [ ]* 2.4 Write property test for course detail round-trip (Property 3)
    - **Property 3: Course detail round-trip**
    - **Validates: Requirements 1.3**
    - For a random existing course id, GET `/api/courses/{id}`, assert `data.id` matches and `curriculum`, `whatYouWillLearn`, `requirements` are arrays
    - Use `->repeat(100)`

- [x] 3. Create `JobsApiController`
  - [x] 3.1 Implement `JobsApiController` in `app/Http/Controllers/Api/JobsApiController.php`
    - `index()`: query `job_circulars` where `status = 'active'`, apply `type`/`location`/`search`/`experience` filters, default sort `created_at DESC`
    - Map DB columns to frontend `Job` shape (format salary string from `salary_min`/`salary_max`/`salary_currency`; map `job_type`/`work_type` to `type`; map `skills_required` to `skills`)
    - Return `{ success, data, count }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Write property test for job list shape and completeness (Property 4)
    - **Property 4: Job list response shape and completeness**
    - **Validates: Requirements 2.1, 2.3**
    - Insert N random active job circulars, GET `/api/jobs`, assert `count == count(data)` and every item has all required fields
    - Use `->repeat(100)`

  - [ ]* 3.3 Write property test for job filter correctness (Property 5)
    - **Property 5: Job filter correctness**
    - **Validates: Requirements 2.2**
    - Generate jobs with varied types/locations, GET with filter, assert every returned job satisfies the filter
    - Use `->repeat(100)`

  - [ ]* 3.4 Write property test for job default sort order (Property 6)
    - **Property 6: Job default sort order**
    - **Validates: Requirements 2.4**
    - Insert jobs with random `created_at` values, GET `/api/jobs`, assert each adjacent pair satisfies `a.postedDate >= b.postedDate`
    - Use `->repeat(100)`

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create `AuthApiController`
  - [x] 5.1 Implement `AuthApiController` in `app/Http/Controllers/Api/AuthApiController.php`
    - `register()`: validate `name`, `email`, `password`, `password_confirmation`; create user with `role = 'student'`; issue Sanctum token; return `{ success, data: { user, token } }` HTTP 201
    - `login()`: validate credentials with `Auth::attempt()`; issue token; return `{ success, data: { user, token } }` HTTP 200 or `{ success: false, error }` HTTP 401
    - `logout()`: call `auth()->user()->currentAccessToken()->delete()`; return HTTP 200
    - `me()`: return `auth()->user()` wrapped in `{ success, data }`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 5.2 Write property test for auth register → login → me round-trip (Property 10)
    - **Property 10: Auth register → login → me round-trip**
    - **Validates: Requirements 4.1, 4.3, 4.6**
    - Generate random valid user payload, POST register, POST login, GET me — assert same `id`, `email`, `role = 'student'` at each step
    - Use `->repeat(100)`

  - [ ]* 5.3 Write property test for auth error conditions (Property 11)
    - **Property 11: Auth error conditions**
    - **Validates: Requirements 4.2, 4.4**
    - Assert duplicate email registration returns HTTP 422; assert wrong-password login returns HTTP 401
    - Use `->repeat(100)`

  - [ ]* 5.4 Write property test for token revocation (Property 12)
    - **Property 12: Token revocation**
    - **Validates: Requirements 4.5**
    - Register, logout, then GET `/api/auth/me` with the same token — assert HTTP 401
    - Use `->repeat(100)`

- [x] 6. Create `AlumniApiController`
  - [x] 6.1 Implement `AlumniApiController` in `app/Http/Controllers/Api/AlumniApiController.php`
    - `achievements()`: query `alumni_achievements` with `user` and `bootcamp` eager-loaded, order `featured DESC, created_at DESC`, return `{ success, data, count }`
    - `stats()`: return `{ total_alumni, placements, companies }` using `COUNT` and `COUNT(DISTINCT company_name)` aggregates
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 6.2 Write property test for alumni achievements shape (Property 13)
    - **Property 13: Alumni achievements response shape**
    - **Validates: Requirements 5.1**
    - Insert random achievements, GET `/api/alumni/achievements`, assert every item has required fields including nested `user`
    - Use `->repeat(100)`

  - [ ]* 6.3 Write property test for alumni featured ordering (Property 14)
    - **Property 14: Alumni featured ordering**
    - **Validates: Requirements 5.3**
    - Insert mix of featured/non-featured achievements, assert all `featured=true` records precede any `featured=false` record in response
    - Use `->repeat(100)`

  - [ ]* 6.4 Write property test for alumni stats consistency (Property 15)
    - **Property 15: Alumni stats consistency**
    - **Validates: Requirements 5.2**
    - Insert known achievements, assert `placements` equals count of `type='placement'` rows and `companies` equals distinct non-null `company_name` count
    - Use `->repeat(100)`

- [x] 7. Create `OpsController`
  - [x] 7.1 Implement `OpsController` in `app/Http/Controllers/Api/OpsController.php`
    - `migrate()`: compare `request->query('token')` against `env('OPS_TOKEN')`; return HTTP 403 `{ error: 'Forbidden' }` on mismatch; on match call `Artisan::call('migrate', ['--force' => true])` and return output as JSON
    - _Requirements: 7.1_

  - [ ]* 7.2 Write property test for OPS endpoint token protection (Property 17)
    - **Property 17: OPS endpoint token protection**
    - **Validates: Requirements 7.1**
    - Assert missing token → HTTP 403; wrong token → HTTP 403; correct token → HTTP 200
    - Use `->repeat(100)`

- [x] 8. Register all routes in `routes/api.php`
  - Add route groups for `CoursesApiController` (`GET /courses`, `GET /courses/{id}`), `JobsApiController` (`GET /jobs`), `AuthApiController` (`POST /auth/register`, `POST /auth/login`, `POST /auth/logout` + `GET /auth/me` under `auth:sanctum` middleware), `AlumniApiController` (`GET /alumni/achievements`, `GET /alumni/stats`)
  - Register `OpsController@migrate` on `GET /__ops/migrate` outside the `/api` prefix (in `routes/web.php` or via a dedicated route file)
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 7.1_

  - [ ]* 8.1 Write property test for CORS preflight response (Property 18)
    - **Property 18: CORS preflight response**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - Send OPTIONS to `/api/courses`, assert HTTP 200 and presence of `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers` (including `Authorization`)

- [ ] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create `database/edvo_seed.sql`
  - [x] 10.1 Write `CREATE TABLE IF NOT EXISTS` statements for all required tables
    - Tables: `users`, `personal_access_tokens`, `instructors`, `course_categories`, `course_category_children`, `courses`, `course_sections`, `section_lessons`, `course_enrollments`, `course_reviews`, `course_requirements`, `course_outcomes`, `course_faqs`, `job_circulars`, `blogs`, `subscribes`, `contact_messages`, `settings`, `alumni_achievements`, `sessions`
    - _Requirements: 6.1_

  - [x] 10.2 Write `ALTER TABLE` statements for missing columns
    - `ALTER TABLE job_circulars ADD COLUMN IF NOT EXISTS company VARCHAR(190) NULL AFTER title`
    - `ALTER TABLE job_circulars ADD COLUMN IF NOT EXISTS applicants INT UNSIGNED NOT NULL DEFAULT 0 AFTER positions_available`
    - _Requirements: 2.3_

  - [x] 10.3 Write `INSERT IGNORE` seed data
    - 1 admin user (`admin@edvo.in`, bcrypt of `Admin@123`), 2 instructor users, 5 student users (bcrypt of `Student@123`)
    - 2 instructor rows linked to instructor users
    - 5 course categories: Programming, Physics, Web Development, Mathematics, Data Science
    - 5 courses matching frontend mock data titles/prices/levels/thumbnails
    - `course_requirements`, `course_outcomes`, `course_sections`, `section_lessons` rows per course
    - `course_reviews` (~3 per course to produce realistic avg rating), `course_enrollments` (1 per student)
    - 5 job circulars covering `full-time`, `part-time`, `remote`, `internship` types with `company` and `applicants` values
    - 3 alumni achievements with types `placement`, `promotion`, `achievement`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 10.4 Write property test for SQL seed idempotence (Property 16)
    - **Property 16: SQL seed idempotence**
    - **Validates: Requirements 6.3**
    - Run `edvo_seed.sql` twice against a test DB connection, assert no exception and row counts are identical after both runs
    - Runs once (two executions inside the test)

- [x] 11. Update frontend proxy routes (4 files only)
  - [x] 11.1 Update `src/app/api/courses/route.ts`
    - Replace mock-data handler with a proxy: read `BACKEND_URL`, forward GET with query string to `{BACKEND_URL}/api/courses`, pipe response status and body back unchanged
    - _Requirements: 7.4_

  - [x] 11.2 Update `src/app/api/jobs/route.ts`
    - Replace mock-data handler with a proxy: forward GET with query string to `{BACKEND_URL}/api/jobs`, pipe response back
    - _Requirements: 7.4_

  - [x] 11.3 Update `src/app/api/auth/login/route.ts`
    - Replace mock JWT handler with a proxy: forward POST body to `{BACKEND_URL}/api/auth/login`, pipe response back
    - _Requirements: 7.4_

  - [x] 11.4 Update `src/app/api/auth/register/route.ts`
    - Replace mock JWT handler with a proxy: forward POST body to `{BACKEND_URL}/api/auth/register`, pipe response back
    - _Requirements: 7.4_

  - [ ]* 11.5 Write property test for frontend proxy forwarding (Property 19)
    - **Property 19: Frontend proxy forwarding**
    - **Validates: Requirements 7.4**
    - Mock `BACKEND_URL`, assert each proxy route forwards the request and returns the backend's status and body unchanged

- [x] 12. Write `deploy/packages/backend-edvo-laravel/DEPLOYMENT.md`
  - Step-by-step instructions: copy `.env.example` to `.env`, fill in DB credentials + `OPS_TOKEN` + `SANCTUM_STATEFUL_DOMAINS` + `FRONTEND_URL`, upload `database/edvo_seed.sql` via phpMyAdmin, set `BACKEND_URL` in frontend `.env.local`, verify with `GET /api/courses`
  - _Requirements: 7.3_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use PestPHP `->repeat(100)` and are tagged with `// Feature: backend-api-integration, Property N: ...`
- The OPS migrate route should be registered outside the `api` middleware group prefix so it resolves at `/__ops/migrate`, not `/api/__ops/migrate`
- The frontend proxy files must NOT import `bcryptjs` or `jsonwebtoken` after the update — those dependencies are only needed by the backend
