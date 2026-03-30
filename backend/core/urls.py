from django.urls import path

from . import agrosense_views, views

app_name = 'core'

urlpatterns = [
    path('health/', views.health, name='health'),
    path('api/scan/', agrosense_views.scan, name='api-scan'),
    path('api/confirm/', agrosense_views.confirm, name='api-confirm'),
    path('identify-plant/', views.identify_plant, name='identify-plant'),
    path('identify-crop/', views.identify_crop, name='identify-crop'),
    path(
        'identify-crop-advice/',
        views.identify_crop_advice,
        name='identify-crop-advice',
    ),
    path('assess-plant-health/', views.assess_plant_health, name='assess-plant-health'),
]

