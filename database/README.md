# Database

PostgreSQL on **AWS RDS** in production; Docker Postgres locally.

## Schema (v2)

### `rewards` lifecycle

Rewards are **never hard-coded** in application logic. All rates live in `rewards`:

- **STATIC** — Ongoing baseline (e.g. 2% everywhere)
- **ROTATING** — Quarterly categories (requires `start_date` + `end_date`)
- **PROMOTIONAL** — Short issuer/merchant promos

Automatic expiration sets `is_active = false` when `end_date` is in the past (scheduled job + optional Lambda).

### Migrations

```bash
cd backend
alembic upgrade head   # applies 001 + 002
```

| Revision | Changes |
|----------|---------|
| `001` | Initial tables |
| `002` | Reward type, dates, is_active, timestamps; drops single row per store+card constraint |

### Seed

```bash
python -m scripts.seed
```

### RDS connection

Set on Render / Lambda:

```
DATABASE_URL=postgresql://user:pass@your-rds.region.rds.amazonaws.com:5432/rewards_db?sslmode=require
```

Restrict security groups to Render outbound IPs or a VPC peering setup.
