"""
Khaya / Lelapa (standalone, no Django). Used by generate_locales.py.

Load ``KHAYA_API_TOKEN`` from repo-root ``.env`` or ``backend/.env`` if python-dotenv is installed.
"""

from __future__ import annotations

import os
import re
import time
from pathlib import Path
from typing import Final

import httpx

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None  # type: ignore[misc, assignment]

_SCRIPTS = Path(__file__).resolve().parent
_REPO_ROOT = _SCRIPTS.parent.parent

if load_dotenv:
    load_dotenv(_REPO_ROOT / ".env")
    load_dotenv(_REPO_ROOT / "backend" / ".env")

GHANA_API_URL = os.environ.get(
    "API_URL", "https://translation-api.ghananlp.org/v1/translate"
)
PRIMARY_API_KEY = os.environ.get("PRIMARY_API_KEY", "").strip()
SECONDARY_API_KEY = os.environ.get("SECONDARY_API_KEY", "").strip()
KHAYA_TRANSLATE_URL = os.environ.get(
    "KHAYA_TRANSLATE_URL", "https://api.lelapa.ai/v1/translate/process"
)

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


def _get_khaya_token() -> str:
    token = os.environ.get("KHAYA_API_TOKEN", "").strip()
    if not token:
        raise ValueError("KHAYA_API_TOKEN is not set")
    return token


def _get_ghana_key() -> str:
    key = PRIMARY_API_KEY or SECONDARY_API_KEY
    if not key:
        raise ValueError("PRIMARY_API_KEY / SECONDARY_API_KEY is not set")
    return key


def _translate_chunk_ghana(
    text: str,
    *,
    target_lang: str,
    session: httpx.Client | None = None,
) -> str:
    headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": _get_ghana_key(),
    }
    payload = {"in": text, "lang": f"en-{target_lang}"}
    own_client = session is None
    client = session or httpx.Client(timeout=60.0)
    try:
        r = client.post(GHANA_API_URL, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
    finally:
        if own_client:
            client.close()

    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        for key in ("out", "translatedText", "translation", "translated_text", "text"):
            v = data.get(key)
            if isinstance(v, str) and v.strip():
                return v.strip()
    raise ValueError("Ghana NLP response missing translated text")


def _translate_chunk(
    text: str,
    *,
    target_lang: str,
    source_lang: str = SOURCE_LANG_EN,
    session: httpx.Client | None = None,
) -> str:
    headers = {
        "Content-Type": "application/json",
        "X-CLIENT-TOKEN": _get_khaya_token(),
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
    if target_lang == "en" or not text.strip():
        return text

    use_ghana = bool(PRIMARY_API_KEY or SECONDARY_API_KEY)
    if use_ghana:
        provider_target = FRONTEND_TO_GHANA_TARGET.get(target_lang, target_lang)
    else:
        provider_target = FRONTEND_TO_KHAYA_TARGET.get(target_lang)
        if not provider_target:
            raise ValueError(f"Unsupported frontend language code for translator: {target_lang!r}")

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
                out.append(_translate_chunk(chunk, target_lang=provider_target, session=client))
    return " ".join(out).strip()
