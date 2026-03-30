from django.urls import path

from .views.confirm import confirm_view
from .views.health import health_view
from .views.scan import scan_view

urlpatterns = [
    path("health/", health_view, name="health"),
    path("api/scan/", scan_view, name="api-scan"),
    path("api/confirm/", confirm_view, name="api-confirm"),
]
