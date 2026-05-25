#!/usr/bin/env sh
# Production entrypoint — migrations then uvicorn (Render, Docker, RDS).
set -eu

PORT="${PORT:-8000}"
WORKERS="${WEB_CONCURRENCY:-1}"

echo "Running database migrations..."
alembic upgrade head

echo "Starting API on 0.0.0.0:${PORT} (workers=${WORKERS})..."
if [ "$WORKERS" -gt 1 ] 2>/dev/null; then
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers "$WORKERS"
else
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
fi
