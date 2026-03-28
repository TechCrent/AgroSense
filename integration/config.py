"""Load integration settings from environment (optional python-dotenv)."""

from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None  # type: ignore[misc, assignment]

_ROOT = Path(__file__).resolve().parent


def _load_env() -> None:
    if not load_dotenv:
        return
    load_dotenv(_ROOT / ".env")
    load_dotenv(_ROOT.parent / ".env")


_load_env()


def get_plant_id_key() -> str:
    key = os.environ.get("PLANT_ID_API_KEY", "").strip()
    if not key:
        raise ValueError("PLANT_ID_API_KEY is not set")
    return key


def get_anthropic_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not key:
        raise ValueError("ANTHROPIC_API_KEY is not set")
    return key


def get_khaya_token() -> str:
    token = os.environ.get("KHAYA_API_TOKEN", "").strip()
    if not token:
        raise ValueError("KHAYA_API_TOKEN is not set")
    return token


PLANT_ID_IDENTIFICATION_URL = os.environ.get(
    "PLANT_ID_IDENTIFICATION_URL", "https://api.plant.id/v3/identification"
)
PLANT_ID_HEALTH_URL = os.environ.get(
    "PLANT_ID_HEALTH_URL", "https://api.plant.id/v3/health_assessment"
)
KHAYA_TRANSLATE_URL = os.environ.get(
    "KHAYA_TRANSLATE_URL", "https://api.lelapa.ai/v1/translate/process"
)
ANTHROPIC_MODEL = os.environ.get(
    "ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"
)
