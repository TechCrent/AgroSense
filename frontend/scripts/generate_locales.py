#!/usr/bin/env python3
"""
Generate frontend locale JSON files from en.json via Khaya (Lelapa).

Run from repository root:

  pip install -r frontend/scripts/requirements-locales.txt
  python frontend/scripts/generate_locales.py

Requires KHAYA_API_TOKEN in environment or repo-root/backend .env (with python-dotenv).
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
_SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPTS))
from khaya_translate import translate_text  # noqa: E402

LOCALES_DIR = REPO_ROOT / "frontend" / "src" / "locales"
EN_FILE = LOCALES_DIR / "en.json"
TARGET_LANGS = ("zu", "xh", "swh", "sot", "afr")


def load_en_keys() -> tuple[dict[str, str], list[str]]:
    data = json.loads(EN_FILE.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit("en.json must be a JSON object")
    keys = list(data.keys())
    for k, v in data.items():
        if not isinstance(v, str):
            raise SystemExit(f"en.json key {k!r} must be a string value")
    return data, keys


def verify_parity(path: Path, expected_keys: list[str]) -> None:
    if not path.exists():
        return
    other = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(other, dict):
        print(f"Warning: {path} is not an object; skipping parity check", file=sys.stderr)
        return
    okeys = set(other)
    ekeys = set(expected_keys)
    if okeys != ekeys:
        missing = ekeys - okeys
        extra = okeys - ekeys
        print(
            f"Warning: {path.name} key mismatch vs en.json "
            f"missing={sorted(missing)!r} extra={sorted(extra)!r}",
            file=sys.stderr,
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--delay",
        type=float,
        default=0.2,
        help="Seconds between Khaya calls (rate limiting)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Write locale files using English text only (no API calls); overwrites targets",
    )
    args = parser.parse_args()

    en_data, keys = load_en_keys()

    for lang in TARGET_LANGS:
        out: dict[str, str] = {}
        for i, k in enumerate(keys):
            src = en_data[k]
            if args.dry_run:
                out[k] = src
            else:
                if i > 0 and args.delay > 0:
                    time.sleep(args.delay)
                out[k] = translate_text(src, lang)
        ordered = {k: out[k] for k in keys}
        dest = LOCALES_DIR / f"{lang}.json"
        dest.write_text(
            json.dumps(ordered, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Wrote {dest}")

    for lang in TARGET_LANGS:
        verify_parity(LOCALES_DIR / f"{lang}.json", keys)


if __name__ == "__main__":
    main()
