from django.http import HttpResponse
from rest_framework.decorators import api_view


@api_view(["GET"])
def health_view(request):
    return HttpResponse("ok", content_type="text/plain")
