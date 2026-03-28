"""Gemini (Generative Language API): Kindwise crop JSON -> treatment, prevention, monitoring."""

from __future__ import annotations

import json
import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GEMINI_MODELS_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
REQUEST_TIMEOUT = 120

SYSTEM_INSTRUCTION = """You are an expert agronomist. The user message contains JSON from a Kindwise crop health API (detection only—no treatment text).
You must produce practical, safe, region-agnostic advice.

Output Markdown with exactly these sections (use ## headings):

## Summary
## Treatment & what to do now
## Prevention
## Monitoring

Anchor recommendations to the crop and disease/condition named in the JSON when present. Do not invent brand names; refer to product classes (e.g. fungicide, horticultural oil) where appropriate."""


def _normalize_api_key(raw: str) -> str:
    s = (raw or '').strip()
    if len(s) >= 2 and s[0] == s[-1] and s[0] in '"\'':
        s = s[1:-1].strip()
    return s


def _top_suggestion(suggestions: list[dict[str, Any]] | None) -> dict[str, Any] | None:
    if not suggestions:
        return None
    return max(suggestions, key=lambda s: float(s.get('probability') or 0))


def _detection_focus_block(identification: dict[str, Any]) -> str:
    result = identification.get('result')
    if not isinstance(result, dict):
        return ''
    disease_block = result.get('disease') or {}
    crop_block = result.get('crop') or {}
    ds = _top_suggestion(
        disease_block.get('suggestions') if isinstance(disease_block, dict) else None
    )
    cs = _top_suggestion(
        crop_block.get('suggestions') if isinstance(crop_block, dict) else None
    )
    lines: list[str] = []
    if cs:
        lines.append(
            f"- Crop (top): {cs.get('name')} (p={float(cs.get('probability') or 0):.2f})"
        )
    if ds:
        lines.append(
            f"- Disease/condition (top): {ds.get('name')} (p={float(ds.get('probability') or 0):.2f})"
        )
    if not lines:
        return ''
    return 'Focus:\n' + '\n'.join(lines) + '\n\n'


def _build_user_message(identification: dict[str, Any]) -> str:
    focus = _detection_focus_block(identification)
    payload = json.dumps(identification, indent=2, ensure_ascii=False)
    return f"""{focus}Kindwise JSON (ground truth for what was detected):

```json
{payload}
```

Write the Markdown sections now."""


def _text_from_candidate_obj(obj: dict[str, Any]) -> str:
    parts: list[str] = []
    for c in obj.get('candidates') or []:
        for p in (c.get('content') or {}).get('parts') or []:
            if isinstance(p, dict) and p.get('text'):
                parts.append(str(p['text']))
    return ''.join(parts).strip()


def _extract_text(data: dict[str, Any]) -> str:
    out = _text_from_candidate_obj(data)
    if not out:
        raise RuntimeError(f'Gemini returned no text: {data!r}')
    return out


def _parse_stream_body(raw: bytes) -> str:
    """Handle streamGenerateContent: SSE lines, NDJSON, single JSON object, or JSON array."""
    text = raw.decode('utf-8', errors='replace').strip()
    if not text:
        raise RuntimeError('Gemini stream: empty body')

    if text.startswith('{'):
        try:
            return _extract_text(json.loads(text))
        except (json.JSONDecodeError, RuntimeError):
            pass

    if text.startswith('['):
        try:
            arr = json.loads(text)
            if isinstance(arr, list):
                chunks: list[str] = []
                for item in arr:
                    if isinstance(item, dict):
                        t = _text_from_candidate_obj(item)
                        if t:
                            chunks.append(t)
                merged = ''.join(chunks).strip()
                if merged:
                    return merged
        except json.JSONDecodeError:
            pass

    pieces: list[str] = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith('data:'):
            line = line[5:].strip()
        if line == '[DONE]':
            break
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            t = _text_from_candidate_obj(obj)
            if t:
                pieces.append(t)
    out = ''.join(pieces).strip()
    if out:
        return out

    raise RuntimeError('Gemini stream: could not parse response')


def _build_request_body(
    user_text: str,
    *,
    include_tools: bool,
    include_thinking: bool,
) -> dict[str, Any]:
    body: dict[str, Any] = {
        'systemInstruction': {'parts': [{'text': SYSTEM_INSTRUCTION}]},
        'contents': [
            {
                'role': 'user',
                'parts': [{'text': user_text}],
            },
        ],
        'generationConfig': {
            'temperature': 0.35,
            'maxOutputTokens': 8192,
        },
    }
    if include_thinking:
        body['generationConfig']['thinkingConfig'] = {
            'thinkingLevel': settings.GEMINI_THINKING_LEVEL,
        }
    if include_tools and settings.GEMINI_USE_GOOGLE_SEARCH:
        body['tools'] = [{'googleSearch': {}}]
    return body


def _post_gemini_once(
    api_method: str,
    body: dict[str, Any],
    api_key: str,
) -> str:
    url = f'{GEMINI_MODELS_BASE}/{settings.GEMINI_MODEL}:{api_method}?key={api_key}'
    headers = {'Content-Type': 'application/json'}

    if api_method == 'streamGenerateContent':
        r = requests.post(
            url,
            json=body,
            headers=headers,
            timeout=REQUEST_TIMEOUT,
            stream=True,
        )
        if r.status_code >= 400:
            try:
                detail = r.json()
            except ValueError:
                detail = r.text or r.reason
            raise RuntimeError(f'Gemini API error ({r.status_code}): {detail}')
        return _parse_stream_body(r.content)

    r = requests.post(url, json=body, headers=headers, timeout=REQUEST_TIMEOUT)
    if r.status_code >= 400:
        try:
            detail = r.json()
        except ValueError:
            detail = r.text or r.reason
        raise RuntimeError(f'Gemini API error ({r.status_code}): {detail}')
    return _extract_text(r.json())


def crop_disease_solutions(identification: dict[str, Any]) -> str:
    api_key = _normalize_api_key(settings.GEMINI_API_KEY)
    if not api_key:
        raise ValueError('GEMINI_API_KEY is not configured')

    user_text = _build_user_message(identification)
    method = settings.GEMINI_API_METHOD

    configs: list[tuple[bool, bool]] = [
        (settings.GEMINI_USE_GOOGLE_SEARCH, True),
        (False, True),
        (settings.GEMINI_USE_GOOGLE_SEARCH, False),
        (False, False),
    ]

    last_err: RuntimeError | None = None
    for use_tools, use_thinking in configs:
        body = _build_request_body(
            user_text,
            include_tools=use_tools,
            include_thinking=use_thinking,
        )
        try:
            return _post_gemini_once(method, body, api_key)
        except RuntimeError as e:
            last_err = e
            logger.debug(
                'Gemini attempt failed (tools=%s thinking=%s): %s',
                use_tools,
                use_thinking,
                e,
            )
            continue

    if last_err:
        if method == 'streamGenerateContent':
            logger.warning('Gemini: retrying with generateContent after stream failure')
            for use_tools, use_thinking in configs:
                body = _build_request_body(
                    user_text,
                    include_tools=use_tools,
                    include_thinking=use_thinking,
                )
                try:
                    return _post_gemini_once('generateContent', body, api_key)
                except RuntimeError as e:
                    last_err = e
                    continue
        raise last_err
    raise RuntimeError('Gemini: no attempts made')
