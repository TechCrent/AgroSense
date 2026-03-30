from __future__ import annotations

from typing import Any

from api.clients.claude_client import ClaudeClient


def build_claude_prompt(plant_name: str, health_result: dict[str, Any]) -> str:
    """
    Build user prompt from confirmed plant name and Plant.id health summary
    (same structure as legacy integration).
    """
    status = health_result.get("status") or "unknown"
    disease_name = health_result.get("disease_name")
    disease_type = health_result.get("disease_type")
    conf = health_result.get("confidence")

    health_lines = [
        f"Plant (user-confirmed common name): {plant_name}",
        f"Health status: {status}",
        f"Top disease or issue name (if any): {disease_name!r}",
        f"Issue category / type (if any): {disease_type!r}",
        f"Model confidence (0-1) for the above: {conf!r}",
    ]
    health_block = "\n".join(health_lines)

    if status == "healthy":
        return f"""{health_block}

The plant is reported as healthy. Give practical, region-agnostic guidance for a smallholder farmer.

Respond with ONLY valid JSON (no markdown) in this exact shape:
{{"summary": "<one short paragraph>", "steps": ["<step 1>", "<step 2>", "... up to 6 items"]}}

Requirements:
- summary: reassure and list common diseases/pests to watch for this crop and early warning signs.
- steps: concrete prevention and good cultural practices (watering, spacing, sanitation, rotation, scouting). Number 4–6 items.
- Use clear, non-alarmist language. Do not invent a specific disease the API did not suggest."""

    return f"""{health_block}

The plant may have a health issue. You are assisting a smallholder farmer. Use the issue name/type as the working hypothesis; if confidence is low, say so briefly in the summary.

Respond with ONLY valid JSON (no markdown) in this exact shape:
{{"summary": "<one short paragraph explaining the problem in plain language>", "steps": ["<step 1>", "<step 2>", "... up to 6 items"]}}

Requirements:
- summary: what the problem likely is, what causes it, and environmental factors — stay practical.
- steps: ordered treatment and containment (remove infected tissue, fungicide/insecticide only if appropriate, watering, isolation, rotation). Number 4–6 items.
- Do not claim certainty beyond the confidence above. If status is at_risk, focus on monitoring and preventive steps."""


def get_diagnosis(plant_name: str, health: dict[str, Any]) -> dict:
    """English diagnosis JSON from Claude; Khaya translates when the request language is not ``en``."""
    prompt = build_claude_prompt(plant_name, health)
    return ClaudeClient().diagnose(prompt, output_language="en")
