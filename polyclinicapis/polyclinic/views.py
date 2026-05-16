from django.shortcuts import render
from rest_framework import viewsets,generics
from polyclinic.models import Patient,Doctor,User,Specialty
from polyclinic import serializers

# Create your views here.
class SpecialtyViewSet(viewsets.ModelViewSet,generics.ListAPIView):
    queryset = Specialty.objects.all()
    serializer_class = serializers.SpecialtySerializer

