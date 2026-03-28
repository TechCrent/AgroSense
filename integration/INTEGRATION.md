# AgroSense integration layer

**Run Django + the React app locally:** [../docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)

Python module for **Plant.id** (identify + health), **Anthropic Claude** (diagnosis copy), and **Khaya / Lelapa Vulavula** (translation). Used by Django (`/api/scan/`, `/api/confirm/`), the optional FastAPI dev server, and smoke tests.

## Setup

1. Copy [`integration/.env.example`](.env.example) to `integration/.env` (or put the same variables in a root `.env`).
2. From the **repository root** (`AgroSense/`):

   ```bash
   pip install -r integration/requirements.txt
   ```

3. Ensure the repo root is on `PYTHONPATH` when running Django, **or** copy the `integration` package into your Django project tree so `import integration` works.

## Frontend without Django (dev)

The browser cannot hold API keys. Use the small **FastAPI** shim [`integration/dev_api.py`](dev_api.py), which exposes the same **`/api/scan/`** and **`/api/confirm/`** routes as the Django app.

1. Put keys in `integration/.env` or repo-root `.env` (see below).
2. From **repo root**:

   ```bash
   python -m uvicorn integration.dev_api:app --reload --host 127.0.0.1 --port 8787
   ```

3. In **`agrofrontend`**, copy [`.env.example`](../agrofrontend/.env.example) if needed: leave **`VITE_API_BASE_URL` empty** and **do not** set `VITE_DEV_MOCK` (or set it to `false`). Start Vite (`npm run dev`). Requests to `/api/...` are proxied to port **8787** (see [`agrofrontend/vite.config.js`](../agrofrontend/vite.config.js)).

4. For **offline UI work only**, set **`VITE_DEV_MOCK=true`** in `agrofrontend/.env` (uses [`mockData.js`](../agrofrontend/src/mockData.js) and skips all APIs).

## Environment variables

| Variable | Required for | Description |
|----------|----------------|-------------|
| `PLANT_ID_API_KEY` | Plant.id | API key from [web.plant.id](https://web.plant.id) |
| `ANTHROPIC_API_KEY` | Claude | Key from [console.anthropic.com](https://console.anthropic.com) |
| `KHAYA_API_TOKEN` | Khaya | `X-CLIENT-TOKEN` from [Lelapa / Vulavula](https://docs.lelapa.ai) |
| `ANTHROPIC_MODEL` | Optional | Default `claude-3-5-sonnet-20241022` |
| `PLANT_ID_IDENTIFICATION_URL` | Optional | Default `https://api.plant.id/v3/identification` |
| `PLANT_ID_HEALTH_URL` | Optional | Default `https://api.plant.id/v3/health_assessment` |
| `KHAYA_TRANSLATE_URL` | Optional | Default `https://api.lelapa.ai/v1/translate/process` |

## Public API (`integration.services`)

### `identify_plant(image_base64: str) -> list[dict]`

- **Input:** Raw base64 or `data:image/...;base64,...` string (one image).
- **Output:** List of candidates for the frontend selection screen.

**Example item:**

```json
{
  "name": "Solanum lycopersicum",
  "common_name": "Tomato",
  "confidence": 0.94,
  "image_url": "https://..."
}
```

- Returns `[]` if the API reports the image is not a plant.

### `assess_health(image_base64: str) -> dict`

- **Output** (aligned with frontend mocks):

```json
{
  "status": "healthy",
  "disease_name": null,
  "disease_type": null,
  "confidence": 0.92
}
```

or, when unhealthy:

```json
{
  "status": "infected",
  "disease_name": "Early Blight",
  "disease_type": "Fungal",
  "confidence": 0.41
}
```

**Status rules:**

- `healthy` — `is_healthy.binary` is true from Plant.id.
- Otherwise — top disease suggestion probability ≥ `0.25` → `infected`; else `at_risk`.
- When `healthy`, disease fields are `null` and `confidence` is the healthy probability.

### `build_claude_prompt(plant_name: str, health_result: dict) -> str`

- Builds the user message for Claude from the **user-confirmed common name** and the `assess_health` dict.

### `get_diagnosis(prompt: str, *, output_language: str = "en") -> dict`

- Returns validated JSON as:

```json
{
  "summary": "…",
  "steps": ["…", "…"],
  "language": "en"
}
```

- `language` is set to `output_language` after parsing (Claude is asked for JSON with only `summary` and `steps`).

### `translate_diagnosis(diagnosis: dict, target_lang: str) -> dict`

- Same shape as `get_diagnosis` output.
- `target_lang` uses frontend codes: `en`, `zu`, `xh`, `swh`, `sot`, `afr`.
- For `en`, returns a copy without calling Khaya.
- Long text is split into chunks of at most **100 words** (sentence boundaries first); each chunk is translated via Khaya with `eng_Latn` → mapped target (e.g. `zul_Latn`).

### `compose_confirm(image_base64, plant_common_name, frontend_lang, *, scientific_name=None, plant_confidence=None) -> dict`

- Runs: `assess_health` → `build_claude_prompt` → `get_diagnosis` → `translate_diagnosis` (if not `en`).
- **Example response** (shape expected by the React app after `/api/confirm/`):

```json
{
  "plant": {
    "name": "Solanum lycopersicum",
    "common_name": "Tomato",
    "confidence": 0.94
  },
  "health": {
    "status": "infected",
    "disease_name": "Early Blight",
    "disease_type": "Fungal",
    "confidence": 0.88
  },
  "diagnosis": {
    "summary": "…",
    "steps": ["…"],
    "language": "zu"
  }
}
```

Pass `scientific_name` and `plant_confidence` from the scan step when available so `plant.name` / `plant.confidence` match identification results.

## Django wiring (`Backend/`)

Routes live in [`Backend/core/agrosense_views.py`](../Backend/core/agrosense_views.py) and [`Backend/core/urls.py`](../Backend/core/urls.py):

- **`POST /api/scan/`** — multipart `image` → `identify_plant` → `{"candidates": [...]}`.
- **`POST /api/confirm/`** — `image`, `plant_name`, `language`; optional `scientific_name`, `plant_confidence` → `compose_confirm`.

[`Backend/agri_backend/settings.py`](../Backend/agri_backend/settings.py) adds the repo root to `sys.path`, syncs env vars for `integration`, enables **CORS** for the Vite app (default `http://localhost:5173` / `127.0.0.1:5173`, or set `CORS_ALLOWED_ORIGINS`), and uses DRF **AllowAny** for the SPA.

Raw Kindwise proxies (`/identify-plant/`, `/assess-plant-health/`, `/identify-crop/`) are unchanged.

## Manual tests

From repo root, with `.env` populated:

```bash
python -m integration.smoke_tests identify path/to/plant.jpg
python -m integration.smoke_tests health path/to/plant.jpg
python -m integration.smoke_tests claude
python -m integration.smoke_tests translate --lang zu
python -m integration.smoke_tests confirm path/to/plant.jpg Tomato zu
```

## Locale file generation

Regenerate `agrofrontend/src/locales/{zu,xh,swh,sot,afr}.json` from `en.json`:

```bash
python integration/scripts/generate_locales.py
```

Use `--dry-run` to rewrite files with English text (parity check only). Use `--delay` to throttle API calls.

## Khaya language map

Defined in `integration/khaya_translate.py` as `FRONTEND_TO_KHAYA_TARGET`. If a locale returns HTTP 422, confirm the code against current Lelapa documentation and adjust the map.
