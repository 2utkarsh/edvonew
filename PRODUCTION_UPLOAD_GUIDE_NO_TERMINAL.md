## Production upload (NO terminal / SSH)

You can go live by uploading **two folders** and importing DB using phpMyAdmin.

### A) Backend (Laravel) at `https://edvo.in/backend`

1. Upload this folder to your server (any location):
   - `backend/edvo-laravel/`

2. In hosting panel, set the URL `/backend` document root to:
   - `backend/edvo-laravel/public`

3. Edit backend `.env` in File Manager:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://edvo.in/backend`
   - Set `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
   - Set `OPS_TOKEN` to a strong random string

4. Create database in hosting + user, assign privileges (phpMyAdmin/cPanel).

5. **No terminal migration option (browser)**:
   - Run migrations: `https://edvo.in/backend/__ops/migrate?token=YOUR_OPS_TOKEN`

### B) Frontend (Next.js) at `https://edvo.in/`

Because you cannot run build on server, upload the **standalone production build output**.

Upload these three things to your Node app folder on server:

1. `E:\EDVO\.next\standalone\`  (contains `server.js` + `node_modules` needed)
2. `E:\EDVO\.next\static\`      → copy into: `<node-app>/.next/static/`
3. `E:\EDVO\public\`           → copy into: `<node-app>/public/`

Then set environment variable in your Node app panel:

- `BACKEND_URL=https://edvo.in/backend`

Startup file / command:

- **Startup file**: `server.js`
- **Port**: whatever panel provides (usually it sets `PORT` automatically)

### Health check

- Open `https://edvo.in/`
- Test subscribe form (it calls backend through `/api/backend/subscribe`)

