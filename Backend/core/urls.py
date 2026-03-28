from django.urls import path
from . import views
urlpatterns = [
    path('identify-plant/', views.identify_plant, name='identify-plant'),
    path('assess-plant-health/', views.assess_plant_health, name='assess-plant-health'),
]

