#!/usr/bin/env sh
# Local/manual entrypoint — migrations then uvicorn (not used by Render native start command).
set -eu

PORT="${PORT:-10000}"
WORKERS="${WEB_CONCURRENCY:-1}"

echo "Starting API on 0.0.0.0:${PORT} (workers=${WORKERS})..."
echo "Note: migrations and seed run automatically via app startup (app.main lifespan)."
if [ "$WORKERS" -gt 1 ] 2>/dev/null; then
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers "$WORKERS"
else
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
fi
