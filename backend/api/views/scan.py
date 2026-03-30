from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from api.clients.http import UpstreamServiceError
from api.serializers.scan import ScanRequestSerializer
from api.services.orchestrator import scan_pipeline


@extend_schema(
    summary="Scan plant image",
    request=ScanRequestSerializer,
    tags=["AgroSense"],
    examples=[
        OpenApiExample(
            "Multipart request",
            value={"images": "<binary-file>"},
            request_only=True,
        ),
        OpenApiExample(
            "JSON base64 request",
            value={"images": ["data:image/jpg;base64,<base64>"]},
            request_only=True,
        ),
        OpenApiExample(
            "JSON with optional fields (not sent to Plant.id)",
            description=(
                "latitude, longitude, and similar_images are accepted for API compatibility "
                "but are not forwarded to Plant.id; upstream body is only `images`."
            ),
            value={
                "images": ["data:image/jpg;base64,<base64>"],
                "latitude": 49.207,
                "longitude": 16.608,
                "similar_images": True,
            },
            request_only=True,
        ),
    ],
    responses={
        200: OpenApiResponse(description="Plant candidates"),
        400: OpenApiResponse(description="Missing/invalid images file"),
        502: OpenApiResponse(description="Upstream failure"),
        503: OpenApiResponse(description="Service unavailable"),
    },
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def scan_view(request):
    serializer = ScanRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        payload = serializer.validated_data
        return Response(
            scan_pipeline(payload["images"]),
            status=status.HTTP_200_OK,
        )
    except UpstreamServiceError as exc:
        return Response({"detail": str(exc)}, status=exc.status_code)
