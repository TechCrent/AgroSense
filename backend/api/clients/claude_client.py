from __future__ import annotations

import json

from django.conf import settings

from .http import UpstreamServiceError


def _strip_fences(text: str) -> str:
    payload = text.strip()
    if payload.startswith("```"):
        first_newline = payload.find("\n")
        if first_newline != -1:
            payload = payload[first_newline + 1 :]
        if "```" in payload:
            payload = payload[: payload.rfind("```")]
    return payload.strip()


class ClaudeClient:
    def diagnose(self, prompt: str, *, output_language: str = "en") -> dict:
        from anthropic import Anthropic

        try:
            client = Anthropic(api_key=settings.CLAUDE_API_KEY)
            response = client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=1600,
                system=(
                    "You are an agricultural assistant. "
                    "Return valid JSON only with keys summary (string) and steps (array of strings)."
                ),
                messages=[{"role": "user", "content": prompt}],
            )
        except Exception as exc:
            raise UpstreamServiceError(f"Claude API failed: {exc}", status_code=503) from exc

        if not response.content or response.content[0].type != "text":
            raise UpstreamServiceError("Claude returned no text output.", status_code=502)

        raw = _strip_fences(response.content[0].text)
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise UpstreamServiceError("Claude output was not valid JSON.", status_code=502) from exc

        summary = parsed.get("summary")
        steps = parsed.get("steps")
        if not isinstance(summary, str) or not isinstance(steps, list):
            raise UpstreamServiceError("Claude response missing required keys.", status_code=502)
        clean_steps = [str(step).strip() for step in steps if str(step).strip()]
        return {"summary": summary.strip(), "steps": clean_steps, "language": output_language}
