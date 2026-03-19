# Edvo — Backend Deployment Guide (cPanel)

Deploy the Laravel backend on cPanel shared hosting.

> For full-stack deployment (frontend + backend on same server), see `deploy/FULL_STACK_DEPLOYMENT.md`.

---

## Prerequisites

Your cPanel host must have:
- **PHP 8.2+** with extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`
- **MySQL 5.7+** or **MariaDB 10.3+**
- **phpMyAdmin**
- **Apache** with `mod_rewrite` enabled

---

## Step 1 — Create a Subdomain

cPanel → **Subdomains**:
- Subdomain: `api`
- Domain: `yourdomain.com`
- Document Root: `public_html/api/public`

---

## Step 2 — Upload Backend Files

1. Zip the contents of this folder (`backend-edvo-laravel/`)
2. cPanel → **File Manager** → go to `public_html/`
3. Upload the zip → Extract → rename folder to `api`

```
public_html/
└── api/
    ├── app/
    ├── public/     ← subdomain document root points here
    ├── .env.example
    └── ...
```

---

## Step 3 — Create the Database

cPanel → **MySQL Databases**:
1. Create database: e.g. `cpuser_edvo`
2. Create user: e.g. `cpuser_edvouser` with a strong password
3. Add user to database → **All Privileges**

---

## Step 4 — Import the Database

cPanel → **phpMyAdmin** → select your database → **Import** tab:
- Choose file: `public_html/api/database/edvo_seed.sql`
- Click **Go**

Default credentials after import:

| Role    | Email                 | Password   |
|---------|-----------------------|------------|
| Admin   | admin@edvo.in         | `password` |
| Student | arjun@student.edvo.in | `password` |

> Change these immediately after first login.

---

## Step 5 — Configure Environment

In File Manager, copy `.env.example` → `.env` inside `public_html/api/`, then edit:

```dotenv
APP_NAME=Edvo
APP_ENV=production
APP_KEY=                         # generated in Step 6
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

> cPanel prefixes database names and usernames with your cPanel account name (e.g. `cpuser_edvo`). Check cPanel → MySQL Databases for the exact names.

---

## Step 6 — Generate App Key & Set Permissions

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

Or manually: run `php -r "echo base64_encode(random_bytes(32));"` and set `APP_KEY=base64:RESULT` in `.env`.

---

## Step 7 — Set Folder Permissions

Via File Manager, set permission `755` on:
- `public_html/api/storage/`
- `public_html/api/bootstrap/cache/`

Right-click → **Change Permissions**

---

## Step 8 — Verify

| URL | Expected |
|-----|----------|
| `https://api.yourdomain.com/api/courses` | JSON with 5 courses |
| `https://api.yourdomain.com/api/jobs` | JSON with 5 jobs |
| `https://api.yourdomain.com/api/alumni/achievements` | JSON with 3 achievements |

---

## Troubleshooting

**500 Internal Server Error**
- Check `storage/logs/laravel.log` in File Manager
- Ensure `storage/` and `bootstrap/cache/` are writable
- Verify `APP_KEY` is set in `.env`

**404 on API routes**
- Subdomain document root must point to `public_html/api/public/` — not `public_html/api/`
- Confirm `.htaccess` exists in `public/`
- Ask host to confirm `mod_rewrite` is enabled

**CORS errors**
- `SANCTUM_STATEFUL_DOMAINS` must match your frontend domain exactly (no `https://`, no trailing slash)

**Database errors**
- cPanel prefixes DB names/users with your cPanel username — verify in MySQL Databases
- `DB_HOST` is almost always `127.0.0.1` on shared hosting
