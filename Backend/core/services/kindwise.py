"""HTTP clients for Kindwise / plant.id upstream APIs."""

from __future__ import annotations

import base64
from typing import Any

import requests
from django.conf import settings
from rest_framework.request import Request
from rest_framework.response import Response

API_KEY_HEADER = 'Api-Key'
UPSTREAM_TIMEOUT = 60


def _normalize_base64_image_string(value: str) -> str:
    """Plant.id expects raw base64, not data URLs."""
    s = value.strip()
    if not s:
        return ''
    if s.startswith('data:') and 'base64,' in s:
        s = s.split('base64,', 1)[1].strip()
    return s


def _normalize_images_list(raw: Any) -> list[str]:
    """API requires `images` to be a list of base64 strings; clients often send one string."""
    if raw is None:
        return []
    if isinstance(raw, str):
        items = [raw]
    elif isinstance(raw, (list, tuple)):
        items = list(raw)
    else:
        items = [raw]
    out: list[str] = []
    for item in items:
        if item is None:
            continue
        norm = _normalize_base64_image_string(str(item))
        if norm:
            out.append(norm)
    return out


def _images_from_request_data(request: Request) -> list[str]:
    data = request.data
    if 'images' not in data:
        return []
    if hasattr(data, 'getlist'):
        parts = data.getlist('images')
        if len(parts) > 1:
            raw: Any = parts
        elif len(parts) == 1:
            raw = parts[0]
        else:
            raw = data.get('images')
    else:
        raw = data.get('images')
    return _normalize_images_list(raw)


def build_kindwise_payload(request: Request) -> dict[str, Any]:
    """Build JSON body: base64 images (multipart or JSON) plus optional lat/lon."""
    payload: dict[str, Any] = {}
    if 'images' in request.FILES:
        images = []
        for image_file in request.FILES.getlist('images'):
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            images.append(image_data)
        payload['images'] = images
    else:
        images = _images_from_request_data(request)
        if images:
            payload['images'] = images
    if 'latitude' in request.data:
        payload['latitude'] = request.data.get('latitude')
    if 'longitude' in request.data:
        payload['longitude'] = request.data.get('longitude')
    return payload


def upstream_error_response(r: requests.Response) -> Response:
    try:
        body = r.json()
    except ValueError:
        body = {'detail': (r.text or r.reason or 'Upstream error').strip()}
    resp = Response(body, status=r.status_code)
    retry_after = r.headers.get('Retry-After')
    if retry_after:
        resp['Retry-After'] = retry_after
    return resp


def as_drf_response(result: dict[str, Any] | Response) -> Response:
    if isinstance(result, Response):
        return result
    return Response(result)


def _post_json(
    base_url: str,
    api_key: str,
    path_suffix: str,
    payload: dict[str, Any],
) -> dict[str, Any] | Response:
    base = base_url.rstrip('/')
    url = f'{base}/{path_suffix}'
    r = requests.post(
        url,
        json=payload,
        headers={API_KEY_HEADER: api_key},
        timeout=UPSTREAM_TIMEOUT,
    )
    if r.status_code >= 400:
        return upstream_error_response(r)
    return r.json()


def plant_identification(payload: dict[str, Any]) -> dict[str, Any] | Response:
    return _post_json(
        settings.PLANT_API_URL,
        settings.PLANT_DETECTION_API_KEY,
        'identification',
        payload,
    )


def plant_health_assessment(payload: dict[str, Any]) -> dict[str, Any] | Response:
    return _post_json(
        settings.PLANT_API_URL,
        settings.PLANT_DETECTION_API_KEY,
        'health_assessment',
        payload,
    )


def crop_identification(payload: dict[str, Any]) -> dict[str, Any] | Response:
    return _post_json(
        settings.CROP_API_URL,
        settings.PLANT_HEALTH_API_KEY,
        'identification',
        payload,
    )
