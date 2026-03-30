from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from api.clients.http import UpstreamServiceError
from api.serializers.confirm import ConfirmRequestSerializer
from api.services.orchestrator import confirm_pipeline


@extend_schema(
    summary="Confirm plant and generate diagnosis",
    request=ConfirmRequestSerializer,
    tags=["AgroSense"],
    examples=[
        OpenApiExample(
            "Multipart request",
            value={
                "images": "<binary-file>",
                "plant_name": "Tomato",
                "language": "en",
                "scientific_name": "Solanum lycopersicum",
                "plant_confidence": 0.94,
            },
            request_only=True,
        ),
        OpenApiExample(
            "JSON base64 request",
            value={
                "images": ["data:image/jpg;base64,<base64>"],
                "plant_name": "Tomato",
                "language": "en",
                "scientific_name": "Solanum lycopersicum",
                "plant_confidence": 0.94,
            },
            request_only=True,
        ),
    ],
    responses={
        200: OpenApiResponse(description="Diagnosis payload"),
        400: OpenApiResponse(description="Validation failed"),
        502: OpenApiResponse(description="Upstream failure"),
        503: OpenApiResponse(description="Service unavailable"),
    },
)
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def confirm_view(request):
    serializer = ConfirmRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        return Response(
            confirm_pipeline(
                serializer.validated_data["images"],
                serializer.validated_data["plant_name"],
                serializer.validated_data.get("language", "en"),
                scientific_name=serializer.validated_data.get("scientific_name") or None,
                plant_confidence=serializer.validated_data.get("plant_confidence"),
            ),
            status=status.HTTP_200_OK,
        )
    except UpstreamServiceError as exc:
        return Response({"detail": str(exc)}, status=exc.status_code)
