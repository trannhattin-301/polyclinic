from rest_framework import viewsets, generics, permissions, status, parsers, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from polyclinic import serializers
from polyclinic.models import (
    User, Specialty, ServicesSpecialty, StaffProfile,
    PatientProfile, WorkSchedule, TimeSlot, Appointment, MedicalRecord,
    MedicineCategory, Medicine
)
from polyclinic import perms


class UserViewSet(viewsets.GenericViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def current_user(self, request):
        user = request.user

        if request.method == 'PATCH':
            serializer = serializers.UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

        return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)


class SpecialtyViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Specialty.objects.filter(active=True)
    serializer_class = serializers.SpecialtySerializer


class ServicesSpecialtyViewSet(viewsets.ModelViewSet):
    queryset = ServicesSpecialty.objects.filter(active=True)
    serializer_class = serializers.ServicesSpecialtySerializer

    def get_queryset(self):
        queryset = ServicesSpecialty.objects.filter(active=True)

        specialty_id = self.request.query_params.get('specialty_id')
        if specialty_id:
            queryset = queryset.filter(specialties__id=specialty_id)

        return queryset


class StaffProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StaffProfile.objects.filter(active=True)
    serializer_class = serializers.StaffProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = StaffProfile.objects.filter(active=True)

        specialty_id = self.request.query_params.get('specialty_id')
        if specialty_id:
            queryset = queryset.filter(specialties__id=specialty_id)

        return queryset.distinct()

    @action(methods=['get'], url_path='schedules', detail=True)
    def schedules(self, request, pk=None):
        schedules = self.get_object().work_schedules.filter(active=True)
        return Response(
            serializers.WorkScheduleSerializer(schedules, many=True).data,
            status=status.HTTP_200_OK
        )


class PatientProfileViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = PatientProfile.objects.filter(active=True)
    serializer_class = serializers.PatientProfileSerializer
    permission_classes = [perms.IsPatient]

    def get_object(self):
        return self.request.user.patient_profile


class WorkScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.WorkScheduleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'time_slots']:
            return [permissions.AllowAny()]
        return [perms.IsDoctor()]

    def get_queryset(self):
        queryset = WorkSchedule.objects.filter(active=True)

        staff_profile_id = self.request.query_params.get('staff_profile_id')
        date = self.request.query_params.get('date')
        specialty_id = self.request.query_params.get('specialty_id')

        if staff_profile_id:
            queryset = queryset.filter(staff_profile_id=staff_profile_id)

        if date:
            queryset = queryset.filter(date=date)

        if specialty_id:
            queryset = queryset.filter(staff_profile__specialties__id=specialty_id)

        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(staff_profile=self.request.user.staff_profile)

    @action(methods=['get'], url_path='time-slots', detail=True)
    def time_slots(self, request, pk=None):
        slots = self.get_object().time_slots.filter(active=True)
        return Response(
            serializers.TimeSlotSerializer(slots, many=True).data,
            status=status.HTTP_200_OK
        )


class TimeSlotViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TimeSlotSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'book':
            return [perms.IsPatient()]
        return [perms.IsDoctor()]

    def get_queryset(self):
        queryset = TimeSlot.objects.filter(active=True)

        work_schedule_id = self.request.query_params.get('work_schedule_id')
        status_param = self.request.query_params.get('status')

        if work_schedule_id:
            queryset = queryset.filter(work_schedule_id=work_schedule_id)

        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    @action(methods=['post'], url_path='book', detail=True)
    def book(self, request, pk=None):
        slot = self.get_object()

        if slot.status == TimeSlot.Status.BOOKED:
            return Response(
                {'detail': 'Slot đã được đặt.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        slot.status = TimeSlot.Status.BOOKED
        slot.save()

        return Response(
            serializers.TimeSlotSerializer(slot).data,
            status=status.HTTP_200_OK
        )

class AppointmentViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = Appointment.objects.select_related('patient', 'time_slot', 'time_slot__work_schedule', 'time_slot__work_schedule__staff_profile', 'time_slot__work_schedule__staff_profile__user').prefetch_related('services').all()
    serializer_class = serializers.AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id', 'created_date']
    ordering = ['-created_date']

    def get_queryset(self):
        user, query = self.request.user, self.queryset

        if user.is_staff or user.is_superuser:
            return query

        if hasattr(user, 'staff_profile'):
            return query.filter(time_slot__work_schedule__staff_profile=user.staff_profile)

        return query.filter(patient=user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

    @action(methods=['get'], url_path='my', detail=False)
    def my_appointments(self, request):
        return Response(serializers.AppointmentSerializer(self.get_queryset(), many=True).data, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path='cancel', detail=True)
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = Appointment.Status.CANCELLED
        appointment.save()
        return Response(serializers.AppointmentSerializer(appointment).data, status=status.HTTP_200_OK)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.MedicalRecordSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [perms.IsDoctor()]

    def get_queryset(self):
        queryset = MedicalRecord.objects.filter(active=True).select_related(
            'appointment',
            'appointment__patient',
            'appointment__time_slot',
            'appointment__time_slot__work_schedule',
            'appointment__time_slot__work_schedule__staff_profile',
            'appointment__time_slot__work_schedule__staff_profile__user',
        )

        appointment_id = self.request.query_params.get('appointment_id')
        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)

        user = self.request.user
        if user.is_superuser:
            return queryset

        if user.role == User.Role.NURSE:
            return queryset

        if user.role == User.Role.DOCTOR:
            return queryset.filter(
                appointment__time_slot__work_schedule__staff_profile__user=user
            )

        return queryset.filter(appointment__patient=user)

    def perform_create(self, serializer):
        appointment = serializer.validated_data['appointment']

        if appointment.doctor.user != self.request.user:
            raise serializers.serializers.ValidationError(
                {'appointment': 'Bác sĩ chỉ được tạo bệnh án cho lịch khám của mình.'}
            )

        serializer.save()


class MedicineCategoryViewSet(viewsets.ModelViewSet):
    queryset = MedicineCategory.objects.filter(active=True)
    serializer_class = serializers.MedicineCategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'medicines', 'medicine_detail']:
            return [permissions.AllowAny()]
        return [perms.IsStaff()]

    @action(methods=['get'], detail=True, url_path='medicines')
    def medicines(self, request, pk=None):
        medicines = Medicine.objects.filter(
            active=True,
            category_id=pk
        ).select_related('category')

        return Response(
            serializers.MedicineSerializer(medicines, many=True).data,
            status=status.HTTP_200_OK
        )

    @action(methods=['get'], detail=True, url_path=r'medicines/(?P<medicine_id>[^/.]+)')
    def medicine_detail(self, request, pk=None, medicine_id=None):
        category = self.get_object()
        medicine = get_object_or_404(
            Medicine.objects.filter(active=True, category=category).select_related('category'),
            pk=medicine_id
        )

        return Response(
            serializers.MedicineSerializer(medicine).data,
            status=status.HTTP_200_OK
        )


class MedicineViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.MedicineSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [perms.IsStaff()]

    def get_queryset(self):
        queryset = Medicine.objects.filter(active=True).select_related('category')

        category_id = self.request.query_params.get('category_id')
        unit = self.request.query_params.get('unit')
        available = self.request.query_params.get('available')
        low_stock = self.request.query_params.get('low_stock')

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if unit:
            queryset = queryset.filter(unit=unit)

        if available == 'true':
            queryset = queryset.filter(stock__gt=0)
        elif available == 'false':
            queryset = queryset.filter(stock=0)

        if low_stock == 'true':
            queryset = queryset.filter(stock__lte=100)
        elif low_stock == 'false':
            queryset = queryset.filter(stock__gt=100)

        return queryset
