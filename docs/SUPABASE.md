# Supabase PostgreSQL setup

Use [Supabase](https://supabase.com) as the managed PostgreSQL database for production. The API can run on Render while the database stays on Supabase.

## 1. Create a project

1. [supabase.com](https://supabase.com) → **New project**.
2. Choose region close to your Render API region.
3. Save the database password securely.

## 2. Get the connection string

**Project Settings** → **Database** → **Connection string** → **URI**.

Use the **Transaction pooler** (port `6543`) for serverless/Render:

```text
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

Or **Direct connection** (port `5432`) for migrations from your laptop:

```text
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

The API normalizes `postgres://` to `postgresql://` automatically.

## 3. Configure Render API

Set on your Render web service:

```env
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require
APP_ENV=production
DEBUG=false
```

Never commit this URL to git.

## 4. Run migrations

### From Render Shell (recommended)

After first deploy, open Render → **Shell**:

```bash
alembic upgrade head
python -m scripts.seed
```

Startup script already runs `alembic upgrade head` on each deploy.

### From your laptop

```bash
cd backend
export DATABASE_URL="postgresql://...?sslmode=require"
export APP_ENV=production
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed
```

## 5. Connection pooling

Supabase pooler + SQLAlchemy pool (configured in `app/db/session.py`):

| Setting | Default | Notes |
|---------|---------|--------|
| `DB_POOL_SIZE` | 5 | Keep low on free tier |
| `DB_MAX_OVERFLOW` | 10 | Burst connections |
| `DB_POOL_RECYCLE_SECONDS` | 1800 | Avoid stale SSL connections |

On Render, prefer the **pooler** URL to limit direct connections.

## 6. Security

- Enable **SSL** (`sslmode=require` in URL).
- Restrict database access: Supabase → **Database** → **Network restrictions** if available.
- Use separate Supabase projects for staging vs production.
- Rotate password if `DATABASE_URL` is ever exposed.

## 7. Supabase dashboard

- **Table Editor**: inspect `stores`, `rewards`, `credit_cards` after seed.
- **SQL Editor**: ad-hoc queries.
- Do not expose Supabase **anon** key in the mobile app for this architecture — the app talks to FastAPI only.

## 8. Backups

Supabase Pro includes automated backups. For free tier, export periodically:

```bash
pg_dump "$DATABASE_URL" > rewards_backup.sql
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSL required | Add `?sslmode=require` to URL |
| Too many connections | Use pooler URL; lower `DB_POOL_SIZE` |
| Migration timeout | Use direct connection (5432) for `alembic upgrade` |
| Auth failed | Reset password in Supabase; update Render env |

## Next steps

- Deploy API: [RENDER.md](RENDER.md)
- Full checklist: [DEPLOYMENT.md](DEPLOYMENT.md)
