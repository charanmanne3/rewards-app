#!/usr/bin/env sh
# Local/manual entrypoint — migrations then uvicorn (not used by Render native start command).
set -eu

PORT="${PORT:-10000}"
WORKERS="${WEB_CONCURRENCY:-1}"

echo "Running database migrations..."
alembic upgrade head

echo "Starting API on 0.0.0.0:${PORT} (workers=${WORKERS})..."
if [ "$WORKERS" -gt 1 ] 2>/dev/null; then
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers "$WORKERS"
else
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
fi
