# Deploy: Render (API) + Vercel (SPA)

Complete [DEVELOPMENT.md](./DEVELOPMENT.md) locally first (`npm run verify` with Django on port 8000).

**Layout:** monorepo root contains `Backend/` (Django) and `agrofrontend/` (Vite). Render serves the API; Vercel serves static files from `agrofrontend/dist`. The browser must call the API by **absolute URL** in production — set **`VITE_API_BASE_URL`** on Vercel to your Render service URL.

---

## 1. Render — Django backend

### Option A — Blueprint

1. [Render](https://render.com) → **New** → **Blueprint** → connect this repo.
2. Select [`render.yaml`](../render.yaml) at the repo root.
3. After the service is created, open **Environment** and add variables from [Backend/.env.example](../Backend/.env.example) (see §3 and [`.env.render.template`](../Backend/.env.render.template)).
4. **Redeploy** after saving secrets.

### Option B — Manual web service

| Setting | Value |
|---------|--------|
| **Root Directory** | `Backend` |
| **Runtime** | Python 3.13 (match [`Backend/runtime.txt`](../Backend/runtime.txt)) |
| **Build Command** | `pip install -r requirements.txt && python manage.py migrate --noinput` |
| **Start Command** | `gunicorn agri_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4` |
| **Health Check Path** | `/health/` |

Add the same environment variables as in §3.

**Public URL:** `https://<service-name>.onrender.com` (note this for Vercel).

**Smoke test** (from repo root):

```bash
set VERIFY_API_URL=https://<service-name>.onrender.com
npm run verify
```

(PowerShell: `$env:VERIFY_API_URL="https://..."; npm run verify`)

---

## 2. Vercel — React frontend

1. [Vercel](https://vercel.com) → **Add New Project** → import **this repository**.
2. **Root Directory:** leave as the **repository root** (not `agrofrontend` alone) so root [`vercel.json`](../vercel.json) applies.
3. **Environment Variables** (Production; add Preview if you use preview deploys):

| Name | Example value |
|------|-----------------|
| `VITE_API_BASE_URL` | `https://<service-name>.onrender.com` |

**No trailing slash.** `VITE_*` is embedded at **build** time — change it → **redeploy**.

4. Deploy.

---

## 3. Environment variables (Render)

Never commit real secrets. Use [Backend/.env.example](../Backend/.env.example) as the full list.

| Variable | Notes |
|----------|--------|
| `SECRET_KEY` | Long random string. |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | Your Render hostname, e.g. `agrosense-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Your Vercel origin: `https://<project>.vercel.app` (https, no trailing slash). Add preview URLs if needed, comma-separated. |
| `CSRF_TRUSTED_ORIGINS` | Same as CORS when the SPA uses cookies / CSRF from that origin. |
| `DATABASE_URL` | Optional. Omit for SQLite on the instance, or paste **Internal Database URL** from Render Postgres. |
| API keys | `CLAUDE_API_KEY`, `PLANT_DETECTION_API_KEY`, `PLANTHEALTH_API_KEY`, `GEMINI_API_KEY`, etc. |

---

## 4. Checklist

1. Render deploys; `GET https://<backend>/health/` returns `ok`.
2. Vercel **`VITE_API_BASE_URL`** matches the Render base URL exactly.
3. Render **`CORS_ALLOWED_ORIGINS`** includes every Vercel origin you use.
4. After changing `VITE_*`, **redeploy** the frontend.

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| Frontend cannot reach API | Set `VITE_API_BASE_URL` on Vercel and redeploy. |
| CORS error in browser | Add exact SPA `https://…` origin to `CORS_ALLOWED_ORIGINS` on Render. |
| First request slow | Render free tier cold start; retry after ~30–60s. |
| Wrong Python or build fails | Root Directory must be `Backend`; use `pip` + `requirements.txt`. |

---

## Files

| File | Role |
|------|------|
| [`render.yaml`](../render.yaml) | Render Blueprint (`rootDir: Backend`) |
| [`vercel.json`](../vercel.json) | Vercel build + SPA routing + headers |
| [`.vercelignore`](../.vercelignore) | Optional: smaller uploads to Vercel |
| [`Backend/.env.render.template`](../Backend/.env.render.template) | Env names to paste in Render |
