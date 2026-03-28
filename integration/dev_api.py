"""
Minimal HTTP API for frontend development without the Django project.

Same routes and payloads as ``Backend/core/views.py`` so ``agrofrontend`` can use
real Plant.id / Claude / Khaya while Django is unfinished.

Run from repository root::

    pip install -r integration/requirements.txt
    python -m uvicorn integration.dev_api:app --reload --host 127.0.0.1 --port 8787

With Vite proxy (default in ``agrofrontend/vite.config.js``), set in ``agrofrontend/.env``::

    # VITE_API_BASE_URL=   (empty — browser calls Vite, which proxies /api → 8787)

Or point the SPA directly at this server::

    VITE_API_BASE_URL=http://127.0.0.1:8787
"""

from __future__ import annotations

import base64
import logging
import traceback

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

app = FastAPI(title="AgroSense dev API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _upload_to_b64(upload: UploadFile) -> str:
    raw = upload.file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image file.")
    return base64.b64encode(raw).decode("ascii")


@app.post("/api/scan/")
def api_scan(image: UploadFile = File(...)):
    from integration.services import identify_plant

    try:
        b64 = _upload_to_b64(image)
        candidates = identify_plant(b64)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=502, detail="Plant identification failed."
        ) from None

    return {"candidates": candidates}


@app.post("/api/confirm/")
def api_confirm(
    image: UploadFile = File(...),
    plant_name: str = Form(...),
    language: str = Form("en"),
    scientific_name: str | None = Form(None),
    plant_confidence: str | None = Form(None),
):
    from integration.services import compose_confirm

    pc: float | None
    if plant_confidence in (None, ""):
        pc = None
    else:
        try:
            pc = float(plant_confidence)
        except ValueError as e:
            raise HTTPException(
                status_code=400, detail="Invalid plant_confidence."
            ) from e

    try:
        b64 = _upload_to_b64(image)
        payload = compose_confirm(
            b64,
            plant_name,
            language,
            scientific_name=scientific_name or None,
            plant_confidence=pc,
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=502, detail="Diagnosis pipeline failed."
        ) from None

    return payload
