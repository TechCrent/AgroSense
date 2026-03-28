"""AgroSense third-party integration (Plant.id, Claude, Khaya)."""

from .services import (
    ConfirmResult,
    DiagnosisDict,
    HealthResult,
    PlantCandidate,
    assess_health,
    build_claude_prompt,
    compose_confirm,
    get_diagnosis,
    identify_plant,
    translate_diagnosis,
)

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
