from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import KindwiseImagePayloadSerializer
from .services.gemini_crop import crop_disease_solutions
from .services.kindwise import (
    as_drf_response,
    build_kindwise_payload,
    crop_identification,
    plant_health_assessment,
    plant_identification,
)

_JSON_EXAMPLE = {
    'images': [
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    ],
    'latitude': 12.34,
    'longitude': 56.78,
}


@extend_schema(
    summary='Identify plant',
    description=(
        'Proxies to **plant.id** `POST /v3/identification`. '
        'Send `images` as JSON base64 strings or upload files with form field `images`. '
        'Upstream errors are forwarded with the same status code.'
    ),
    tags=['Plant'],
    request=KindwiseImagePayloadSerializer,
    examples=[
        OpenApiExample('JSON body', value=_JSON_EXAMPLE, request_only=True),
    ],
    responses={
        200: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
def identify_plant(request):
    payload = build_kindwise_payload(request)
    return as_drf_response(plant_identification(payload))


@extend_schema(
    summary='Assess plant health',
    description=(
        'Proxies to **plant.id** `POST /v3/health_assessment`. '
        '`images` must be a list of base64 strings (a single string is coerced to a one-item list). '
        'You may also send multipart files under field `images`.'
    ),
    tags=['Plant'],
    request=KindwiseImagePayloadSerializer,
    examples=[
        OpenApiExample('JSON body', value=_JSON_EXAMPLE, request_only=True),
    ],
    responses={
        200: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
def assess_plant_health(request):
    payload = build_kindwise_payload(request)
    return as_drf_response(plant_health_assessment(payload))


@extend_schema(
    summary='Identify crop / disease',
    description=(
        'Proxies to **Kindwise crop** `POST /api/v1/identification` (see `PLANTHEALTH_API_URL`). '
        'Same JSON or multipart conventions as other image endpoints.'
    ),
    tags=['Crop'],
    request=KindwiseImagePayloadSerializer,
    examples=[
        OpenApiExample('JSON body', value=_JSON_EXAMPLE, request_only=True),
    ],
    responses={
        200: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
def identify_crop(request):
    payload = build_kindwise_payload(request)
    return as_drf_response(crop_identification(payload))


@extend_schema(
    summary='Identify crop + Gemini advice',
    description=(
        'Runs Kindwise crop identification, then **Gemini** with `thinkingConfig` and optional '
        '`googleSearch` tool (see settings) to produce treatment, prevention, and monitoring text.'
    ),
    tags=['Crop'],
    request=KindwiseImagePayloadSerializer,
    examples=[
        OpenApiExample('JSON body', value=_JSON_EXAMPLE, request_only=True),
    ],
    responses={
        200: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
def identify_crop_advice(request):
    payload = build_kindwise_payload(request)
    identification = crop_identification(payload)
    if isinstance(identification, Response):
        return identification
    try:
        solutions = crop_disease_solutions(identification)
    except ValueError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except RuntimeError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
    return Response(
        {
            'identification': identification,
            'disease_solutions': solutions,
        }
    )
