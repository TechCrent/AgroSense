# AgroSense — Project Specification and Handbook

This document is the single source of truth for **current structure**, **technologies**, **behaviour**, **deployment**, and **what remains to be done**. It replaces scattered notes and supersedes the empty legacy `readme.me`.

---

## 1. Purpose and scope

**AgroSense** is a web application that helps users **photograph a plant**, **identify candidate species** (via Plant.id), **confirm a plant**, **assess health** (Plant.id health assessment), and receive **structured farming advice** (Anthropic Claude JSON). When the UI language is not English, **optional translation** of the diagnosis is performed via **Khaya / Lelapa** if credentials are configured.

**In scope today:** scan → select (if needed) → confirm → result, with **no persistent user database** required for the core demo (SQLite may exist for Django admin/migrations only).

**Out of scope / deferred:** durable multi-user accounts, billing, agronomic guarantee of recommendations, offline-first native apps.

---

## 2. Repository layout

```
AgroSense/
├── backend/                 # Django project (API only for product flows)
│   ├── config/              # Project settings, URLs, WSGI/ASGI (formerly agri_backend)
│   ├── api/                 # Product API: scan, confirm, health, clients, services, tests
│   ├── core/                # Legacy Kindwise proxy routes (deprecated for main app flow)
│   ├── manage.py
│   ├── requirements.txt
│   ├── runtime.txt
│   └── scripts/
│       └── smoke_test.py    # HTTP smoke test against a running server
├── frontend/                # Vite + React SPA
│   ├── src/
│   ├── scripts/
│   │   ├── generate_locales.py   # Batch-translate locale JSON via Khaya (optional)
│   │   ├── khaya_translate.py    # Standalone Khaya client for locale tooling
│   │   ├── requirements-locales.txt
│   │   └── sync-locales.mjs      # Merge en.json keys into other locale files
│   └── package.json
├── docs/
│   ├── DEPLOYMENT.md        # Render + Vercel, env vars, troubleshooting
│   └── BACKEND_REBUILD_CHECKLIST.md
├── render.yaml              # Render blueprint (rootDir: backend)
├── vercel.json              # Monorepo: build frontend/, proxy /api → Render
└── README.md                # This file
```

The former **`integration/`** folder has been **removed**. Its responsibilities were folded into:

- **Runtime API:** `backend/api/` (Plant.id, Claude, Khaya diagnosis translation).
- **Locale batch tooling:** `frontend/scripts/` (Khaya for generating `*.json` locale files).

---

## 3. Technology stack

| Layer | Technology | Role |
|--------|------------|------|
| Frontend | React 19, Vite 8, React Router 7, Tailwind 4, Axios | SPA, routing, styling, HTTP |
| Backend | Django 6, Django REST Framework, drf-spectacular | REST API, OpenAPI |
| HTTP server (prod) | Gunicorn | WSGI on Render |
| Plant ID / health | Plant.id API (Kindwise) via `httpx` | Identification and health scoring |
| Diagnosis | Anthropic Claude (Messages API) | JSON `summary` + `steps` |
| Translation (optional) | Lelapa Khaya API | Diagnosis translation + optional locale file generation |
| Config | `python-decouple` / `.env` | Backend secrets and toggles |
| Hosting | Render (API), Vercel (static + rewrites) | Split deployment |

---

## 4. Functional behaviour (current product)

### 4.1 User flow

1. User uploads or captures an image on **Home**.
2. **Scan** (`POST /api/scan/`) returns `{ candidates, version }` where each candidate has `name`, `common_name`, `confidence`, `image_url`.
3. If multiple candidates or low confidence, user picks one on **Selection**.
4. **Confirm** (`POST /api/confirm/`) returns `{ plant, health, diagnosis, version }`:
   - `plant`: scientific/common name and optional confidence from scan metadata.
   - `health`: `status`, `disease_name`, `disease_type`, `confidence` (mapped from Plant.id).
   - `diagnosis`: `summary`, `steps[]`, `language` (Claude output in English first; Khaya may translate summary/steps when `language` ≠ `en` and `KHAYA_API_TOKEN` is set with a supported locale code).
5. **Result** shows advice; user may switch language (re-confirms via API in the app).

