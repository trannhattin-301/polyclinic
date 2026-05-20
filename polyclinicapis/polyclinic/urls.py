from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('specialties', views.SpecialtyViewSet,basename='specialty')
router.register('services', views.ServicesSpecialtyViewSet, basename='service')
router.register('staff', views.StaffProfileViewSet, basename='staff')
router.register('patients', views.PatientProfileViewSet, basename='patient')
router.register('work-schedules', views.WorkScheduleViewSet, basename='work-schedule')
router.register('time-slots', views.TimeSlotViewSet, basename='time-slot')

urlpatterns = [
    path('', include(router.urls))
]