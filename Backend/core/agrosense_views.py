"""
AgroSense app-facing API: shaped JSON for the React client.

Uses the repo-root ``integration`` package (Plant.id → Claude → Khaya).
"""

from __future__ import annotations

import base64
import logging

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def _file_to_b64(uploaded_file) -> str:
    uploaded_file.seek(0)
    return base64.b64encode(uploaded_file.read()).decode("ascii")


@extend_schema(
    summary="Scan plant (AgroSense)",
    description=(
        "Multipart form field **`image`**. Returns **`{ candidates: [...] }`** "
        "for the selection screen."
    ),
    tags=["AgroSense"],
    responses={
        200: OpenApiResponse(description="Candidates list"),
        400: OpenApiResponse(description="Missing image"),
        502: OpenApiResponse(description="Upstream failure"),
        503: OpenApiResponse(description="Configuration / client error"),
    },
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def scan(request):
    if "image" not in request.FILES:
        return Response(
            {"detail": "Missing image file (expected form field 'image')."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from integration.services import identify_plant

    try:
        b64 = _file_to_b64(request.FILES["image"])
        candidates = identify_plant(b64)
    except ValueError as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception:
        logger.exception("identify_plant failed")
        return Response(
            {"detail": "Plant identification failed."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({"candidates": candidates})


@extend_schema(
    summary="Confirm plant & diagnose (AgroSense)",
    description=(
        "Multipart: **`image`**, **`plant_name`** (common name), **`language`** "
        "(optional **`scientific_name`**, **`plant_confidence`**). "
        "Runs health assessment, Claude, and Khaya when language is not `en`."
    ),
    tags=["AgroSense"],
    responses={
        200: OpenApiResponse(description="plant, health, diagnosis"),
        400: OpenApiResponse(description="Bad request"),
        502: OpenApiResponse(description="Pipeline failure"),
        503: OpenApiResponse(description="Configuration / client error"),
    },
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def confirm(request):
    if "image" not in request.FILES:
        return Response(
            {"detail": "Missing image file (expected form field 'image')."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    plant_name = request.data.get("plant_name")
    language = request.data.get("language") or "en"
    if not plant_name:
        return Response(
            {"detail": "Missing plant_name."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    scientific = request.data.get("scientific_name")
    conf_raw = request.data.get("plant_confidence")
    if conf_raw in (None, ""):
        plant_confidence = None
    else:
        try:
            plant_confidence = float(conf_raw)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid plant_confidence."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    from integration.services import compose_confirm

    try:
        b64 = _file_to_b64(request.FILES["image"])
        payload = compose_confirm(
            b64,
            str(plant_name),
            str(language),
            scientific_name=str(scientific) if scientific else None,
            plant_confidence=plant_confidence,
        )
    except ValueError as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception:
        logger.exception("compose_confirm failed")
        return Response(
            {"detail": "Diagnosis pipeline failed."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(payload)
