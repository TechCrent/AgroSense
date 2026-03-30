from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
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
            value={"image": "<binary-file>"},
            request_only=True,
        )
    ],
    responses={
        200: OpenApiResponse(description="Plant candidates"),
        400: OpenApiResponse(description="Missing/invalid image"),
        502: OpenApiResponse(description="Upstream failure"),
        503: OpenApiResponse(description="Service unavailable"),
    },
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def scan_view(request):
    serializer = ScanRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    image = serializer.validated_data["image"]
    image.seek(0)
    try:
        return Response(scan_pipeline(image.read()), status=status.HTTP_200_OK)
    except UpstreamServiceError as exc:
        return Response({"detail": str(exc)}, status=exc.status_code)
