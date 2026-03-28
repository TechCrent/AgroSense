"""Claude: prompt construction and structured diagnosis JSON."""

from __future__ import annotations

import json
from typing import Any, TypedDict

from .config import ANTHROPIC_MODEL, get_anthropic_key
from .plant_id import HealthResult


class DiagnosisDict(TypedDict):
    summary: str
    steps: list[str]
    language: str


def _strip_json_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        nl = t.find("\n")
        if nl != -1:
            t = t[nl + 1 :]
        if "```" in t:
            t = t[: t.rfind("```")]
    return t.strip()


def build_claude_prompt(plant_name: str, health_result: HealthResult) -> str:
    """
    Build user prompt text from confirmed plant name and Plant.id health summary.

    ``plant_name`` should be the common name the user selected (matches frontend).
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


def _parse_diagnosis_json(text: str) -> DiagnosisDict:
    cleaned = _strip_json_fences(text)
    data: Any = json.loads(cleaned)
    if not isinstance(data, dict):
        raise ValueError("Claude output is not a JSON object")
    summary = data.get("summary")
    steps = data.get("steps")
    if not isinstance(summary, str) or not summary.strip():
        raise ValueError("Claude JSON missing non-empty string 'summary'")
    if not isinstance(steps, list) or not all(isinstance(s, str) for s in steps):
        raise ValueError("Claude JSON missing list of string 'steps'")
    return {
        "summary": summary.strip(),
        "steps": [s.strip() for s in steps if s.strip()],
        "language": str(data.get("language") or "en"),
    }


def get_diagnosis(prompt: str, *, output_language: str = "en") -> DiagnosisDict:
    """
    Call Claude with the given user prompt; return ``summary``, ``steps``, ``language``.

    The model is instructed to emit JSON only; output is validated and normalized.
    """
    from anthropic import Anthropic

    try:
        client = Anthropic(api_key=get_anthropic_key())
        system = (
            "You are an agricultural advisory assistant for AgroSense. "
            "Output must be valid JSON only, with keys summary (string) and steps (array of strings). "
            "Do not include markdown, code fences, or commentary outside the JSON object."
        )
        msg = client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=2048,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        extra = getattr(e, "message", None) or str(e)
        raise ValueError(
            f"Claude API failed ({type(e).__name__}): {extra}. "
            f"Check CLAUDE_API_KEY and ANTHROPIC_MODEL={ANTHROPIC_MODEL!r}."
        ) from e

    if not msg.content or msg.content[0].type != "text":
        raise ValueError("Claude returned an unexpected response shape (no text).")
    raw = msg.content[0].text
    try:
        diagnosis = _parse_diagnosis_json(raw)
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"Claude output was not valid diagnosis JSON: {e}") from e
    diagnosis["language"] = output_language
    return diagnosis
