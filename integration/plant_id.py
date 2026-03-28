"""Plant.id API v3: identification and health assessment."""

from __future__ import annotations

import base64
import re
from typing import Any, TypedDict

import httpx

from .config import (
    PLANT_ID_HEALTH_URL,
    PLANT_ID_IDENTIFICATION_URL,
    get_plant_id_key,
)


class PlantCandidate(TypedDict, total=False):
    name: str
    common_name: str
    confidence: float
    image_url: str


class HealthResult(TypedDict, total=False):
    status: str
    disease_name: str | None
    disease_type: str | None
    confidence: float | None


_DATA_URL_RE = re.compile(r"^data:image/[^;]+;base64,(.+)$", re.I)


def normalize_base64(image_base64: str) -> str:
    """Strip data-URL prefix if present; return raw base64 payload."""
    s = image_base64.strip()
    m = _DATA_URL_RE.match(s)
    if m:
        return m.group(1).strip()
    return s


def _plant_id_headers() -> dict[str, str]:
    return {"Api-Key": get_plant_id_key()}


def _first_similar_url(suggestion: dict[str, Any]) -> str | None:
    sims = suggestion.get("similar_images") or []
    if not sims:
        return None
    first = sims[0]
    if isinstance(first, dict):
        return first.get("url") or first.get("url_small")
    return None


def _first_common_name(details: dict[str, Any]) -> str:
    names = details.get("common_names")
    if isinstance(names, list) and names:
        return str(names[0])
    return str(details.get("local_name") or "")


def identify_plant(image_base64: str) -> list[PlantCandidate]:
    """
    Call Plant.id identification; return candidates for the AgroSense frontend.

    Each item: name (scientific), common_name, confidence (0–1), image_url (HTTPS or placeholder).
    """
    b64 = normalize_base64(image_base64)
    # Validate base64
    base64.b64decode(b64, validate=True)

    params = {"details": "url,common_names,similar_images"}
    body = {"images": [b64]}

    with httpx.Client(timeout=120.0) as client:
        r = client.post(
            PLANT_ID_IDENTIFICATION_URL,
            params=params,
            headers=_plant_id_headers(),
            json=body,
        )
        r.raise_for_status()
        data = r.json()

    result = data.get("result") or {}
    if not (result.get("is_plant") or {}).get("binary", True):
        return []

    suggestions = (result.get("classification") or {}).get("suggestions") or []
    out: list[PlantCandidate] = []
    for s in suggestions:
        if not isinstance(s, dict):
            continue
        details = s.get("details") or {}
        if not isinstance(details, dict):
            details = {}
        name = str(s.get("name") or "")
        prob = float(s.get("probability") or 0.0)
        common = _first_common_name(details) or name.replace("_", " ")
        img = _first_similar_url(s)
        if not img:
            wiki = details.get("url")
            if isinstance(wiki, str) and wiki.startswith("http"):
                img = wiki
            elif isinstance(details.get("image"), dict):
                img = details["image"].get("value")
        if not img:
            img = "https://placehold.co/80x80/2D6A4F/ffffff/png?text=Plant"

        out.append(
            {
                "name": name,
                "common_name": common or name,
                "confidence": prob,
                "image_url": img,
            }
        )
    return out


def assess_health(image_base64: str) -> HealthResult:
    """
    Call Plant.id health assessment; map to frontend health object.

    Status rules:
    - ``healthy``: API reports ``is_healthy.binary`` true.
    - Otherwise: ``infected`` if top disease suggestion probability >= 0.25;
      else ``at_risk``.
    - ``disease_name`` / ``disease_type`` / ``confidence``: from the top disease suggestion
      when status is not ``healthy``; null when healthy.
    """
    b64 = normalize_base64(image_base64)
    base64.b64decode(b64, validate=True)

    params = {"details": "description,treatment"}
    body = {"images": [b64]}

    with httpx.Client(timeout=120.0) as client:
        r = client.post(
            PLANT_ID_HEALTH_URL,
            params=params,
            headers=_plant_id_headers(),
            json=body,
        )
        r.raise_for_status()
        data = r.json()

    result = data.get("result") or {}
    healthy_block = result.get("is_healthy") or {}
    is_healthy = bool(healthy_block.get("binary"))
    healthy_prob = float(healthy_block.get("probability") or 0.0)

    if is_healthy:
        return {
            "status": "healthy",
            "disease_name": None,
            "disease_type": None,
            "confidence": healthy_prob,
        }

    disease_block = result.get("disease") or {}
    suggestions = disease_block.get("suggestions") or []
    ranked: list[dict[str, Any]] = [s for s in suggestions if isinstance(s, dict)]
    ranked.sort(key=lambda x: float(x.get("probability") or 0.0), reverse=True)

    top = ranked[0] if ranked else None
    top_prob = float(top.get("probability") or 0.0) if top else 0.0
    status = "infected" if top_prob >= 0.25 else "at_risk"

    disease_name: str | None = None
    disease_type: str | None = None
    if top:
        det = top.get("details") or {}
        if isinstance(det, dict):
            disease_name = str(det.get("local_name") or top.get("name") or "")
            cls = det.get("classification")
            if isinstance(cls, list) and cls:
                disease_type = str(cls[0])
            else:
                disease_type = str(top.get("source") or "unknown")

    return {
        "status": status,
        "disease_name": disease_name,
        "disease_type": disease_type,
        "confidence": top_prob if top else healthy_prob,
    }
