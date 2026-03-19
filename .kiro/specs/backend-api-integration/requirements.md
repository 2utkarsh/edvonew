# Requirements Document

## Introduction

This feature delivers a complete, production-ready Laravel backend for the Edvo edtech platform. The existing Next.js frontend (in `src/`) already has API route proxies pointing to a `BACKEND_URL`. The backend must expose all matching REST endpoints, ship with a single SQL file (schema + seed data), and be deployable with zero terminal access — the operator only needs to set `BACKEND_URL`, database credentials, upload the SQL file, and the site is live.

The backend codebase already exists at `deploy/packages/backend-edvo-laravel/` (Laravel 11 + Sanctum). This spec covers what must be built, verified, and wired together.

---

## Glossary

- **Backend**: The Laravel 11 PHP application located at `deploy/packages/backend-edvo-laravel/`
- **Frontend**: The Next.js application located at `src/` — must NOT be modified
- **API Proxy**: A Next.js API route (e.g. `src/app/api/backend/contact/route.ts`) that forwards requests to `BACKEND_URL`
- **BACKEND_URL**: The environment variable in `.env.local` that points the frontend to the Laravel backend (e.g. `https://edvo.in/backend`)
- **SQL_File**: A single `.sql` file containing all `CREATE TABLE` statements and `INSERT` seed data
- **Sanctum**: Laravel Sanctum — the token-based auth package used for API authentication
- **Seed_Data**: Realistic dummy records inserted into the database so the site looks populated on first deploy
- **OPS_Token**: A secret token protecting no-terminal deployment endpoints (`__ops/migrate`)
- **Instructor**: A user with `role = 'instructor'` who creates and manages courses
- **Student**: A user with `role = 'student'` who enrolls in courses
- **Admin**: A user with `role = 'admin'` who manages the platform

---

## Requirements

### Requirement 1: Public REST API — Courses

**User Story:** As a visitor, I want to browse and search courses, so that I can find a course to enroll in.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/courses`, THE Backend SHALL return a JSON response with `{ success: true, data: [...], count: N }` containing all published courses.
2. WHEN a GET request includes query parameters `category`, `level`, `search`, or `sort`, THE Backend SHALL filter and sort the courses accordingly before returning the response.
3. WHEN a GET request is made to `/api/courses/{id}`, THE Backend SHALL return the full course detail including sections, lessons, instructor info, reviews, requirements, and outcomes.
4. IF no courses match the given filters, THEN THE Backend SHALL return `{ success: true, data: [], count: 0 }` with HTTP 200.
5. THE Backend SHALL include `rating`, `reviewCount`, `studentsEnrolled`, `price`, `originalPrice`, `discount`, `duration`, `lectures`, `level`, and `category` fields in each course list item to match the shape expected by the frontend `Course` type.

---

### Requirement 2: Public REST API — Jobs

**User Story:** As a visitor, I want to browse job listings, so that I can find career opportunities.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/jobs`, THE Backend SHALL return `{ success: true, data: [...], count: N }` with all active job circulars.
2. WHEN query parameters `type`, `location`, `search`, or `experience` are provided, THE Backend SHALL filter the job list accordingly.
3. THE Backend SHALL include `id`, `title`, `company`, `location`, `type`, `salary`, `description`, `requirements`, `skills`, `experience`, `postedDate`, `applicationDeadline`, and `applicants` fields in each job record to match the frontend `Job` type.
4. THE Backend SHALL sort job results by `posted_date` descending by default.

---

### Requirement 3: Public REST API — Contact & Subscribe

**User Story:** As a visitor, I want to submit a contact form and subscribe to the newsletter, so that I can get in touch and receive updates.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/contact-messages` with valid `name`, `email`, and `message` fields, THE Backend SHALL persist the record and return HTTP 201 with `{ message: 'Message saved', data: {...} }`.
2. IF the POST request to `/api/contact-messages` is missing required fields, THEN THE Backend SHALL return HTTP 422 with validation error details.
3. WHEN a POST request is made to `/api/subscribes` with a valid unique `email`, THE Backend SHALL persist the subscription and return HTTP 201 with `{ message: 'Subscribed successfully', data: {...} }`.
4. IF the email in a POST to `/api/subscribes` already exists in the `subscribes` table, THEN THE Backend SHALL return HTTP 422 with a validation error.

---

### Requirement 4: Authentication API (Token-based)

**User Story:** As a user, I want to register and log in via the frontend, so that I can access my dashboard and enrolled courses.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/auth/register` with valid `name`, `email`, `password`, and `password_confirmation`, THE Backend SHALL create a new user with `role = 'student'`, issue a Sanctum token, and return `{ success: true, data: { user: {...}, token: '...' } }` with HTTP 201.
2. IF the email in a registration request already exists, THEN THE Backend SHALL return HTTP 422 with `{ success: false, errors: { email: ['...'] } }`.
3. WHEN a POST request is made to `/api/auth/login` with valid `email` and `password`, THE Backend SHALL verify credentials, issue a Sanctum token, and return `{ success: true, data: { user: {...}, token: '...' } }` with HTTP 200.
4. IF the credentials in a login request are invalid, THEN THE Backend SHALL return HTTP 401 with `{ success: false, error: 'Invalid credentials' }`.
5. WHEN a POST request is made to `/api/auth/logout` with a valid Bearer token, THE Backend SHALL revoke the token and return HTTP 200.
6. WHEN a GET request is made to `/api/auth/me` with a valid Bearer token, THE Backend SHALL return the authenticated user's profile.

