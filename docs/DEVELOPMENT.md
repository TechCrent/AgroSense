# Development: integration first

Deploy only **after** the stack below works locally. The API and SPA are separate processes; the browser talks to Vite in dev, which proxies `/api` to Django.

## Prerequisites

- **Python 3.13+** (match `Backend/runtime.txt` if unsure)
- **Node.js 18+** (for Vite and `npm run verify`)

## 1. Backend (Django)

From the repository root:

```bash
cd Backend
python -m venv .venv
```

**Windows (PowerShell):** `.venv\Scripts\activate`  
**macOS / Linux:** `source .venv/bin/activate`

```bash
pip install -r requirements.txt
copy .env.example .env
```

Edit **`Backend/.env`**: set at least `SECRET_KEY`, `CLAUDE_API_KEY`, `PLANT_DETECTION_API_KEY`, `PLANTHEALTH_API_KEY`, and any keys your routes need (see [Backend/.env.example](../Backend/.env.example)).

```bash
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Leave this terminal running.

### Optional: Pipenv

If you use Pipenv, run commands **through** the virtualenv, e.g. `pipenv run python manage.py runserver 127.0.0.1:8000`, and keep [Pipfile](../Backend/Pipfile) in sync with [requirements.txt](../Backend/requirements.txt). The canonical install path for CI and Render is **`pip` + `requirements.txt`**.

## 2. Frontend (Vite)

New terminal, from repo root:

```bash
cd agrofrontend
npm ci
copy .env.example .env
```

For **local dev**, keep **`VITE_API_BASE_URL` empty** in `agrofrontend/.env` so requests go to the Vite dev server and **`vite.config.js`** proxies `/api` → `http://127.0.0.1:8000`.

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

## 3. Verify integration

With Django still running on port **8000**, from the **repository root**:

```bash
npm run verify
```

If Node is not installed, use the stdlib Python script (same checks):

```bash
python scripts/verify_integration.py
```

This checks `GET /health/` and `GET /api/schema/`. To test a **deployed** API:

**Windows (cmd):** `set VERIFY_API_URL=https://api.example.com` then `npm run verify` or `python scripts/verify_integration.py`  
**PowerShell:** `$env:VERIFY_API_URL="https://api.example.com"; npm run verify`

(`VERIFY_API_URL` must have **no** trailing slash.)

## 4. Integration package (Kindwise / Claude / Khaya)

For behaviour of `/api/scan/` and `/api/confirm/`, see [integration/INTEGRATION.md](../integration/INTEGRATION.md). Optional CLI smoke tests (with keys in env):

```bash
pip install -r integration/requirements.txt
python -m integration.smoke_tests identify path/to/plant.jpg
```

## 5. Production build (sanity)

Before shipping the frontend:

```bash
npm run build:frontend
```

For a production build, set **`VITE_API_BASE_URL`** to your public API origin (same scheme/host as the Django deployment, no trailing slash) before running `npm run build`.

## Troubleshooting

| Symptom | What to check |
|--------|----------------|
| `ModuleNotFoundError` in Django | `pip install -r requirements.txt` inside an activated venv. |
| Frontend “cannot reach API” | Django running on `127.0.0.1:8000`; `VITE_API_BASE_URL` **empty** for dev proxy; restart Vite after changing `.env`. |
| CORS errors when calling Django directly | Prefer empty `VITE_API_BASE_URL` in dev (proxy). If you set a full API URL, add `CORS_ALLOWED_ORIGINS` in `Backend/.env`. |

