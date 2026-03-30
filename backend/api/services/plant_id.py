from __future__ import annotations

from api.clients.plant_id_client import PlantIdClient


def identify_plant_candidates(images_b64: list[str] | str) -> list[dict]:
    return PlantIdClient().identify_plant(images_b64)


def assess_plant_health(images_b64: list[str] | str) -> dict:
    return PlantIdClient().assess_health(images_b64)
