from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', views.UserViewSet)
router.register('specialties', views.SpecialtyViewSet)
router.register('doctors', views.DoctorViewSet)
router.register('patients', views.PatientViewSet)
router.register('nurses', views.NurseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]