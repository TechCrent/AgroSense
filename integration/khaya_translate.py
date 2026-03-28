"""Khaya / Lelapa Vulavula: chunked translation (under 100 words per request)."""

from __future__ import annotations

import re
import time
from typing import Final

import httpx

from .claude_diagnosis import DiagnosisDict
from .config import KHAYA_TRANSLATE_URL, get_khaya_token

# Frontend locale codes from agrofrontend/src/hooks/useLocale.js → Lelapa target_lang codes.
# Adjust against https://docs.lelapa.ai if a locale fails at runtime.
FRONTEND_TO_KHAYA_TARGET: Final[dict[str, str]] = {
    "zu": "zul_Latn",
    "xh": "xho_Latn",
    "swh": "swa_Latn",
    "sot": "sot_Latn",
    "afr": "afr_Latn",
}

SOURCE_LANG_EN: Final[str] = "eng_Latn"

# Rough limit to stay under provider limits; sentences are merged up to this many words.
MAX_WORDS_PER_CHUNK: Final[int] = 100

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")


def chunk_text_by_words(text: str, max_words: int = MAX_WORDS_PER_CHUNK) -> list[str]:
    """
    Split ``text`` into chunks at sentence boundaries, each chunk at most ``max_words`` words.
    Long single sentences are hard-split on spaces to respect the word cap.
    """
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
    token = get_khaya_token()
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
        r = client.post(KHAYA_TRANSLATE_URL, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
    finally:
        if own_client:
            client.close()

    translations = data.get("translation")
    if not isinstance(translations, list) or not translations:
        raise ValueError("Khaya response missing translation array")
    first = translations[0]
    if not isinstance(first, dict) or "translated_text" not in first:
        raise ValueError("Khaya response missing translated_text")
    return str(first["translated_text"])


def translate_text(text: str, target_lang: str, *, delay_s: float = 0.15) -> str:
    """
    Translate plain text to ``target_lang`` (frontend code: zu, xh, …) using chunked calls.
    ``en`` returns the original text unchanged.
    """
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
    Translate ``summary`` and each ``steps`` entry; preserve list order and length.
    ``language`` on the result is set to ``target_lang``.
    """
    if target_lang == "en":
        return {
            "summary": diagnosis["summary"],
            "steps": list(diagnosis["steps"]),
            "language": "en",
        }

    summary_t = translate_text(diagnosis["summary"], target_lang)
    steps_t: list[str] = []
    for step in diagnosis["steps"]:
        steps_t.append(translate_text(step, target_lang))

    return {
        "summary": summary_t,
        "steps": steps_t,
        "language": target_lang,
    }
