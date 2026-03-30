from rest_framework import serializers

from api.serializers.images import FlexibleImagesField


class ScanRequestSerializer(serializers.Serializer):
    # Accepts either multipart files (form field `images`) or JSON base64/data-URLs
    # as `images: [<base64-or-data-url>, ...]` (your Plant.id-style schema).
    images = FlexibleImagesField(required=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    similar_images = serializers.BooleanField(required=False, allow_null=True)
