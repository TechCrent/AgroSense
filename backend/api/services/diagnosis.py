from __future__ import annotations

from api.clients.claude_client import ClaudeClient


def build_prompt(plant_name: str, health: dict) -> str:
    status = health.get("status", "unknown")
    disease = health.get("disease_name") or "Unknown"
    disease_type = health.get("disease_type") or "Unknown"
    confidence = health.get("confidence")
    return (
        f"Plant: {plant_name}\n"
        f"Health status: {status}\n"
        f"Disease: {disease}\n"
        f"Disease type: {disease_type}\n"
        f"Confidence: {confidence}\n\n"
        "Return strict JSON only as:\n"
        '{"summary":"<short explanation>","steps":["<step1>","<step2>"]}\n'
        "Use practical advice for smallholder farmers."
    )


def get_diagnosis(plant_name: str, health: dict) -> dict:
    """Always produce English JSON from Claude; Khaya translates when ``language`` is not ``en``."""
    prompt = build_prompt(plant_name, health)
    return ClaudeClient().diagnose(prompt, output_language="en")
