from django.urls import path

from . import views

app_name = 'core'

urlpatterns = [
    path('identify-plant/', views.identify_plant, name='identify-plant'),
    path('identify-crop/', views.identify_crop, name='identify-crop'),
    path(
        'identify-crop-advice/',
        views.identify_crop_advice,
        name='identify-crop-advice',
    ),
    path('assess-plant-health/', views.assess_plant_health, name='assess-plant-health'),
]

