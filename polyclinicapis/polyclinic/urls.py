from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from polyclinic import views

router = DefaultRouter()
router.register('specialty', views.SpecialtyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]