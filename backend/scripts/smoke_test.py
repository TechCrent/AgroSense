from __future__ import annotations

import argparse
from pathlib import Path

import requests


def run(base_url: str, image_path: str, plant_name: str, language: str) -> None:
    image_file = Path(image_path)
    if not image_file.exists():
        raise SystemExit(f"Image not found: {image_path}")

    with image_file.open("rb") as fh:
        scan_res = requests.post(f"{base_url}/api/scan/", files={"images": fh}, timeout=60)
    print("scan", scan_res.status_code)
    print(scan_res.text[:300])

    with image_file.open("rb") as fh:
        confirm_res = requests.post(
            f"{base_url}/api/confirm/",
            files={"images": fh},
            data={"plant_name": plant_name, "language": language},
            timeout=90,
        )
    print("confirm", confirm_res.status_code)
    print(confirm_res.text[:500])


def main() -> None:
    parser = argparse.ArgumentParser(description="Smoke test AgroSense backend APIs.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--image", required=True)
    parser.add_argument("--plant-name", default="Tomato")
    parser.add_argument("--language", default="en")
    args = parser.parse_args()
    run(args.base_url.rstrip("/"), args.image, args.plant_name, args.language)


if __name__ == "__main__":
    main()
