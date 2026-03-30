from __future__ import annotations

from typing import TypedDict


class PlantCandidate(TypedDict):
    name: str
    common_name: str
    confidence: float
    image_url: str


class HealthPayload(TypedDict):
    status: str
    disease_name: str | None
    disease_type: str | None
    confidence: float | None


class DiagnosisPayload(TypedDict):
    summary: str
    steps: list[str]
    language: str


class ScanPayload(TypedDict):
    candidates: list[PlantCandidate]
    version: str


class ConfirmPayload(TypedDict):
    plant: dict
    health: HealthPayload
    diagnosis: DiagnosisPayload
    version: str
