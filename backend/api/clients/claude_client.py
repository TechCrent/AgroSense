from __future__ import annotations

import json
from typing import Any

import httpx
from django.conf import settings

from .http import UpstreamServiceError


def _strip_json_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        nl = t.find("\n")
        if nl != -1:
            t = t[nl + 1 :]
        if "```" in t:
            t = t[: t.rfind("```")]
    return t.strip()


def _parse_diagnosis_json(text: str) -> dict[str, Any]:
    """
    Parse the first JSON object only. Models sometimes append commentary after the object,
    which makes json.loads() fail with 'Extra data'.
    """
    cleaned = _strip_json_fences(text).strip()
    start = cleaned.find("{")
    if start == -1:
        raise UpstreamServiceError(
            "Claude output has no JSON object (missing '{').",
            status_code=502,
        )
    decoder = json.JSONDecoder()
    try:
        data, _end = decoder.raw_decode(cleaned, start)
    except json.JSONDecodeError as exc:
        raise UpstreamServiceError(
            f"Claude output was not valid diagnosis JSON: {exc}",
            status_code=502,
        ) from exc
    if not isinstance(data, dict):
        raise UpstreamServiceError("Claude output is not a JSON object.", status_code=502)
    summary = data.get("summary")
    steps = data.get("steps")
    if not isinstance(summary, str) or not summary.strip():
        raise UpstreamServiceError(
            "Claude JSON missing non-empty string 'summary'.",
            status_code=502,
        )
    if not isinstance(steps, list) or not all(isinstance(s, str) for s in steps):
        raise UpstreamServiceError(
            "Claude JSON missing list of string 'steps'.",
            status_code=502,
        )
    return {
        "summary": summary.strip(),
        "steps": [s.strip() for s in steps if s.strip()],
        "language": str(data.get("language") or "en"),
    }


class ClaudeClient:
    def diagnose(self, prompt: str, *, output_language: str = "en") -> dict:
        # OpenRouter key takes precedence; CLAUDE_API_KEY is kept as fallback so existing
        # local setups don't break immediately.
        api_key = str(getattr(settings, "OPENROUTER_API_KEY", "") or "").strip()
        if not api_key:
            api_key = str(getattr(settings, "CLAUDE_API_KEY", "") or "").strip()
        if not api_key:
            raise UpstreamServiceError(
                "OPENROUTER_API_KEY is not set (fallback CLAUDE_API_KEY also empty).",
                status_code=503,
            )

        model = str(getattr(settings, "OPENROUTER_MODEL", "") or "").strip() or "openrouter/free"
        url = (
            str(getattr(settings, "OPENROUTER_API_URL", "") or "").strip()
            or "https://openrouter.ai/api/v1/chat/completions"
        )
        system = (
            "You are an agricultural advisory assistant for AgroSense. "
            "Output must be valid JSON only, with keys summary (string) and steps (array of strings). "
            "Do not include markdown, code fences, or commentary outside the JSON object."
        )
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 2048,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
        except Exception as exc:
            extra = getattr(exc, "message", None) or str(exc)
            raise UpstreamServiceError(
                f"OpenRouter API failed ({type(exc).__name__}): {extra}. "
                f"Check OPENROUTER_API_KEY and OPENROUTER_MODEL={model!r}.",
                status_code=503,
            ) from exc

        choices = data.get("choices")
        if not isinstance(choices, list) or not choices:
            raise UpstreamServiceError(
                "OpenRouter returned an unexpected response shape (no choices).",
                status_code=502,
            )
        first = choices[0] if isinstance(choices[0], dict) else {}
        message = first.get("message") if isinstance(first, dict) else {}
        content = message.get("content") if isinstance(message, dict) else None
        if isinstance(content, str):
            raw = content
        elif isinstance(content, list):
            parts: list[str] = []
            for part in content:
                if isinstance(part, dict):
                    text = part.get("text")
                    if isinstance(text, str):
                        parts.append(text)
            raw = "\n".join(parts).strip()
        else:
            raw = ""

        if not raw:
            raise UpstreamServiceError("OpenRouter returned empty text content.", status_code=502)
        diagnosis = _parse_diagnosis_json(raw)
        diagnosis["language"] = output_language
        return diagnosis
