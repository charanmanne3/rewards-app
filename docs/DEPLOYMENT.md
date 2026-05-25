# Cloud deployment guide

Deploy the Rewards Optimizer stack so the API and database run 24/7 without your laptop.

## Architecture

| Component | Recommended host | Notes |
|-----------|------------------|--------|
| PostgreSQL | [Supabase](SUPABASE.md) or Render Postgres | SSL required in production |
| FastAPI API | [Render](RENDER.md) (native Python 3.11.9) | Run migrations once via Render Shell |
| Mobile app | Expo EAS Build | `EXPO_PUBLIC_API_URL` points to cloud API |

## Prerequisites

- GitHub repository connected to Render
- Supabase project **or** Render managed PostgreSQL
- Expo account for production mobile builds (optional)

## Quick deploy checklist

### Backend

1. Create PostgreSQL (Supabase or Render) and copy `DATABASE_URL`.
2. Deploy API from `backend/` using **Python 3** on Render (see [RENDER.md](RENDER.md)).
3. Set environment variables (see `backend/.env.production.example`).
4. Migrations and seed run automatically on API startup (empty DB only).
5. Verify: `GET https://your-api.onrender.com/health` → `"status":"ok"`.

### Frontend

1. Set `EXPO_PUBLIC_API_URL=https://your-api.onrender.com` in EAS secrets or `eas.json`.
2. Build: `eas build --profile production --platform ios`.
3. Do **not** embed production `ADMIN_API_KEY` in public app store builds.

## Environment variables

### Backend (required in production)

| Variable | Description |
|----------|-------------|
| `APP_ENV` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | PostgreSQL connection string with SSL |
| `SECRET_KEY` | `openssl rand -hex 32` |
| `ADMIN_API_KEY` | `openssl rand -hex 32` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `ALLOWED_HOSTS` | e.g. `your-api.onrender.com` |
| `PYTHON_VERSION` | `3.11.9` (Render dashboard, optional but recommended) |

### Frontend

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | HTTPS URL of deployed API |
| `EXPO_PUBLIC_APP_ENV` | `production` for release builds |

## Health endpoints

| Path | Use |
|------|-----|
| `GET /health` | Full status (DB + providers) |
| `GET /health/live` | Liveness — process up |
| `GET /health/ready` | Readiness — returns 503 if DB down |

Configure Render health check path to `/health/ready`.

## Security

- Never commit `.env` files (see root `.gitignore`).
- Production config **rejects** default secrets and localhost `DATABASE_URL`.
- CORS uses an explicit allowlist in production (no wildcard `exp://` regex).
- OpenAPI docs (`/docs`) disabled when `DEBUG=false` and `APP_ENV=production`.

## Local vs cloud

| | Local | Cloud |
|---|--------|--------|
| API | `127.0.0.1:8000` | `https://*.onrender.com` |
| DB | Local Postgres or Supabase | Supabase / RDS / Render Postgres |
| Frontend `.env` | `EXPO_PUBLIC_API_URL=http://127.0.0.1:8000` | HTTPS cloud URL |

## Operations

- **Migrations**: applied automatically on each deploy startup (`alembic upgrade head`).
- **Logs**: JSON to stdout on Render (set `LOG_FORMAT=json`).
- **Cron**: schedule `python -m scripts.run_expiration_cleanup` daily (Render Cron or GitHub Actions).
- **Scaling**: increase `WEB_CONCURRENCY` on Render paid plans (use a process manager or multiple workers in start command if needed).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build shows Python 3.14 | Use Runtime **Python 3**, Root Directory `backend`, `runtime.txt` = `python-3.11.9`, clear build cache |
| Rust / maturin errors | Pin Python 3.11.9; dependencies use prebuilt wheels only |
| 503 on `/health/ready` | Check `DATABASE_URL` and SSL params |
