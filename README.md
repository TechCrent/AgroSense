# AgroSense

Plant and crop identification, health assessment, and related APIs (Kindwise / Gemini / Claude integration).

## Quick start

| Step | Doc |
|------|-----|
| Local backend + frontend + **verify integration** | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| **Render** (API) + **Vercel** (SPA) | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Python integration layer (Plant.id, Claude, Khaya) | [integration/INTEGRATION.md](integration/INTEGRATION.md) |

**Repository layout**

- **`Backend/`** — Django API (`manage.py`, `agri_backend/`, `core/`)
- **`agrofrontend/`** — Vite + React SPA
- **`integration/`** — Shared Python services used by Django
- **`render.yaml`** — Render Blueprint (`rootDir: Backend`)
- **`vercel.json`** — Vercel build for `agrofrontend/` from the repo root

From the repo root, after the backend is running on port 8000:

```bash
npm run verify
# or: python scripts/verify_integration.py
```
