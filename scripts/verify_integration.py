#!/usr/bin/env python3
"""Same checks as verify-integration.mjs — uses only stdlib (no Node required)."""
from __future__ import annotations

import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("VERIFY_API_URL", "http://127.0.0.1:8000").rstrip("/")


def main() -> None:
    health = urllib.request.urlopen(f"{BASE}/health/", timeout=30)
    body = health.read().decode().strip()
    if health.status != 200 or body != "ok":
        raise SystemExit(f"GET /health/ expected 200 and body 'ok', got {health.status} {body!r}")

    schema = urllib.request.urlopen(f"{BASE}/api/schema/", timeout=30)
    if schema.status != 200:
        raise SystemExit(f"GET /api/schema/ expected 200, got {schema.status}")

    print(f"Integration OK — {BASE}")


if __name__ == "__main__":
    try:
        main()
    except urllib.error.URLError as e:
        print(e, file=sys.stderr)
        print(
            "\nStart Django first: Backend/ → pip install -r requirements.txt && "
            "python manage.py runserver 127.0.0.1:8000\n",
            file=sys.stderr,
        )
        sys.exit(1)
