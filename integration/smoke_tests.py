"""
Manual smoke tests from repo root:

  pip install -r integration/requirements.txt
  python -m integration.smoke_tests identify path/to/photo.jpg
  python -m integration.smoke_tests health path/to/photo.jpg
  python -m integration.smoke_tests claude
  python -m integration.smoke_tests translate
  python -m integration.smoke_tests confirm path/to/photo.jpg "Tomato" zu
"""

from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path


def _read_b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("ascii")


def cmd_identify(args: argparse.Namespace) -> None:
    from integration.plant_id import identify_plant

    b64 = _read_b64(Path(args.image))
    candidates = identify_plant(b64)
    print(json.dumps(candidates, indent=2))


def cmd_health(args: argparse.Namespace) -> None:
    from integration.plant_id import assess_health

    b64 = _read_b64(Path(args.image))
    health = assess_health(b64)
    print(json.dumps(health, indent=2))


def cmd_claude(_: argparse.Namespace) -> None:
    from integration.claude_diagnosis import build_claude_prompt, get_diagnosis
    from integration.plant_id import HealthResult

    fake: HealthResult = {
        "status": "infected",
        "disease_name": "Early Blight",
        "disease_type": "Fungal",
        "confidence": 0.88,
    }
    prompt = build_claude_prompt("Tomato", fake)
    diagnosis = get_diagnosis(prompt, output_language="en")
    print(json.dumps(diagnosis, indent=2))


def cmd_translate(args: argparse.Namespace) -> None:
    from integration.khaya_translate import translate_text

    sample = (
        "Remove affected leaves. Apply fungicide every seven days. "
        "Water at the base of the plant to keep foliage dry."
    )
    lang = args.lang
    out = translate_text(sample, lang)
    print(f"target={lang!r}")
    print(out)


def cmd_confirm(args: argparse.Namespace) -> None:
    from integration.services import compose_confirm

    b64 = _read_b64(Path(args.image))
    result = compose_confirm(
        b64,
        args.plant,
        args.lang,
        scientific_name=args.scientific,
        plant_confidence=args.confidence,
    )
    print(json.dumps(result, indent=2))


def main() -> None:
    p = argparse.ArgumentParser(description="AgroSense integration smoke tests")
    sub = p.add_subparsers(dest="cmd", required=True)

    p_id = sub.add_parser("identify", help="Plant.id identification")
    p_id.add_argument("image", type=str)
    p_id.set_defaults(func=cmd_identify)

    p_h = sub.add_parser("health", help="Plant.id health assessment")
    p_h.add_argument("image", type=str)
    p_h.set_defaults(func=cmd_health)

    p_c = sub.add_parser("claude", help="Claude diagnosis with fake health payload")
    p_c.set_defaults(func=cmd_claude)

    p_t = sub.add_parser("translate", help="Khaya translate short English sample text")
    p_t.add_argument(
        "--lang",
        default="zu",
        help="Frontend locale code (default zu)",
    )
    p_t.set_defaults(func=cmd_translate)

    p_f = sub.add_parser("confirm", help="Full compose_confirm pipeline")
    p_f.add_argument("image", type=str)
    p_f.add_argument("plant", type=str, help="Common name, e.g. Tomato")
    p_f.add_argument("lang", type=str, default="en", nargs="?", help="Frontend lang code")
    p_f.add_argument("--scientific", type=str, default=None)
    p_f.add_argument("--confidence", type=float, default=None)
    p_f.set_defaults(func=cmd_confirm)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
