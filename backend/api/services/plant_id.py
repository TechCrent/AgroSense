from __future__ import annotations

from api.clients.plant_id_client import PlantIdClient


def identify_plant_candidates(image_b64: str) -> list[dict]:
    return PlantIdClient().identify_plant(image_b64)


def assess_plant_health(image_b64: str) -> dict:
    return PlantIdClient().assess_health(image_b64)
