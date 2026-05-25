# Render deployment (native Python only)

Host the FastAPI backend on [Render](https://render.com) with **Python 3** (not Docker), managed Postgres, and automatic HTTPS.

## Required Render settings

| Setting | Value |
|---------|--------|
| **Runtime** | Python 3 |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port 10000` |
| **Health check path** | `/health/ready` |

`backend/runtime.txt` must contain `python-3.11.9`. In Environment, set `PYTHON_VERSION` = `3.11.9` if the dashboard offers it.

After changing runtime or Python version: **Clear build cache** → **Manual Deploy**.

## 1. Create PostgreSQL (optional)

1. Render Dashboard → **New** → **PostgreSQL**.
2. Name: `rewards-db`, region near your users.
3. Copy **Internal Database URL** (for Render services) or **External** (for local migrations).

For Supabase instead, see [SUPABASE.md](SUPABASE.md) and skip Render Postgres.

## 2. Deploy the web service

1. **New** → **Web Service** → connect GitHub repo.
2. **Root directory**: `backend`
3. **Runtime**: **Python 3** (do not use Docker)
4. **Build command**: `pip install -r requirements.txt`
5. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
6. **Health check path**: `/health/ready`

Confirm build logs show **Python 3.11.9**, not 3.14.

## 3. Environment variables

Set in Render → Environment:

```env
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO
LOG_FORMAT=json
PYTHON_VERSION=3.11.9
DATABASE_URL=<from Supabase or Render Postgres>
SECRET_KEY=<openssl rand -hex 32>
ADMIN_API_KEY=<openssl rand -hex 32>
CORS_ORIGINS=https://your-domain.com
ALLOWED_HOSTS=your-service-name.onrender.com
```

Render injects `PORT` (usually `10000`). The start command above binds to port `10000`.

Optional:

```env
WEB_CONCURRENCY=1
EXPIRATION_JOB_ENABLED=true
OFFER_REFRESH_JOB_ENABLED=true
```

## 4. First deploy

Run migrations and seed once in Render **Shell**:

```bash
alembic upgrade head
python -m scripts.seed
```

After deploy succeeds:

1. Open `https://<your-service>.onrender.com/health`
2. Verify recommendations: see [Verify](#verify) below.

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
- Root directory: `backend`
- Command: `python -m scripts.run_expiration_cleanup`
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

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build uses Python 3.14 | Runtime must be **Python 3**, not Docker. Set `backend/runtime.txt` to `python-3.11.9`, `PYTHON_VERSION=3.11.9`, clear build cache, redeploy. |
| `maturin` / `cargo` / Rust errors | Wrong Python version — wheels exist for 3.11.9 only. |
| Service still Docker | Dashboard → Settings → change Runtime to Python 3, remove Dockerfile path. |
