# OpenShop — Laravel + React E-Commerce

OpenShop is a multi-role e-commerce application built with a Laravel 11 API and a React/Vite single-page frontend.

## Stack

- **Backend:** PHP 8.2+, Laravel 11, Sanctum, Spatie Laravel Permission
- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Database:** MySQL 8 (SQLite can be used for local Laravel development)
- **Payments:** Razorpay (configure test/live credentials in the backend environment)
- **Deployment:** Vercel for the static frontend; Render or another PHP-capable host for the Laravel API

## Repository layout

```text
backend/       Laravel API, migrations, seeders and tests
frontend/      React/Vite application
docker/        Reverse-proxy and container configuration
.github/       CI workflows
Dockerfile     Root frontend image build
docker-compose.yml
docker-compose.prod.yml
vercel.json    Root-project Vercel configuration
```

## Local development

### Requirements

- PHP 8.2+
- Composer 2
- Node.js 20 LTS and npm
- MySQL 8, or SQLite for local development

### Backend

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Configure database credentials, application URL, CORS origins, and Razorpay keys in `backend/.env`. Do not commit real credentials.

For MySQL, set `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`. The example environment defaults to SQLite for a quick local setup.

### Frontend

In a second terminal:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:8000/api` in `frontend/.env.local`. Vite serves the frontend at the URL printed by the dev server (normally `http://localhost:5173`).

### Checks

```powershell
cd frontend
npm run lint
npm run build
```

```powershell
cd backend
php artisan route:list
php artisan test
```

## Deployment

### Vercel — React frontend

Recommended configuration when importing the repository:

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`
- **Environment Variable:** `VITE_API_BASE_URL=https://YOUR-API-HOST/api`

The `frontend/vercel.json` rewrite supports React Router deep links. If deploying with the repository root as the Vercel project root instead, the root `vercel.json` runs the frontend install/build commands and publishes `frontend/dist`.

### Render — Laravel API

Create a **Docker** web service on Render connected to this repository with these settings:\n\n- **Root Directory:** `backend`\n- **Environment:** Docker\n- **Dockerfile Path:** `./Dockerfile` (relative to the backend root)\n- **Health Check Path:** `/up`\n\nThe backend image runs Nginx + PHP-FPM under Supervisor and serves Laravel from `backend/public`. The image includes the Nginx and Supervisor configuration files under `backend/docker/`. Ensure `storage` and `bootstrap/cache` remain writable. Provision a managed MySQL database and attach its private connection details to the service.

Configure at minimum:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY` (generate securely with `php artisan key:generate --show` in a trusted environment)
- `APP_URL=https://YOUR-API-HOST`
- `DB_CONNECTION` and production database credentials
- `CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND-DOMAIN`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (only if payments are enabled)

Run migrations as a controlled release/deploy step: `php artisan migrate --force` (run from the backend application directory). Configure persistent storage or object storage for user-uploaded files; the container filesystem is ephemeral. Use managed database/Redis services where required. Never use the demo seed accounts or development credentials in production.

> **Deployment status:** These instructions describe the intended split deployment. A successful production deployment still requires valid hosting accounts, environment variables, database provisioning, storage configuration, and a live smoke test.

## Security and production notes

- Keep `.env`, API secrets, payment secrets, and database credentials out of Git.
- Use HTTPS for both frontend and API.
- Restrict CORS to the exact frontend origin.
- Configure a durable disk/object-storage service for product images; container filesystems may be ephemeral.
- Review role/ownership checks, payment verification, address/checkout flow, and rate limits before accepting real orders.
- Do not expose seeded demo credentials in production.

## Contributing

1. Fork the repository.
2. Create a focused branch: `git checkout -b fix/short-description`.
3. Install backend and frontend dependencies.
4. Run the checks relevant to your change.
5. Open a pull request with the problem, implementation, and verification details.

Please do not include secrets, customer data, or production database dumps in issues or pull requests.

## License

See [LICENSE](LICENSE).
