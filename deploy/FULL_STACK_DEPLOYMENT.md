# Edvo — Full Stack Deployment Guide (cPanel + Node.js/Passenger)

Both frontend and backend run on the **same cPanel server**.

---

## Architecture

```
Browser
  ├── https://yourdomain.com        → Next.js (Node.js via Passenger, cPanel)
  └── https://api.yourdomain.com    → Laravel (PHP, cPanel subdomain)
```

---

## Requirements

Your cPanel host must have:
- **Node.js Selector** (CloudLinux + Passenger) — check cPanel for "Setup Node.js App"
- **PHP 8.2+** with `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`
- **MySQL 5.7+** / **MariaDB 10.3+**
- **phpMyAdmin**

---

## Part 1 — Deploy the Backend (Laravel)

### 1.1 — Create a subdomain for the API

cPanel → **Subdomains**:
- Subdomain: `api`
- Domain: `yourdomain.com`
- Document Root: `public_html/api/public`

### 1.2 — Upload backend files

1. Zip the contents of `deploy/packages/backend-edvo-laravel/`
2. cPanel → **File Manager** → go to `public_html/`
3. Upload the zip → Extract → rename the folder to `api`

Structure should be:
```
public_html/
└── api/
    ├── app/
    ├── public/     ← subdomain document root points here
    ├── .env.example
    └── ...
```

### 1.3 — Create the database

cPanel → **MySQL Databases**:
1. Create database: e.g. `cpuser_edvo`
2. Create user: e.g. `cpuser_edvouser` with a strong password
3. Add user to database → **All Privileges**

### 1.4 — Import the database

cPanel → **phpMyAdmin** → select your database → **Import**:
- Choose file: `public_html/api/database/edvo_seed.sql`
- Click **Go**

Default credentials after import:

| Role    | Email                 | Password   |
|---------|-----------------------|------------|
| Admin   | admin@edvo.in         | `password` |
| Student | arjun@student.edvo.in | `password` |

> Change these after first login.

### 1.5 — Configure backend environment

In File Manager, copy `.env.example` → `.env` inside `public_html/api/`, then edit:

```dotenv
APP_NAME=Edvo
APP_ENV=production
APP_KEY=                         # generated in next step
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cpuser_edvo
DB_USERNAME=cpuser_edvouser
DB_PASSWORD=your_db_password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

OPS_TOKEN=replace_with_a_long_random_string

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

### 1.6 — Generate app key & set permissions

**Via cPanel Terminal** (Software → Terminal):
```bash
cd ~/public_html/api
php artisan key:generate
php artisan storage:link
chmod -R 755 storage bootstrap/cache
```

**No terminal?** Use the browser endpoint after the subdomain is live:
```
https://api.yourdomain.com/__ops/migrate?token=YOUR_OPS_TOKEN
```

Or set the key manually: run `php -r "echo base64_encode(random_bytes(32));"` and put the result in `.env` as `APP_KEY=base64:RESULT`.

### 1.7 — Verify backend

Each URL should return JSON:

| URL | Expected |
|-----|----------|
| `https://api.yourdomain.com/api/courses` | 5 courses |
| `https://api.yourdomain.com/api/jobs` | 5 jobs |
| `https://api.yourdomain.com/api/alumni/achievements` | 3 achievements |

---

## Part 2 — Deploy the Frontend (Next.js Static Export)

### 2.1 — Build the frontend locally

On your local machine:

**Windows:**
```powershell
.\deploy\deploy.ps1
```

**Mac/Linux:**
```bash
bash deploy/deploy.sh
```

This produces a static HTML/CSS/JS site in `deploy/packages/frontend-static/out/`.

### 2.2 — Upload frontend files

1. Open `deploy/packages/frontend-static/out/`
2. cPanel → **File Manager** → go to `public_html/`
3. Upload all contents of `out/` directly into `public_html/`

Structure:
```
public_html/
├── index.html
├── _next/
├── courses/
├── jobs/
└── ...
└── api/          ← backend lives here
    └── public/
```

### 2.3 — No Node.js app needed

Static files are served directly by Apache — no Node.js, no Passenger, no setup required.

### 2.4 — Verify frontend

| URL | Expected |
|-----|----------|
| `https://yourdomain.com` | Edvo homepage |
| `https://yourdomain.com/courses` | Courses page (fetches from API in browser) |
| `https://yourdomain.com/job-circulars` | Jobs page |

---

## Updating the Site

**Backend update:**
1. Upload new files to `public_html/api/` via File Manager
2. Via Terminal: `cd ~/public_html/api && php artisan optimize:clear`
3. Run migrations if needed: `php artisan migrate --force`

**Frontend update:**
1. Run `deploy.ps1` or `deploy.sh` locally to rebuild
2. Upload new `deploy/packages/frontend-node-app/` contents to `public_html/frontend/`
3. cPanel → **Setup Node.js App** → click **Restart**

---

## Troubleshooting

**Backend 500 error**
- Check `public_html/api/storage/logs/laravel.log` in File Manager
- Ensure `storage/` and `bootstrap/cache/` are writable (`chmod 755`)
- Verify `APP_KEY` is set in `.env`

**Backend 404 on API routes**
- Subdomain document root must point to `public_html/api/public/` — not `public_html/api/`
- Confirm `.htaccess` exists in `public/`
- Ask host to confirm `mod_rewrite` / `AllowOverride All` is enabled

**Frontend not loading / 503**
- cPanel → Setup Node.js App → check app status, click Restart
- Check that `server.js` exists in `public_html/frontend/`
- Verify `BACKEND_URL` environment variable is set in the Node.js app settings

**CORS errors in browser**
- `SANCTUM_STATEFUL_DOMAINS` in backend `.env` must match your frontend domain exactly
- No `https://`, no trailing slash — just: `yourdomain.com`

**Database errors**
- cPanel prefixes DB names/users with your cPanel username — verify in MySQL Databases
- `DB_HOST` is almost always `127.0.0.1` on shared hosting

**Passenger / Node.js app not available**
- Contact your host and confirm CloudLinux + Passenger (Node.js Selector) is enabled on your plan
- Not all cPanel plans include this — it's typically Business/Cloud tier and above
