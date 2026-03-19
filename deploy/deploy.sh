#!/usr/bin/env bash
# =============================================================================
# Edvo Full-Stack Deploy Script
# Builds the frontend as a static export and prepares the backend for upload.
# Usage: bash deploy/deploy.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR"
BACKEND_DIR="$ROOT_DIR/deploy/packages/backend-edvo-laravel"
FRONTEND_STATIC_DIR="$ROOT_DIR/deploy/packages/frontend-static"

echo ""
echo "=== Edvo Full-Stack Deploy ==="
echo ""

# ── Frontend ──────────────────────────────────────────────────────────────────
echo "[1/3] Installing frontend dependencies..."
cd "$FRONTEND_DIR"

if [ ! -f ".env.local" ]; then
  echo "      Creating .env.local — edit NEXT_PUBLIC_API_URL before deploying."
  cat > .env.local <<'EOF'
# Public URL of the Laravel backend — accessible from the browser (no trailing slash)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
EOF
fi

npm install

echo "[2/3] Building frontend (Next.js static export)..."
npm run build

# Copy static output into deploy package
if [ -d "out" ]; then
  rm -rf "$FRONTEND_STATIC_DIR"
  mkdir -p "$FRONTEND_STATIC_DIR"
  cp -r out/. "$FRONTEND_STATIC_DIR/"
  echo "      Static files copied to deploy/packages/frontend-static/"
else
  echo "      ERROR: 'out/' folder not found. Check next.config.js has output: 'export'"
  exit 1
fi

# ── Backend ───────────────────────────────────────────────────────────────────
echo "[3/3] Backend — installing Composer dependencies..."
cd "$BACKEND_DIR"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "      Created backend .env from .env.example."
  echo "      !! Edit DB_*, APP_URL, SANCTUM_STATEFUL_DOMAINS, OPS_TOKEN before deploying !!"
fi

composer install --no-dev --optimize-autoloader
php artisan key:generate --force

echo ""
echo "=== Build complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit .env.local — set NEXT_PUBLIC_API_URL=https://api.yourdomain.com"
echo "  2. Re-run this script after editing .env.local"
echo "  3. Upload deploy/packages/frontend-static/ contents to cPanel -> public_html/"
echo "  4. Edit deploy/packages/backend-edvo-laravel/.env  (DB_*, APP_URL, OPS_TOKEN)"
echo "  5. Upload backend-edvo-laravel/ to cPanel -> public_html/api/"
echo "  6. Import database/edvo_seed.sql via phpMyAdmin"
echo "  7. See deploy/FULL_STACK_DEPLOYMENT.md for full instructions"
echo ""
