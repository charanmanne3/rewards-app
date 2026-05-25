# Architecture guide

This document explains **why each major piece exists** and how it fits a scalable fintech rewards platform.

## Design principles

1. **Database-driven rewards** — Admins change cashback, dates, and types via API. No code deploy for rate updates.
2. **Layered backend** — Routes → services → CRUD → models. Easy to add scraping, Lambda jobs, or ML later.
3. **Explicit eligibility rules** — One module decides if a reward is “live” today (start/end dates + `is_active`).
4. **AWS-ready** — Stateless API, external Postgres (RDS), standalone cleanup script for EventBridge/Lambda.

---

## Backend layout

```
backend/app/
├── main.py                 # FastAPI app, CORS, lifespan, scheduler start/stop
├── core/
│   ├── config.py           # Environment settings (DB, admin key, cache TTL, jobs)
│   ├── logging.py          # Unified log format
│   ├── security.py         # JWT + bcrypt for users
│   └── cache.py            # TTL cache for recommendations (swap for Redis later)
├── db/
│   ├── base.py             # SQLAlchemy Base + model imports for Alembic
│   └── session.py          # Engine, connection pool, get_db() dependency
├── models/
│   ├── enums.py            # RewardType: STATIC | ROTATING | PROMOTIONAL
│   ├── store.py            # Retail merchants
│   ├── credit_card.py      # Card catalog
│   ├── reward.py           # Store×card rates with lifecycle fields
│   └── user.py             # Auth accounts
├── schemas/                # Pydantic validation for API I/O
├── crud/                   # Database queries only (no business rules)
├── services/
│   ├── reward_eligibility.py   # Date/active rules (single source of truth)
│   ├── reward_expiration.py    # Deactivate past end_date
│   ├── reward_mapper.py        # ORM → API DTOs
│   └── recommendation.py       # Best card engine + cache
├── api/routes/
│   ├── stores.py, cards.py, recommendations.py, users.py  # Public API
│   └── admin_rewards.py    # CRUD + pagination + expire job trigger
└── jobs/
    └── scheduler.py        # APScheduler in-process cleanup
```

### `rewards` table (core)

| Column | Purpose |
|--------|---------|
| `reward_type` | STATIC / ROTATING / PROMOTIONAL — how ops treats the offer |
| `start_date`, `end_date` | Validity window (required for ROTATING quarters) |
| `is_active` | Manual off-switch; auto-false when expired |
| `created_at`, `updated_at` | Audit trail for admin / future analytics |

Multiple rows per store+card are allowed (baseline STATIC + limited PROMOTIONAL).

### Recommendation flow

```
GET /best-card/{store}
  → recommendation service
  → CRUD loads is_active=true rewards for store
  → eligibility filter (today ∈ [start, end])
  → dedupe by card (max cashback)
  → sort DESC
  → cache result (5 min default)
```

### Expiration (automatic)

- **On read:** Expired rewards fail `is_reward_eligible()` even if `is_active` is still true briefly.
- **Scheduled job:** Every N minutes, `deactivate_expired_rewards()` sets `is_active=false` when `end_date < today`.
- **Lambda-ready:** `python -m scripts.run_expiration_cleanup` for EventBridge without running the web server.

### Admin API

Protected by `X-Admin-API-Key` (set `ADMIN_API_KEY`). Future: JWT roles + audit log.

| Endpoint | Action |
|----------|--------|
| `GET /admin/rewards` | Paginated list, filters |
| `POST /admin/rewards` | Add reward |
| `PATCH /admin/rewards/{id}` | Update %, dates, type |
| `POST /admin/rewards/{id}/deactivate` | Turn off |
| `POST /admin/rewards/jobs/expire` | Run cleanup now |

---

## Frontend layout

```
frontend/
├── app/                    # Expo Router screens
│   ├── index.tsx           # Home
│   ├── stores.tsx          # Store picker
│   ├── best-rewards/[storeName].tsx
│   └── admin/rewards.tsx   # Admin dashboard
└── src/
    ├── api/client.ts       # HTTP + admin headers
    ├── types/api.ts        # Shared TypeScript types
    └── components/         # UI building blocks
```

---

## Future extensions (planned hooks)

| Feature | Where to add |
|---------|----------------|
| Issuer scraping | `services/ingestion/` + Lambda posting to admin API |
| Redis cache | Replace `core/cache.py` implementation |
| AI ranking | New `services/recommendation_ml.py` behind same route |
| Analytics | Read `rewards.updated_at` + recommendation logs |
| Multi-tenant admins | `users.role` + deps.py JWT checks |
