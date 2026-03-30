from rest_framework import serializers


class ScanRequestSerializer(serializers.Serializer):
    image = serializers.FileField(required=True)
