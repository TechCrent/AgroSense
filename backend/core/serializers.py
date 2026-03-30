"""Serializers used for OpenAPI schema (request bodies match Kindwise proxy payloads)."""

from rest_framework import serializers


class KindwiseImagePayloadSerializer(serializers.Serializer):
    """JSON body accepted by identify/health endpoints (multipart file upload is also supported)."""

    images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text='Base64-encoded images. A single string is accepted and normalized to a one-element list.',
    )
    latitude = serializers.FloatField(required=False, help_text='Optional GPS latitude.')
    longitude = serializers.FloatField(required=False, help_text='Optional GPS longitude.')
