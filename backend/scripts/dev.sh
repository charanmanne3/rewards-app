#!/usr/bin/env bash
# Start the API locally (installs deps, migrates, seeds if needed).
set -euo pipefail
cd "$(dirname "$0")/.."

python -m pip install -r requirements.txt -q
python -c "import psycopg2; from app.main import app" 2>/dev/null || {
  echo "ERROR: psycopg2 not installed. Run: pip install -r requirements.txt" >&2
  exit 1
}

alembic upgrade head
python -m scripts.seed

exec uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
