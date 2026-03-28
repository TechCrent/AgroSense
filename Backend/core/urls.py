from django.urls import path
from . import views
urlpatterns = [
    path('identify-plant/', views.identify_plant, name='identify-plant'),
]

