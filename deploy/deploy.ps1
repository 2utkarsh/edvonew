Param(
  [string]$FrontendDir = "E:\EDVO",
  [string]$BackendDir = "E:\EDVO\backend\edvo-laravel"
)

$ErrorActionPreference = "Stop"

Write-Host "== Frontend: install/build ==" -ForegroundColor Cyan
Set-Location $FrontendDir

if (!(Test-Path ".env.local") -and (Test-Path ".env.example")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Created .env.local from .env.example (edit BACKEND_URL)." -ForegroundColor Yellow
}

npm install
npm run build

Write-Host "== Backend: install/migrate ==" -ForegroundColor Cyan
Set-Location $BackendDir

if (!(Test-Path ".env") -and (Test-Path ".env.example")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created backend .env from .env.example (edit DB_*, APP_URL)." -ForegroundColor Yellow
}

composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --force
try { php artisan storage:link } catch {}
php artisan optimize:clear

Write-Host "Done." -ForegroundColor Green

