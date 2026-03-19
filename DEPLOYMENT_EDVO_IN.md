# Deploy EDVO (Next.js) + Backend (Laravel) to `edvo.in`

This workspace contains:

- **Frontend (Next.js)**: `E:\EDVO\` (this folder)
- **Backend (Laravel)**: `E:\EDVO\backend\edvo-laravel`

## 1) Server prerequisites

- **Node.js 18+** (for Next.js)
- **PHP 8.2+** (for Laravel)
- **Composer** (for Laravel dependencies, unless you deploy with `vendor/`)
- **MySQL/MariaDB**
- **Apache or Nginx**

## 2) Backend (Laravel) deployment

### 2.1 Put backend on server

Upload/copy:

- `backend/edvo-laravel/` → for example to: `/var/www/edvo-backend/` (Linux) or `C:\xampp\htdocs\edvo-backend\` (Windows)

### 2.2 Configure `.env`

In the backend folder, create/update `.env` (copy from `.env.example`) and set at minimum:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://edvo.in/backend` (or your chosen URL)
- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=YOUR_DB`
- `DB_USERNAME=YOUR_USER`
- `DB_PASSWORD=YOUR_PASS`

Then generate app key (only once):

```bash
php artisan key:generate
```

### 2.3 Apache/Nginx document root

Point the backend virtual host (or an alias under `/backend`) to:

- `.../edvo-laravel/public`

That is the only folder that should be web-accessible.

### 2.4 Run migrations (creates all tables)

From the backend folder:

```bash
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
```

After this, MySQL is connected and the backend tables are created.

### 2.5 If your hosting has NO terminal/SSH

This backend includes protected “ops” URLs you can run from the browser after you set `OPS_TOKEN` in backend `.env`:

- Download SQL (pending migrations) as a file: `https://edvo.in/backend/__ops/schema.sql?token=YOUR_OPS_TOKEN`
- Run migrations directly: `https://edvo.in/backend/__ops/migrate?token=YOUR_OPS_TOKEN`

## 3) Frontend (Next.js) deployment

### 3.1 Set frontend env to talk to backend

Create a file `.env.local` in the frontend root and set:

```bash
BACKEND_URL=https://edvo.in/backend
```

Notes:
- This value must match where Laravel is publicly reachable.
- The frontend uses proxy routes like `/api/backend/subscribe` which forward to `${BACKEND_URL}/api/subscribes`.

### 3.2 Build + start

From the frontend folder:

```bash
npm install
npm run build
npm start
```

For production stability, run Next using a process manager (recommended):

- **pm2** (Linux/Windows)
- **systemd** (Linux)

Example pm2:

```bash
npm i -g pm2
pm2 start npm --name edvo-frontend -- start
pm2 save
```

### 3.3 Expose Next.js on the domain (reverse proxy)

If Apache/Nginx is handling `https://edvo.in`, configure it to reverse proxy to the Next.js port (usually `3000`).

Common setup:
- `https://edvo.in/` → Next.js (Node on `127.0.0.1:3000`)
- `https://edvo.in/backend/` → Laravel (Apache/Nginx pointing to `backend/public`)

## 4) Local dev commands

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
composer install
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

Then set frontend `.env.local`:

```bash
BACKEND_URL=http://127.0.0.1:8000
```

