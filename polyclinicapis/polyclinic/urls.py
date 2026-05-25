from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register('users', views.UserViewSet, basename='user')
router.register('specialties', views.SpecialtyViewSet, basename='specialty')
router.register('services', views.ServicesSpecialtyViewSet, basename='services')
router.register('staff', views.StaffProfileViewSet, basename='staff')
router.register('patients', views.PatientProfileViewSet, basename='patient')
router.register('work-schedules', views.WorkScheduleViewSet, basename='work-schedules')
router.register('time-slots', views.TimeSlotViewSet, basename='time-slots')
router.register('appointments', views.AppointmentViewSet, basename='appointments')
router.register('medical-records', views.MedicalRecordViewSet, basename='medical-records')
router.register('prescriptions', views.PrescriptionViewSet, basename='prescriptions')
router.register('inventory-transactions', views.InventoryTransactionViewSet, basename='inventory-transactions')
router.register('test-results', views.TestResultViewSet, basename='test-results')
router.register('invoices', views.InvoiceViewSet, basename='invoices')
router.register('medicine-categories', views.MedicineCategoryViewSet, basename='medicine-categories')
router.register('medicines', views.MedicineViewSet, basename='medicines')
router.register('patient-profiles', views.PatientProfileViewSet, basename='patient-profiles')


urlpatterns = [
    path('', include(router.urls)),
]