---

### Requirement 5: Alumni Achievements API

**User Story:** As a visitor, I want to see alumni success stories and stats, so that I can be inspired to enroll.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/alumni/achievements`, THE Backend SHALL return a list of alumni achievement records including `type`, `company_name`, `position`, `description`, `testimonial`, `featured`, `achievement_date`, and nested `user` and `bootcamp` objects.
2. WHEN a GET request is made to `/api/alumni/stats`, THE Backend SHALL return `{ total_alumni, placements, companies }` aggregate counts.
3. WHERE the `featured` flag is true, THE Backend SHALL include those records first in the response ordering.

---

### Requirement 6: SQL Schema + Seed File

**User Story:** As a deployer, I want a single SQL file I can upload to phpMyAdmin, so that the database is ready without running terminal commands.

#### Acceptance Criteria

1. THE SQL_File SHALL contain `CREATE TABLE IF NOT EXISTS` statements for all tables: `users`, `personal_access_tokens`, `instructors`, `course_categories`, `course_category_children`, `courses`, `course_sections`, `section_lessons`, `course_enrollments`, `course_reviews`, `course_requirements`, `course_outcomes`, `course_faqs`, `job_circulars`, `blogs`, `subscribes`, `contact_messages`, `settings`, `alumni_achievements`, and `sessions`.
2. THE SQL_File SHALL contain `INSERT` statements with at least 5 courses, 5 job circulars, 3 alumni achievements, 2 instructors, 1 admin user, and 5 student users as Seed_Data.
3. THE SQL_File SHALL be idempotent — running it twice SHALL NOT produce duplicate key errors (use `INSERT IGNORE` or `ON DUPLICATE KEY UPDATE` for seed rows).
4. THE SQL_File SHALL be uploadable to a standard MySQL 5.7+ or MariaDB 10.3+ database without modification.
5. THE Seed_Data admin user SHALL have email `admin@edvo.in` and a bcrypt-hashed password for `Admin@123`.

---

### Requirement 7: Zero-Terminal Deployment

**User Story:** As a non-technical deployer, I want to deploy the backend by only setting environment variables and uploading the SQL file, so that I don't need SSH or terminal access.

#### Acceptance Criteria

1. THE Backend SHALL expose a `GET /__ops/migrate?token={OPS_TOKEN}` endpoint that runs `php artisan migrate --force` and returns JSON output, protected by the `OPS_Token`.
2. THE Backend `.env.example` SHALL document all required variables: `APP_URL`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `SANCTUM_STATEFUL_DOMAINS`, and `OPS_TOKEN`.
3. THE Backend SHALL include a `DEPLOYMENT.md` file with step-by-step instructions: set `.env`, upload SQL, set `BACKEND_URL` in frontend `.env.local`, and verify with a test request.
4. WHEN `BACKEND_URL` is set in the frontend `.env.local`, THE Frontend proxy routes (`/api/backend/contact`, `/api/backend/subscribe`) SHALL forward requests to the Backend without any frontend code changes.
5. THE Backend `public/` directory SHALL be the web root, and THE Backend SHALL include an `.htaccess` file for Apache shared hosting compatibility.

---

### Requirement 8: CORS Configuration

**User Story:** As a developer, I want the backend to accept requests from the frontend domain, so that API calls are not blocked by the browser.

#### Acceptance Criteria

1. THE Backend SHALL include CORS middleware that allows requests from the frontend origin specified in `SANCTUM_STATEFUL_DOMAINS`.
2. WHEN a preflight OPTIONS request is received, THE Backend SHALL respond with HTTP 200 and the appropriate `Access-Control-Allow-*` headers.
3. THE Backend SHALL allow `Authorization`, `Content-Type`, and `Accept` headers in cross-origin requests.

---

### Requirement 9: Seed Data Quality

**User Story:** As a demo user, I want the platform to look fully populated on first load, so that I can evaluate the product without entering data manually.

#### Acceptance Criteria

1. THE Seed_Data SHALL include course categories: `Programming`, `Physics`, `Web Development`, `Mathematics`, and `Data Science`.
2. THE Seed_Data courses SHALL include realistic `title`, `short_description`, `price`, `discount_price`, `level`, `thumbnail` path, `rating` (via reviews), and `studentsEnrolled` (via enrollments) values matching the data shapes used in the frontend mock data.
3. THE Seed_Data job circulars SHALL include at least one of each `job_type`: `full-time`, `part-time`, `remote`, and `internship`.
4. THE Seed_Data SHALL include at least 3 alumni achievement records with `type` values of `placement`, `promotion`, and `achievement`.
5. THE Seed_Data student users SHALL have bcrypt-hashed passwords for `Student@123` and SHALL be enrolled in at least one course each.
