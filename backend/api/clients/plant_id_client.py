from __future__ import annotations

import base64
import os
import re
from typing import Any
from urllib.parse import urlparse

import httpx
from django.conf import settings

from .http import RetryPolicy, UpstreamServiceError

_DATA_URL_RE = re.compile(r"^data:image/[^;]+;base64,(.+)$", re.I)


def _normalize_base64(value: str) -> str:
    s = value.strip()
    m = _DATA_URL_RE.match(s)
    if m:
        return m.group(1).strip()
    return s


def _validate_base64(value: str) -> str:
    b64 = _normalize_base64(value)
    try:
        base64.b64decode(b64, validate=True)
    except Exception as exc:  # pragma: no cover - defensive
        raise UpstreamServiceError("Invalid image payload.", status_code=400) from exc
    return b64


def _validate_images(images_b64: str | list[str]) -> list[str]:
    if isinstance(images_b64, str):
        items = [images_b64]
    elif isinstance(images_b64, (list, tuple)):
        items = list(images_b64)
    else:  # pragma: no cover - defensive
        items = [str(images_b64)]

    out: list[str] = []
    for item in items:
        if item is None:
            continue
        out.append(_validate_base64(str(item)))

    if not out:
        raise UpstreamServiceError("No valid images provided.", status_code=400)
    return out


def _plant_api_key() -> str:
    """
    Match legacy ``integration.config.get_plant_id_key()`` resolution.

    If ``PLANT_ID_API_KEY`` is already set in the environment, Django's
    ``_sync_integration_env`` does not overwrite it — but that key is what the
    old integration uses. We must prefer it over ``PLANT_DETECTION_API_KEY``
    from ``.env`` when both differ (otherwise you can see 'no credits' for
    one key while the old backend still works).
    """
    raw = getattr(settings, "PLANT_DETECTION_API_KEY", None)
    key = str(raw or "").strip()
    if not key:
        key = os.environ.get("PLANT_ID_API_KEY", "").strip()
    if not key:
        raise UpstreamServiceError(
            "Plant.id API key missing: set PLANT_DETECTION_API_KEY in backend/.env "
            "(synced to PLANT_ID_API_KEY) or set PLANT_ID_API_KEY in the environment.",
            status_code=503,
        )
    return key


class PlantIdClient:
    def __init__(self, *, timeout: float = 120.0, retry_policy: RetryPolicy | None = None):
        self.timeout = timeout
        self.retry_policy = retry_policy or RetryPolicy(attempts=1)

    def _post_json(
        self,
        path: str,
        body: dict[str, Any],
        *,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = f"{settings.PLANT_API_URL.rstrip('/')}/{path.lstrip('/')}"
        headers = {"Api-Key": _plant_api_key()}
        last_error: Exception | None = None

        for _ in range(self.retry_policy.attempts):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, json=body, params=params, headers=headers)
                    response.raise_for_status()
                    return response.json()
            except httpx.HTTPStatusError as exc:
                detail = ""
                try:
                    parsed = exc.response.json()
                    if isinstance(parsed, dict):
                        detail = str(
                            parsed.get("detail")
                            or parsed.get("message")
                            or parsed.get("error")
                            or parsed.get("title")
                            or ""
                        )
                except Exception:
                    detail = ""
                msg = detail or (exc.response.text or "").strip() or "Plant API failed."
                code = 503 if exc.response.status_code == 429 else 502
                raise UpstreamServiceError(msg[:400], status_code=code) from exc
            except httpx.RequestError as exc:
                last_error = exc
                continue

        base = (settings.PLANT_API_URL or "").strip().strip('"').strip("'")
        host = urlparse(base).netloc or base or "(not set)"
        raise UpstreamServiceError(
            f"Plant API unreachable (host={host!r}): {last_error}. "
            "Check internet and DNS (Windows 11001 = name not resolved), VPN/firewall, "
            "and that backend/.env PLANT_API_URL is exactly https://api.plant.id/v3 with no stray quotes. "
            "Local dev without changing adapter DNS: see docs/LOCAL_DEV_DNS_WINDOWS.md (hosts file).",
            status_code=503,
        )

    def identify_plant(self, images_b64: str | list[str]) -> list[dict[str, Any]]:
        payload: dict[str, Any] = {"images": _validate_images(images_b64)}
        data = self._post_json(
            "identification",
            payload,
        )
        result = data.get("result") or {}
        if not (result.get("is_plant") or {}).get("binary", True):
            return []

        suggestions = (result.get("classification") or {}).get("suggestions") or []
        out: list[dict[str, Any]] = []
        for suggestion in suggestions:
            if not isinstance(suggestion, dict):
                continue
            details = suggestion.get("details") or {}
            if not isinstance(details, dict):
                details = {}
            common_names = details.get("common_names")
            if isinstance(common_names, list) and common_names:
                common_name = str(common_names[0])
            else:
                common_name = str(details.get("local_name") or suggestion.get("name") or "")

            image_url = None
            similar_images_result = suggestion.get("similar_images") or []
            if similar_images_result and isinstance(similar_images_result[0], dict):
                image_url = similar_images_result[0].get("url") or similar_images_result[0].get(
                    "url_small"
                )
            if not image_url:
                wiki = details.get("url")
                if isinstance(wiki, str) and wiki.startswith("http"):
                    image_url = wiki
                elif isinstance(details.get("image"), dict):
                    image_url = details["image"].get("value")
            image_url = image_url or "https://placehold.co/80x80/2D6A4F/ffffff/png?text=Plant"

            out.append(
                {
                    "name": str(suggestion.get("name") or ""),
                    "common_name": common_name,
                    "confidence": float(suggestion.get("probability") or 0.0),
                    "image_url": str(image_url),
                }
            )
        return out

    def assess_health(self, images_b64: str | list[str]) -> dict[str, Any]:
        payload: dict[str, Any] = {"images": _validate_images(images_b64)}
        data = self._post_json(
            "health_assessment",
            payload,
            params={"details": "description,treatment"},
        )
        result = data.get("result") or {}
        healthy = result.get("is_healthy") or {}
        if bool(healthy.get("binary")):
            return {
                "status": "healthy",
                "disease_name": None,
                "disease_type": None,
                "confidence": float(healthy.get("probability") or 0.0),
            }

        suggestions = (result.get("disease") or {}).get("suggestions") or []
        ranked = [s for s in suggestions if isinstance(s, dict)]
        ranked.sort(key=lambda x: float(x.get("probability") or 0.0), reverse=True)
        top = ranked[0] if ranked else {}
        details = top.get("details") or {}
        if not isinstance(details, dict):
            details = {}
        classification = details.get("classification")
        if isinstance(classification, list) and classification:
            disease_type = str(classification[0])
        else:
            disease_type = str(top.get("source") or "unknown")
        confidence = float(top.get("probability") or float(healthy.get("probability") or 0.0))
        return {
            "status": "infected" if confidence >= 0.25 else "at_risk",
            "disease_name": str(details.get("local_name") or top.get("name") or ""),
            "disease_type": disease_type,
            "confidence": confidence,
        }
