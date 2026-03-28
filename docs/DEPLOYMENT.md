# Deploy: Render (backend) + Vercel (frontend)

Deploy the **Django API** to [Render](https://render.com) and the **Vite React app** to [Vercel](https://vercel.com). Do the backend first so you get a public API URL for the frontend env var.

---

## 1. Database (Render backend)

**Default for this repo:** **SQLite**. When **`DATABASE_URL` is not set**, Django uses `Backend/db.sqlite3` (see [`agri_backend/settings.py`](../Backend/agri_backend/settings.py)). The build runs `migrate`, so tables exist before the app starts.

- **Trade-off:** Render’s disk can be ephemeral; the SQLite file may not survive every redeploy. Fine for demos and stateless API usage. For durable user data, use PostgreSQL and set `DATABASE_URL`.

**Optional — PostgreSQL:** Create a **PostgreSQL** instance on Render, then on the web service set **`DATABASE_URL`** to the **Internal Database URL** from the DB **Connections** tab (real hostname like `dpg-…render.com`, not a placeholder).

---

## 2. Render — Web service (Django)

### Option A — Blueprint (repo includes `render.yaml`)

1. **New +** → **Blueprint**.
2. Connect your Git repo and select **`render.yaml`**.
3. Review the service **`agrosense-backend`** (`rootDir: Backend`).
4. After the first deploy, open the **web service** → **Environment** and add every variable from [Backend/.env.example](../Backend/.env.example) that your app needs (see checklist below).  
   - **Do not set `DATABASE_URL`** if you want SQLite (default).  
   - Set **`DATABASE_URL`** only if you created Postgres (see §1).
5. **Redeploy** after saving env vars.

### Option B — Manual Web Service

1. **New +** → **Web Service** → connect the repo.
2. **Root Directory:** `Backend`
3. **Runtime:** Python 3.13 (or match `Backend/runtime.txt`).
4. **Build command:**  
   `pip install -r requirements.txt && python manage.py migrate --noinput`
5. **Start command:**  
   `gunicorn agri_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4`
6. **Health check path:** `/health/`
7. Add the same environment variables as in the checklist below (omit `DATABASE_URL` for SQLite).
8. Deploy.

#### Build command: `pip` (recommended) vs Pipenv

**Recommended on Render** — install into Render’s active Python and run `migrate` with the same interpreter (matches [`render.yaml`](../render.yaml)):

```bash
pip install -r requirements.txt && python manage.py migrate --noinput
```

**If you use Pipenv**, dependencies are installed into **Pipenv’s virtualenv**. The next command must be **`pipenv run python`**, not plain `python`, or migrations run with the wrong interpreter and the deploy can fail:

```bash
pip install pipenv && pipenv install --deploy && pipenv run python manage.py migrate --noinput
```

`--deploy` uses `Pipfile.lock`. To align with `requirements.txt` instead:

```bash
pip install pipenv && pipenv run pip install -r requirements.txt && pipenv run python manage.py migrate --noinput
```

If the build uses Pipenv, the **start command** must also run inside that env, for example:

```bash
pipenv run gunicorn agri_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4
```

Using `pipenv install … && python manage.py …` (without `pipenv run`) is a common mistake: `python` is usually **not** the Pipenv environment.

### Backend URL

When the deploy succeeds, note the public URL, e.g.  
`https://agrosense-backend.onrender.com`  
(no trailing slash). You will use this on Vercel as `VITE_API_BASE_URL`.

---

## 3. Environment variables (Render)

Set these on the **web service** (Secrets for sensitive values). Align with [Backend/.env.example](../Backend/.env.example).

| Variable | Notes |
|----------|--------|
| `SECRET_KEY` | Long random string; **never** commit it. |
| `DEBUG` | `False` in production. |
| `ALLOWED_HOSTS` | Your Render hostname only, e.g. `agrosense-backend.onrender.com` (comma-separated if several). |
| `DATABASE_URL` | **Omit** for SQLite. Set only if using Render PostgreSQL (full Internal Database URL). |
| `CORS_ALLOWED_ORIGINS` | Your **Vercel** site origin(s), e.g. `https://your-project.vercel.app` (comma-separated, **https**, no path). |
| `CSRF_TRUSTED_ORIGINS` | Same as CORS if you use cookies / admin from that origin. |
| `PLANT_DETECTION_API_KEY`, `PLANTHEALTH_API_KEY`, `CLAUDE_API_KEY`, `GEMINI_API_KEY`, `KHAYA_API_TOKEN`, etc. | As required by your features. |

After changing env vars, trigger a **manual deploy** if the service does not restart automatically.

### Smoke tests (backend)

- `GET https://<your-backend>/health/` → should return `ok`
- `GET https://<your-backend>/api/docs/` → Swagger UI (if enabled)

---

## 4. Vercel — Frontend

1. **Import** the same Git repository in [Vercel](https://vercel.com).
2. **Root Directory:** leave as **repository root** so Vercel uses the root [`vercel.json`](../vercel.json) (`install` / `build` in `agrofrontend`, output `agrofrontend/dist`, SPA rewrites).  
   **Alternative:** set **Root Directory** to **`agrofrontend`** and rely on [`agrofrontend/vercel.json`](../agrofrontend/vercel.json) instead (Vercel then ignores the root file).
3. Framework preset should detect **Vite** from the config above.
4. **Environment variables** (Production — and Preview if you want):
   - **`VITE_API_BASE_URL`** = `https://<your-render-host>.onrender.com`  
     **No trailing slash.** This is how `axios` in `src/api.js` reaches Django in production.

5. Deploy.

### Frontend URL

Use the assigned `*.vercel.app` URL. If you already deployed the backend, go back to **Render** and add this exact origin to **`CORS_ALLOWED_ORIGINS`** (and **`CSRF_TRUSTED_ORIGINS`** if needed), then redeploy the backend once.

---

## 5. Order of operations (summary)

1. Deploy **Django** on Render → set env vars (no `DATABASE_URL` for SQLite) → confirm `/health/`.
2. Deploy **Vercel** with `VITE_API_BASE_URL` pointing at Render.
3. Add the **Vercel `https://…` origin** to Render’s **CORS** (and CSRF) → redeploy backend.

---

## 6. Troubleshooting

| Issue | What to check |
|--------|----------------|
| Browser **CORS** error | `CORS_ALLOWED_ORIGINS` on Render must include the **exact** Vercel URL (`https://…`, no trailing slash). |
| **502 / connection** from Vercel | Render service sleeping (free tier), wrong `VITE_API_BASE_URL`, or backend crash — check Render **Logs**. |
| **Database** errors | For SQLite: **remove** `DATABASE_URL` from the web service if it was set to a bad/placeholder URL. For Postgres: use the real Internal Database URL. |
| **API key** errors | Same env names as local `.env`; no quotes unless the value itself contains spaces. |
| Vercel **“No python entrypoint”** | Project root was treated as Python (e.g. stray `Pipfile`). Use root [`vercel.json`](../vercel.json) + **Root Directory** = repo root, or set **Root Directory** to `agrofrontend` only. |

---

## Files reference

| File | Role |
|------|------|
| [render.yaml](../render.yaml) | Render Blueprint for the API |
| [Backend/requirements.txt](../Backend/requirements.txt) | Python deps (`gunicorn`, `psycopg2-binary` for optional Postgres) |
| [Backend/runtime.txt](../Backend/runtime.txt) | Python version hint for Render |
| [vercel.json](../vercel.json) | Monorepo Vite build + SPA routing (repo root) |
| [agrofrontend/vercel.json](../agrofrontend/vercel.json) | Same, when Vercel **Root Directory** is `agrofrontend` |
| [Backend/.env.example](../Backend/.env.example) | Full list of backend env vars |
