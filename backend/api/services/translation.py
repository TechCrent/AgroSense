from __future__ import annotations

from api.clients.khaya_client import translate_diagnosis


def translate_if_needed(diagnosis: dict, language: str) -> dict:
    if not language or language == "en":
        out = dict(diagnosis)
        out["language"] = "en"
        return out
    return translate_diagnosis(
        {
            "summary": str(diagnosis["summary"]),
            "steps": list(diagnosis["steps"]),
            "language": str(diagnosis.get("language", "en")),
        },
        language,
    )
