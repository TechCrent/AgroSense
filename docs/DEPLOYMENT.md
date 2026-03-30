# Deploy: Render (backend) + Vercel (frontend)

This project now uses a single backend codebase inside `backend/` only.

## 1) Render backend

Use the repo `render.yaml` blueprint or create manually:

- Root directory: `backend`
- Build: `pip install -r requirements.txt && python manage.py migrate --noinput`
- Start: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4`
- Health check: `/health/`

### Required backend env vars

- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=<your-render-host>`
- `CORS_ALLOWED_ORIGINS=https://<your-vercel-host>`
- `CSRF_TRUSTED_ORIGINS=https://<your-vercel-host>`
- `CLAUDE_API_KEY`
- `ANTHROPIC_MODEL` (optional, default set in `.env.example`)
- `PLANT_DETECTION_API_KEY`
- `PLANT_API_URL` (optional, defaults to `https://api.plant.id/v3`)
- `KHAYA_API_TOKEN` (optional — translates diagnosis text when the UI language is not English; see `backend/api/clients/khaya_client.py`)
- `KHAYA_TRANSLATE_URL` (optional)

`DATABASE_URL` is optional. If unset, SQLite is used for now.

### Locale files (developer tooling)

To regenerate selected locale JSON files from `en.json` via Khaya (optional, offline batch):

```bash
pip install -r frontend/scripts/requirements-locales.txt
python frontend/scripts/generate_locales.py
```

## 2) Vercel frontend

Use **repository root** as Vercel Root Directory so only root [`vercel.json`](../vercel.json) is authoritative.

Two frontend API modes are supported:

1. Preferred: `VITE_API_BASE_URL` empty -> `/api/*` calls go through Vercel rewrite to Render.
2. Direct: set `VITE_API_BASE_URL=https://<render-host>.onrender.com` (requires CORS/CSRF allowlist on backend).

## 3) Smoke checks

After deploy:

- `GET https://<render-host>/health/` returns `ok`
- `POST https://<render-host>/api/scan/` with multipart image returns `candidates`
- `POST https://<render-host>/api/confirm/` with multipart image + `plant_name` returns `plant`, `health`, `diagnosis`

Local smoke script:

```bash
python backend/scripts/smoke_test.py --image path/to/leaf.jpg --plant-name Tomato --language en
```

## 4) Troubleshooting

- `Network Error` in browser: check Render URL in `vercel.json` rewrite and backend logs.
- CORS failures: backend must include exact Vercel origin in `CORS_ALLOWED_ORIGINS`.
- HTML returned from `/api/*`: verify Vercel is using repo-root `vercel.json` and rewrite comes before SPA fallback.
- Local Windows: Plant.id `getaddrinfo` / DNS failures — see [LOCAL_DEV_DNS_WINDOWS.md](LOCAL_DEV_DNS_WINDOWS.md) (hosts file; no adapter DNS change required).
