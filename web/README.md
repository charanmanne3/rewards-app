# Rewards Web (React + Vite + Tailwind)

A lightweight web UI for your Rewards API.

## Configure API URL

Create `web/.env` (or use your host env vars) with:

```env
VITE_API_URL=https://YOUR_API.onrender.com
```

If `VITE_API_URL` is not set, the app will call `/recommend` on the same origin.

## Run

```bash
cd web
npm install
npm run dev
```

## What it calls

- `GET /recommend?category=<category>`
