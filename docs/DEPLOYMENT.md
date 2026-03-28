# Production deployment

Complete [DEVELOPMENT.md](./DEVELOPMENT.md) first (`npm run verify` against local Django). Production uses **Render** for the Django API and **Vercel** for the static SPA.

## Principles

- **Secrets** only in platform env UIs, never in git.
- **Backend**: `DEBUG=False`, strong `SECRET_KEY`, explicit `ALLOWED_HOSTS`, CORS/CSRF limited to real front-end origins.
- **Frontend**: `VITE_*` vars are baked in at **build** time — change env on Vercel → **redeploy** the frontend.

## 1. Render (Django API)

1. **New** → **Web Service** (or **Blueprint** using [`render.yaml`](../render.yaml)).
2. **Root directory:** `Backend`
3. **Build command:**  
   `pip install -r requirements.txt && python manage.py migrate --noinput`
4. **Start command:**  
   `gunicorn agri_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4`
5. **Health check path:** `/health/`

### Environment variables (Render)

Set from [Backend/.env.example](../Backend/.env.example). Minimum:

| Variable | Notes |
|----------|--------|
| `SECRET_KEY` | Long random string. |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | Your service hostname, e.g. `agrosense-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` (exact origin, **https**, no trailing slash) |
| `CSRF_TRUSTED_ORIGINS` | Same as CORS if you rely on CSRF from that origin |
| API keys | `CLAUDE_API_KEY`, `PLANT_DETECTION_API_KEY`, `PLANTHEALTH_API_KEY`, `GEMINI_API_KEY`, etc. |

**Database:** omit `DATABASE_URL` to use SQLite on the instance (fine for demos). For durable data, add Render PostgreSQL and set `DATABASE_URL` to the **Internal Database URL** (full URL — not a `...@host...` placeholder).

After deploy, note the public URL: `https://<name>.onrender.com`.

**Smoke test:**

```bash
set VERIFY_API_URL=https://<name>.onrender.com
npm run verify
```

## 2. Vercel (React SPA)

1. Import the **same Git repo**.
2. **Root directory:** repository root (uses root [`vercel.json`](../vercel.json)).
3. **Environment variables** (Production — and Preview if needed):

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | `https://<name>.onrender.com` — **no trailing slash** |

4. Deploy / redeploy so the build picks up `VITE_API_BASE_URL`.

The SPA must call the API by absolute URL in production (there is no Vite proxy on Vercel). Empty `VITE_API_BASE_URL` is only for local dev.

## 3. Cross-origin checklist

1. Render **`CORS_ALLOWED_ORIGINS`** includes the exact Vercel `https://…` origin.
2. Frontend **`VITE_API_BASE_URL`** matches the Render base URL (scheme + host, no path, no trailing slash).
3. Redeploy **Vercel** after any `VITE_*` change.

## 4. Operational notes

- **Cold starts:** free-tier Render services may sleep; first request can take ~30–60s.
- **Headers:** root `vercel.json` sets basic security headers on static assets; Django should stay behind HTTPS on Render.

## Files

| File | Role |
|------|------|
| [`render.yaml`](../render.yaml) | Optional Render Blueprint |
| [`vercel.json`](../vercel.json) | Vercel build output + SPA routing + headers |
| [`Backend/requirements.txt`](../Backend/requirements.txt) | Python dependencies |
| [`Backend/runtime.txt`](../Backend/runtime.txt) | Python version hint |
