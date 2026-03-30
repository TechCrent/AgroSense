from __future__ import annotations

import base64
import re
from typing import Any

from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers

_DATA_URL_RE = re.compile(r"^data:image/[^;]+;base64,(.+)$", re.I)


def _normalize_data_url(value: str) -> str:
    s = value.strip()
    m = _DATA_URL_RE.match(s)
    if m:
        return m.group(1).strip()
    return s


def _validate_base64(value: str) -> str:
    b64 = _normalize_data_url(value)
    try:
        base64.b64decode(b64, validate=True)
    except Exception as exc:
        raise serializers.ValidationError("Invalid base64 image payload.") from exc
    return b64


class FlexibleImagesField(serializers.Field):
    """
    Accepts Plant.id-style `images` input as:
    - multipart upload (field name `images`): one file per request
    - JSON: `images` as a string or list of base64 strings (data URLs allowed)
    Returns a list of raw base64 strings (no `data:image/...;base64,` prefix).
    """

    def to_internal_value(self, data: Any) -> list[str]:
        # Multipart case: DRF passes an UploadedFile instance to FileField-like inputs.
        if isinstance(data, UploadedFile):
            raw_bytes = data.read()
            b64 = base64.b64encode(raw_bytes).decode("ascii")
            # Validate to keep error semantics consistent.
            _validate_base64(b64)
            return [b64]

        # JSON case: allow either a single string or a list of strings.
        if data is None:
            raise serializers.ValidationError("Images are required.")

        if isinstance(data, (list, tuple)):
            items = data
        else:
            items = [data]

        out: list[str] = []
        for item in items:
            if item is None:
                continue
            if isinstance(item, UploadedFile):
                raw_bytes = item.read()
                b64 = base64.b64encode(raw_bytes).decode("ascii")
                _validate_base64(b64)
                out.append(b64)
                continue

            if isinstance(item, str):
                out.append(_validate_base64(item))
                continue

            # Last-resort: coerce to string.
            out.append(_validate_base64(str(item)))

        if not out:
            raise serializers.ValidationError("Images are required.")

        return out

