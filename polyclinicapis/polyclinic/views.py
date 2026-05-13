from rest_framework import viewsets
from polyclinic.models import User, Doctor, Patient, Specialty, Nurse
from polyclinic.serializers import (
    UserSerializer, DoctorSerializer,
    PatientSerializer, SpecialtySerializer, NurseSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('user', 'specialty').all()
    serializer_class = DoctorSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('user').all()
    serializer_class = PatientSerializer

class NurseViewSet(viewsets.ModelViewSet):
    queryset = Nurse.objects.select_related('user').all()
    serializer_class = NurseSerializer