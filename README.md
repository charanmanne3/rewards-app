# Rewards Optimizer (v2)

Production-ready **database-driven** fintech rewards platform: pick a store, get the best credit card for cashback today—without redeploying code when rates change.

| Layer | Stack |
|-------|--------|
| Mobile | React Native, Expo, TypeScript |
| API | FastAPI, SQLAlchemy, Alembic |
| DB | PostgreSQL (Docker / AWS RDS) |
| Hosting | Render (API) + optional Lambda (jobs) |

## What’s new in v2

- **Reward types:** `STATIC`, `ROTATING`, `PROMOTIONAL`
- **Date windows:** `start_date` / `end_date` with automatic expiration
- **Admin REST API** — add/update/deactivate rewards, pagination
- **Admin mobile screen** — edit cashback % and end dates
- **Scheduled cleanup job** + standalone script for AWS Lambda
- **Recommendation cache** (in-memory TTL; Redis-ready)

Full architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Quick start (local)

### 1. Database + API

```bash
cd backend
cp .env.example .env
docker compose up -d db
docker compose run --rm api pip install -r requirements.txt
docker compose run --rm api alembic upgrade head
docker compose run --rm api python -m scripts.seed
docker compose up api
```

API: http://localhost:8000/docs

### 2. Mobile app

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Set `EXPO_PUBLIC_API_URL` (use LAN IP on a physical device).  
Set `EXPO_PUBLIC_ADMIN_API_KEY` to match `ADMIN_API_KEY` in backend `.env`.

---

## API reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stores` | List stores |
| GET | `/cards` | List cards |
| GET | `/best-card/{store_name}` | Best + ranked cards (eligible today only) |
| POST | `/users/register` | Register |
| POST | `/users/login` | JWT login |

### Admin (header `X-Admin-API-Key`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/rewards?page=1&page_size=20` | Paginated rewards |
| POST | `/admin/rewards` | Create reward |
| PATCH | `/admin/rewards/{id}` | Update %, dates, type, active |
| POST | `/admin/rewards/{id}/deactivate` | Deactivate |
| POST | `/admin/rewards/jobs/expire` | Run expiration cleanup |

Example — add rotating Discover IT Walmart Q2:

```bash
curl -X POST http://localhost:8000/admin/rewards \
  -H "Content-Type: application/json" \
  -H "X-Admin-API-Key: dev-admin-change-me" \
  -d '{
    "store_id": 1,
    "card_id": 2,
    "cashback_percent": 5,
    "reward_type": "ROTATING",
    "start_date": "2026-04-01",
    "end_date": "2026-06-30"
  }'
```

---

## Cloud deployment (24/7 — laptop off)

| Guide | Purpose |
|-------|---------|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Full checklist |
| [docs/RENDER.md](docs/RENDER.md) | Host API on Render (Docker) |
| [docs/SUPABASE.md](docs/SUPABASE.md) | Managed PostgreSQL |

**Backend** (`backend/`): Docker + `scripts/start.sh` runs migrations then uvicorn.  
**Health**: `GET /health`, `/health/live`, `/health/ready`  
**Frontend**: set `EXPO_PUBLIC_API_URL=https://your-api.onrender.com` in EAS / `.env`

```bash
# Example production verify
curl https://your-api.onrender.com/health
```

Templates: `backend/.env.production.example`, `frontend/eas.json`

### AWS RDS / Lambda

See [database/README.md](database/README.md) and [backend/scripts/lambda_expiration_handler.py](backend/scripts/lambda_expiration_handler.py).

---

## Project structure

```
Rewards app/
├── backend/           # FastAPI
├── frontend/          # Expo
├── database/          # RDS notes
├── docs/ARCHITECTURE.md
└── README.md
```

---

## Rotating reward example (seeded)

**Discover IT @ Walmart — 5%**  
`reward_type: ROTATING`, `2026-01-01` → `2026-03-31`

After March 31 the scheduler sets `is_active=false`; recommendations ignore it unless you add a new row for Q2 via admin API.

---

## License

MIT
