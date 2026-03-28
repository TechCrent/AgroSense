# Production deployment (Render + Vercel)

Deploy the **Django API** on [Render](https://render.com) and the **Vite React app** on [Vercel](https://vercel.com). Do **not** deploy until [DEVELOPMENT.md](./DEVELOPMENT.md) passes locally (`npm run verify` or `python scripts/verify_integration.py` with Django on port 8000).

---

## Architecture

| Layer | Host | Serves |
|-------|------|--------|
| API | Render web service | `https://<backend>.onrender.com` — Django + Gunicorn |
| SPA | Vercel | `https://<project>.vercel.app` — static `agrofrontend/dist` |

The browser calls the API **directly** from the SPA origin. There is no Vite proxy in production. **`VITE_API_BASE_URL`** must point at the Render URL and is **baked in at build time** on Vercel.

---

## 1. Render — Django API

### Option A — Blueprint (from repo)

1. Render dashboard → **New +** → **Blueprint**.
2. Connect the Git repo and select [`render.yaml`](../render.yaml).
3. Open the created **Web Service** → **Environment** and add **all** variables from [Backend/.env.example](../Backend/.env.example) that your app needs (see §3 and [Backend/.env.render.template](../Backend/.env.render.template)).
4. **Redeploy** after saving secrets.

### Option B — Manual web service

1. **New +** → **Web Service** → connect the repo.
2. **Root Directory:** `Backend`
3. **Runtime:** Python 3.13 (or match [`Backend/runtime.txt`](../Backend/runtime.txt)).
4. **Build Command:**  
   `pip install -r requirements.txt && python manage.py migrate --noinput`
5. **Start Command:**  
   `gunicorn agri_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4`
6. **Health Check Path:** `/health/`
7. Add environment variables (§3).
8. **Deploy**

### After Render deploys

- Public URL: `https://<service-name>.onrender.com` (no trailing slash).
- Smoke test from repo root:

```bash
# Windows cmd
set VERIFY_API_URL=https://<service-name>.onrender.com

# PowerShell
$env:VERIFY_API_URL="https://<service-name>.onrender.com"

npm run verify
```

Or: `python scripts/verify_integration.py`

---

## 2. Vercel — React SPA

1. **Add New Project** → import the **same** Git repository.
2. **Root Directory:** leave as **repository root** (the repo contains [`vercel.json`](../vercel.json) at the root).
3. **Framework Preset:** Vite (usually auto-detected).
4. **Environment Variables** (at least **Production**; add **Preview** if you use preview URLs):

| Name | Value |
|------|--------|
| `VITE_API_BASE_URL` | `https://<service-name>.onrender.com` (no trailing slash, no path) |

5. **Deploy**. Any change to `VITE_*` requires a **new build** (Redeploy).

### Custom domain

If the SPA uses `https://app.example.com`, put that exact origin in Render **`CORS_ALLOWED_ORIGINS`** and **`CSRF_TRUSTED_ORIGINS`** (see §3).

---

## 3. Environment variables (Render)

Copy from [Backend/.env.example](../Backend/.env.example). Never commit real values.

| Variable | Required | Notes |
|----------|----------|--------|
| `SECRET_KEY` | Yes | Long random string. Generate e.g. `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`. |
| `DEBUG` | Yes | `False` |
| `ALLOWED_HOSTS` | Yes | Render hostname only, e.g. `agrosense-backend.onrender.com` (comma-separated if several). |
| `CORS_ALLOWED_ORIGINS` | Yes | Exact Vercel origin(s): `https://your-project.vercel.app` (https, no trailing slash). |
| `CSRF_TRUSTED_ORIGINS` | If cookies/CSRF from SPA | Same origins as CORS when applicable. |
| `LOG_LEVEL` | No | e.g. `INFO` |
| `DATABASE_URL` | No | Omit for **SQLite** on the instance. For Postgres, paste Render’s **Internal Database URL** (hostname looks like `dpg-….render.com`).**Do not** use placeholder hostnames like `host`. |
| `CLAUDE_API_KEY` | If used | Anthropic |
| `PLANT_DETECTION_API_KEY` | If used | Kindwise plant.id |
| `PLANTHEALTH_API_KEY` | If used | Kindwise crop / health |
| `GEMINI_API_KEY` | If used | Google AI |
| `KHAYA_API_TOKEN` | If used | Lelapa / translation |

---

## 4. Wire frontend ↔ backend

1. **Vercel** `VITE_API_BASE_URL` = Render base URL **exactly** (`https` + host, no `/` at end).
2. **Render** `CORS_ALLOWED_ORIGINS` includes **every** Vercel origin you use (production + preview if needed), comma-separated.
3. Change CORS or API URL → **redeploy** the affected service.

---

## 5. Order of operations

1. Deploy **Render** → set env → confirm `/health/` and `npm run verify` with `VERIFY_API_URL`.
2. Set **`VITE_API_BASE_URL`** on **Vercel** → deploy frontend.
3. If the browser still blocks requests, fix CORS on Render and redeploy the backend.

---

## 6. Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Frontend “cannot reach API” / network error | `VITE_API_BASE_URL` set on Vercel **Production** and **redeploy** after changes. |
| CORS error in browser console | `CORS_ALLOWED_ORIGINS` on Render must match the **exact** SPA origin (`https://…`, no trailing slash). |
| First request very slow | Render free tier **cold start**; retry after ~30–60s. |
| `could not translate host name "host"` | Bad `DATABASE_URL` placeholder — use real Internal URL or remove `DATABASE_URL` for SQLite. |
| Build fails on Render | `pip` + `requirements.txt` only; **Root Directory** = `Backend`. |
| Vercel builds wrong app | **Root Directory** = repo root, not `agrofrontend` alone. |

---

## 7. Files in this repo

| File | Purpose |
|------|---------|
| [`render.yaml`](../render.yaml) | Optional Render Blueprint (`rootDir: Backend`) |
| [`vercel.json`](../vercel.json) | Vercel: install/build/output, SPA rewrites, security headers |
| [`Backend/requirements.txt`](../Backend/requirements.txt) | Python dependencies for Render |
| [`Backend/runtime.txt`](../Backend/runtime.txt) | Python version hint |
| [`Backend/.env.example`](../Backend/.env.example) | Full list of backend variables |
| [`Backend/.env.render.template`](../Backend/.env.render.template) | Copy-paste checklist for Render UI |
