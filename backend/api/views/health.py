from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view


@extend_schema(exclude=True)
@api_view(["GET"])
def health_view(request):
    return HttpResponse("ok", content_type="text/plain")
