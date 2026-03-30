"""Diagnosis translation client (Ghana NLP preferred; Khaya/Lelapa fallback)."""

from __future__ import annotations

import re
import time
from typing import Final, TypedDict

import httpx
from django.conf import settings

from .http import UpstreamServiceError

# Frontend locale codes -> Ghana NLP language codes (or close aliases).
# If a code is not found here, we pass the frontend code through as-is.
FRONTEND_TO_GHANA_TARGET: Final[dict[str, str]] = {
    "en": "en",
    "twi": "tw",
    "ga": "gaa",
    "ewe": "ee",
    "fante": "fat",
    "dagbani": "dag",
    "gurene": "gur",
    "yoruba": "yo",
    "kikuyu": "ki",
    "luo": "luo",
    "kimeru": "mer",
}

# Frontend locale codes -> Lelapa target_lang codes.
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


def _parse_ghana_translation(data: object) -> str:
    if isinstance(data, str):
        return data
    if not isinstance(data, dict):
        raise UpstreamServiceError("Ghana NLP response shape is invalid", status_code=502)
    for key in ("out", "translatedText", "translation", "translated_text", "text"):
        v = data.get(key)
        if isinstance(v, str) and v.strip():
            return v.strip()
    raise UpstreamServiceError("Ghana NLP response missing translated text", status_code=502)


def _translate_chunk_ghana(
    text: str,
    *,
    target_lang: str,
    session: httpx.Client | None = None,
) -> str:
    primary = str(getattr(settings, "PRIMARY_API_KEY", "") or "").strip()
    secondary = str(getattr(settings, "SECONDARY_API_KEY", "") or "").strip()
    key = primary or secondary
    if not key:
        raise UpstreamServiceError("PRIMARY_API_KEY / SECONDARY_API_KEY is not set", status_code=503)
    url = str(
        getattr(settings, "API_URL", "") or "https://translation-api.ghananlp.org/v1/translate"
    ).strip()
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/json",
    }
    # Ghana NLP expects: {"in": "<text>", "lang": "en-<target>"}.
    payload = {"in": text, "lang": f"en-{target_lang}"}
    own_client = session is None
    client = session or httpx.Client(timeout=60.0)
    try:
        r = client.post(str(url), headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
    finally:
        if own_client:
            client.close()

    return _parse_ghana_translation(data)


def _translate_chunk_khaya(
    text: str,
    *,
    target_lang: str,
    source_lang: str = SOURCE_LANG_EN,
    session: httpx.Client | None = None,
) -> str:
    token = str(getattr(settings, "KHAYA_API_TOKEN", "") or "").strip()
    if not token:
        raise UpstreamServiceError("KHAYA_API_TOKEN is not set", status_code=503)

    url = str(
        getattr(settings, "KHAYA_TRANSLATE_URL", "https://api.lelapa.ai/v1/translate/process")
    ).strip()
    headers = {"Content-Type": "application/json", "X-CLIENT-TOKEN": token}
    payload = {"input_text": text, "source_lang": source_lang, "target_lang": target_lang}
    own_client = session is None
    client = session or httpx.Client(timeout=60.0)
    try:
        r = client.post(url, headers=headers, json=payload)
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

    primary = str(getattr(settings, "PRIMARY_API_KEY", "") or "").strip()
    secondary = str(getattr(settings, "SECONDARY_API_KEY", "") or "").strip()
    use_ghana = bool(primary or secondary)

    if use_ghana:
        provider_target = FRONTEND_TO_GHANA_TARGET.get(target_lang, target_lang)
    else:
        provider_target = FRONTEND_TO_KHAYA_TARGET.get(target_lang)
        if not provider_target:
            raise ValueError(f"Unsupported frontend language code for Khaya: {target_lang!r}")

    parts = chunk_text_by_words(text)
    if not parts:
        return text

    out: list[str] = []
    with httpx.Client(timeout=60.0) as client:
        for i, chunk in enumerate(parts):
            if i > 0 and delay_s > 0:
                time.sleep(delay_s)
            if use_ghana:
                out.append(_translate_chunk_ghana(chunk, target_lang=provider_target, session=client))
            else:
                out.append(_translate_chunk_khaya(chunk, target_lang=provider_target, session=client))
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

    primary = str(getattr(settings, "PRIMARY_API_KEY", "") or "").strip()
    secondary = str(getattr(settings, "SECONDARY_API_KEY", "") or "").strip()
    khaya_token = str(getattr(settings, "KHAYA_API_TOKEN", "") or "").strip()
    has_ghana = bool(primary or secondary)
    has_khaya = bool(khaya_token and FRONTEND_TO_KHAYA_TARGET.get(target_lang))

    if not has_ghana and not has_khaya:
        return {
            "summary": diagnosis["summary"],
            "steps": list(diagnosis["steps"]),
            "language": "en",
        }

    try:
        summary_t = translate_text(diagnosis["summary"], target_lang)
        steps_t = [translate_text(step, target_lang) for step in diagnosis["steps"]]
    except Exception:
        # Never block the confirm pipeline on optional translation provider failures.
        return {
            "summary": diagnosis["summary"],
            "steps": list(diagnosis["steps"]),
            "language": "en",
        }

    return {
        "summary": summary_t,
        "steps": steps_t,
        "language": target_lang,
    }