### 4.2 API endpoints (contract)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health/` | Liveness (`ok` plain text) for Render |
| `POST` | `/api/scan/` | Multipart field `image` → candidates |
| `POST` | `/api/confirm/` | Multipart: `image`, `plant_name`, `language`; optional `scientific_name`, `plant_confidence` |
| `GET` | `/api/docs/` | Swagger UI (DRF Spectacular) |
| `GET` | `/api/schema/` | OpenAPI schema |

**Success JSON always includes `version`** (e.g. `v1`) on scan/confirm responses.

**Errors:** DRF-style `{ "detail": "<message>" }` for validation and upstream failures.

### 4.3 Frontend ↔ backend alignment

- `frontend/src/api.js` calls `/api/scan/` and `/api/confirm/` with `axios` and a **base URL** from `VITE_API_BASE_URL` or same-origin `/api` (Vite dev proxy / Vercel rewrite).
- Dev proxy: `frontend/vite.config.js` proxies `/api` to `http://127.0.0.1:8000` by default.

---

## 5. Configuration (environment variables)

### Backend (`backend/.env` or host env)

**Required for full pipeline:** `SECRET_KEY`, `CLAUDE_API_KEY`, `PLANT_DETECTION_API_KEY`, production `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` (when applicable).

**Optional:** `DATABASE_URL` (Postgres); if unset, SQLite is used (ephemeral on some hosts). `KHAYA_API_TOKEN` / `KHAYA_TRANSLATE_URL` for non-English diagnosis translation. `ANTHROPIC_MODEL`, `PLANT_API_URL`.

See `backend/.env.example` and `docs/DEPLOYMENT.md`.

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL` — empty for same-origin `/api` (recommended with `vercel.json` rewrite), or full Render origin for direct calls (then CORS must allow the Vercel origin).

---

## 6. Deployment (summary)

- **Backend:** Render, `rootDir: **backend**`, start: `gunicorn config.wsgi:application ...` — see `render.yaml` and `docs/DEPLOYMENT.md`.
- **Frontend:** Vercel with **repository root** as project root; `vercel.json` builds `frontend/` and rewrites `/api/*` to the Render service URL (update the destination when the API URL changes).

---

## 7. What has been completed

- Single-folder **Django API** under `backend/api/` (views → services → clients).
- **No `integration/` package**; Plant.id, Claude, and Khaya logic live under `backend/api/clients/` and `backend/api/services/`.
- **Renames:** `frontend/` (was `agrofrontend`), `backend/config/` (was `agri_backend`), deploy paths updated.
- **OpenAPI** via drf-spectacular; **health** endpoint for probes.
- **Smoke script** `backend/scripts/smoke_test.py`.
- **Locale tooling:** `frontend/scripts/generate_locales.py` + standalone `khaya_translate.py` + `requirements-locales.txt`.
- **Documentation:** `docs/DEPLOYMENT.md`, `docs/BACKEND_REBUILD_CHECKLIST.md`, this `README.md`.

---

## 8. What is not done yet (gaps and roadmap)

| Area | Status | Notes |
|------|--------|--------|
| Persistent user data / auth | Not implemented | SQLite/Postgres schema minimal; no registration flow |
| Real Khaya mapping for all UI locales | Partial | Backend maps a subset (`zu`, `xh`, `swh`, `sot`, `afr`); other locale codes fall back to English diagnosis text |
| Legacy `backend/core` Kindwise proxies | Still present | `/identify-plant/` etc. — optional to remove if unused |
| Automated CI | Not described in repo | Add GitHub Actions: `python manage.py test`, `npm run build` |
| Rate limiting / API auth | Not implemented | Public `AllowAny` — acceptable for demo only |
| E2E browser tests | Not implemented | Consider Playwright against staging |
| Root `package.json` | Minimal | Only `axios`; could be removed or used for workspace scripts |

---

## 9. Operational notes

- **Cold starts (Render free tier):** first request after idle may take tens of seconds; the frontend error helper mentions this.
- **Secrets:** never commit `.env` files; use host secret managers on Render/Vercel.
- **SQLite on Render:** can reset between deploys; fine for stateless API demos.

---

## 10. Further reading

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — step-by-step deploy and troubleshooting.
- [docs/BACKEND_REBUILD_CHECKLIST.md](docs/BACKEND_REBUILD_CHECKLIST.md) — phased verification gates.

---

*Last updated to reflect removal of `integration/`, Khaya port into `backend/api/clients/khaya_client.py`, and locale scripts under `frontend/scripts/`.*
