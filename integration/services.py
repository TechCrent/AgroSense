"""
AgroSense integration services for backend wiring.

Import from here in Django views: identify_plant, assess_health, build_claude_prompt,
get_diagnosis, translate_diagnosis, compose_confirm.
"""

from __future__ import annotations

from typing import Any, TypedDict

from .claude_diagnosis import DiagnosisDict, build_claude_prompt, get_diagnosis
from .khaya_translate import translate_diagnosis
from .plant_id import HealthResult, PlantCandidate, assess_health, identify_plant


class ConfirmResult(TypedDict, total=False):
    plant: dict[str, Any]
    health: HealthResult
    diagnosis: DiagnosisDict


__all__ = [
    "identify_plant",
    "assess_health",
    "build_claude_prompt",
    "get_diagnosis",
    "translate_diagnosis",
    "compose_confirm",
    "PlantCandidate",
    "HealthResult",
    "DiagnosisDict",
    "ConfirmResult",
]


def compose_confirm(
    image_base64: str,
    plant_common_name: str,
    frontend_lang: str,
    *,
    scientific_name: str | None = None,
    plant_confidence: float | None = None,
) -> ConfirmResult:
    """
    Full confirm pipeline: health assessment → Claude diagnosis → Khaya (if not English).

    ``plant_common_name`` matches the frontend ``plant_name`` form field.
    ``scientific_name`` and ``plant_confidence`` are optional metadata from the scan step.
    """
    health = assess_health(image_base64)
    prompt = build_claude_prompt(plant_common_name, health)
    diagnosis = get_diagnosis(prompt, output_language="en")
    if frontend_lang and frontend_lang != "en":
        diagnosis = translate_diagnosis(diagnosis, frontend_lang)

    plant: dict[str, Any] = {
        "name": scientific_name or plant_common_name,
        "common_name": plant_common_name,
        "confidence": float(plant_confidence) if plant_confidence is not None else None,
    }

    return {
        "plant": plant,
        "health": health,
        "diagnosis": diagnosis,
    }
