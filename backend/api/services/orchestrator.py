from __future__ import annotations

import base64

from api.schemas.responses import ConfirmPayload, ScanPayload
from api.services.diagnosis import get_diagnosis
from api.services.plant_id import assess_plant_health, identify_plant_candidates
from api.services.translation import translate_if_needed

API_VERSION = "v1"


def _bytes_to_b64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("ascii")


def scan_pipeline(image_bytes: bytes) -> ScanPayload:
    candidates = identify_plant_candidates(_bytes_to_b64(image_bytes))
    return {"candidates": candidates, "version": API_VERSION}


def confirm_pipeline(
    image_bytes: bytes,
    plant_name: str,
    language: str = "en",
    *,
    scientific_name: str | None = None,
    plant_confidence: float | None = None,
) -> ConfirmPayload:
    health = assess_plant_health(_bytes_to_b64(image_bytes))
    diagnosis = get_diagnosis(plant_name, health)
    diagnosis = translate_if_needed(diagnosis, language or "en")
    plant = {
        "name": scientific_name or plant_name,
        "common_name": plant_name,
        "confidence": plant_confidence,
    }
    return {
        "plant": plant,
        "health": health,
        "diagnosis": diagnosis,
        "version": API_VERSION,
    }
