# Render deployment

Host the FastAPI backend on [Render](https://render.com) with Docker, managed Postgres, and automatic HTTPS.

## 1. Create PostgreSQL (optional)

1. Render Dashboard → **New** → **PostgreSQL**.
2. Name: `rewards-db`, region near your users.
3. Copy **Internal Database URL** (for Render services) or **External** (for local migrations).

For Supabase instead, see [SUPABASE.md](SUPABASE.md) and skip Render Postgres.

## 2. Deploy the web service

### Option A — Blueprint

1. Push repo to GitHub.
2. Render → **New** → **Blueprint**.
3. Point to `backend/render.yaml` (adjust `ALLOWED_HOSTS` and `CORS_ORIGINS` after deploy).

### Option B — Native Python (recommended — uses repo-root `runtime.txt`)

1. **New** → **Web Service** → connect repository.
2. **Root directory**: `backend`
3. **Runtime**: Python 3 (not Docker)
4. **Build command**: `pip install -r requirements.txt`
5. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Health check path**: `/health/ready`
7. Confirm **`runtime.txt`** exists at **repository root** (not in `backend/`) with `python-3.11.9`
8. In Environment, set `PYTHON_VERSION` = `3.11.9` if the dashboard offers it

### Option C — Docker (alternative)

1. **Root directory**: `backend`
2. **Runtime**: Docker — `Dockerfile` uses `python:3.11.9-slim-bookworm` (`runtime.txt` is ignored)
3. **Health check path**: `/health/ready`

## 3. Environment variables

Set in Render → Environment:

```env
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO
LOG_FORMAT=json
DATABASE_URL=<from Supabase or Render Postgres>
SECRET_KEY=<openssl rand -hex 32>
ADMIN_API_KEY=<openssl rand -hex 32>
CORS_ORIGINS=https://your-domain.com
ALLOWED_HOSTS=your-service-name.onrender.com
```

Render injects `PORT` automatically — do not hardcode.

Optional:

```env
WEB_CONCURRENCY=1
EXPIRATION_JOB_ENABLED=true
OFFER_REFRESH_JOB_ENABLED=true
```

## 4. First deploy

The Docker `CMD` runs:

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

After deploy succeeds:

1. Open `https://<your-service>.onrender.com/health`
2. Render **Shell**:

```bash
python -m scripts.seed
```

## 5. Connect the mobile app

In `frontend/.env` or EAS secrets:

```env
EXPO_PUBLIC_API_URL=https://<your-service>.onrender.com
EXPO_PUBLIC_APP_ENV=production
```

Rebuild the Expo app — it will call the cloud API when your laptop is off.

## 6. CORS for Expo

Expo Go / dev clients use `exp://` origins. For **development** against Render:

```env
CORS_ORIGINS=https://your-service.onrender.com,exp://192.168.1.10:8081
```

Production App Store builds typically use the HTTPS API only; strict CORS list is enough.

## 7. Cron job (expiration cleanup)

Render **Cron Job**:

- Schedule: `0 3 * * *` (daily 3 AM UTC)
- Command: `cd backend && python -m scripts.run_expiration_cleanup`
- Same `DATABASE_URL` as web service

## 8. Free tier notes

- Free web services **spin down** after inactivity (~50s cold start).
- Upgrade to **Starter** for always-on production.
- Free Postgres expires after 90 days — use Supabase for long-lived free tier.

## Verify

```bash
curl https://YOUR_SERVICE.onrender.com/health
curl -X POST https://YOUR_SERVICE.onrender.com/recommendations \
  -H "Content-Type: application/json" \
  -d '{"store":"Walmart","owned_cards":[],"categories":[]}'
```
