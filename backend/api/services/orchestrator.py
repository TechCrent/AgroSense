from __future__ import annotations

from api.schemas.responses import ConfirmPayload, ScanPayload
from api.services.diagnosis import get_diagnosis
from api.services.plant_id import assess_plant_health, identify_plant_candidates
from api.services.translation import translate_if_needed

API_VERSION = "v1"


def scan_pipeline(images_b64: list[str]) -> ScanPayload:
    candidates = identify_plant_candidates(images_b64)
    return {"candidates": candidates, "version": API_VERSION}


def confirm_pipeline(
    images_b64: list[str],
    plant_name: str,
    language: str = "en",
    *,
    scientific_name: str | None = None,
    plant_confidence: float | None = None,
) -> ConfirmPayload:
    health = assess_plant_health(images_b64)
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
