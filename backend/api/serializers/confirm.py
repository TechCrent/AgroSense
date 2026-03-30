from rest_framework import serializers


class ConfirmRequestSerializer(serializers.Serializer):
    image = serializers.FileField(required=True)
    plant_name = serializers.CharField(required=True, trim_whitespace=True)
    language = serializers.CharField(required=False, default="en")
    scientific_name = serializers.CharField(required=False, allow_blank=True)
    plant_confidence = serializers.FloatField(required=False, allow_null=True)
