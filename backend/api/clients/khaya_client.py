"""Khaya / Lelapa Vulavula: diagnosis translation (chunked requests)."""

from __future__ import annotations

import re
import time
from typing import Final, TypedDict

import httpx
from django.conf import settings

from .http import UpstreamServiceError

# Frontend locale codes (useLocale.js) -> Lelapa target_lang codes.
FRONTEND_TO_KHAYA_TARGET: Final[dict[str, str]] = {
    "zu": "zul_Latn",
    "xh": "xho_Latn",
    "swh": "swa_Latn",
    "sot": "sot_Latn",
    "afr": "afr_Latn",
}

SOURCE_LANG_EN: Final[str] = "eng_Latn"
MAX_WORDS_PER_CHUNK: Final[int] = 100

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")


class DiagnosisDict(TypedDict):
    summary: str
    steps: list[str]
    language: str


def chunk_text_by_words(text: str, max_words: int = MAX_WORDS_PER_CHUNK) -> list[str]:
    text = text.strip()
    if not text:
        return []

    sentences = [s.strip() for s in _SENTENCE_SPLIT_RE.split(text) if s.strip()]
    if len(sentences) <= 1 and text not in sentences:
        sentences = [text]

    chunks: list[str] = []
    current: list[str] = []
    current_words = 0

    def flush() -> None:
        nonlocal current, current_words
        if current:
            chunks.append(" ".join(current).strip())
            current = []
            current_words = 0

    for sent in sentences:
        words = sent.split()
        if not words:
            continue
        if len(words) > max_words:
            flush()
            for i in range(0, len(words), max_words):
                part = " ".join(words[i : i + max_words])
                if part:
                    chunks.append(part)
            continue

        wcount = len(words)
        if current_words + wcount <= max_words:
            current.append(sent)
            current_words += wcount
        else:
            flush()
            current = [sent]
            current_words = wcount

    flush()
    return chunks


def _translate_chunk(
    text: str,
    *,
    target_lang: str,
    source_lang: str = SOURCE_LANG_EN,
    session: httpx.Client | None = None,
) -> str:
    token = getattr(settings, "KHAYA_API_TOKEN", "") or ""
    token = str(token).strip()
    if not token:
        raise UpstreamServiceError("KHAYA_API_TOKEN is not set", status_code=503)

    url = getattr(
        settings,
        "KHAYA_TRANSLATE_URL",
        "https://api.lelapa.ai/v1/translate/process",
    )
    headers = {
        "Content-Type": "application/json",
        "X-CLIENT-TOKEN": token,
    }
    payload = {
        "input_text": text,
        "source_lang": source_lang,
        "target_lang": target_lang,
    }
    own_client = session is None
    client = session or httpx.Client(timeout=60.0)
    try:
        r = client.post(str(url), headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
    finally:
        if own_client:
            client.close()

    translations = data.get("translation")
    if not isinstance(translations, list) or not translations:
        raise UpstreamServiceError("Khaya response missing translation array", status_code=502)
    first = translations[0]
    if not isinstance(first, dict) or "translated_text" not in first:
        raise UpstreamServiceError("Khaya response missing translated_text", status_code=502)
    return str(first["translated_text"])


def translate_text(text: str, target_lang: str, *, delay_s: float = 0.15) -> str:
    if target_lang == "en" or not text.strip():
        return text

    khaya_target = FRONTEND_TO_KHAYA_TARGET.get(target_lang)
    if not khaya_target:
        raise ValueError(f"Unsupported frontend language code for Khaya: {target_lang!r}")

    parts = chunk_text_by_words(text)
    if not parts:
        return text

    out: list[str] = []
    with httpx.Client(timeout=60.0) as client:
        for i, chunk in enumerate(parts):
            if i > 0 and delay_s > 0:
                time.sleep(delay_s)
            out.append(_translate_chunk(chunk, target_lang=khaya_target, session=client))
    return " ".join(out).strip()


def translate_diagnosis(diagnosis: DiagnosisDict, target_lang: str) -> DiagnosisDict:
    """
    Translate summary and steps; preserve structure.
    If Khaya is not configured or locale is unsupported, return English copy with language \"en\".
    """
    if target_lang == "en":
        return {
            "summary": diagnosis["summary"],
            "steps": list(diagnosis["steps"]),
            "language": "en",
        }

    khaya_target = FRONTEND_TO_KHAYA_TARGET.get(target_lang)
    token = (getattr(settings, "KHAYA_API_TOKEN", "") or "").strip()
    if not token or not khaya_target:
        return {
            "summary": diagnosis["summary"],
            "steps": list(diagnosis["steps"]),
            "language": "en",
        }

    summary_t = translate_text(diagnosis["summary"], target_lang)
    steps_t = [translate_text(step, target_lang) for step in diagnosis["steps"]]

    return {
        "summary": summary_t,
        "steps": steps_t,
        "language": target_lang,
    }
