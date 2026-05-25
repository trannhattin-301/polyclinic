from datetime import timedelta
from django.db import transaction
from django.db.models import F, Q
from rest_framework import viewsets, generics, permissions, status, parsers, filters
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from polyclinic import serializers
from polyclinic.models import (
    User, Specialty, ServicesSpecialty, StaffProfile,
    PatientProfile, WorkSchedule, TimeSlot, Appointment, MedicalRecord,
    MedicineCategory, Medicine, Prescription, InventoryTransaction,
    TestResult, Invoice, ChatMessage
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

def can_access_appointment(user, appointment):
    if user.is_staff or user.is_superuser:
        return True

    if appointment.patient_id == user.id:
        return True

    if hasattr(user, 'staff_profile'):
        return appointment.time_slot.work_schedule.staff_profile_id == user.staff_profile.id

    return False


class AppointmentViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = Appointment.objects.select_related(
        'patient',
        'time_slot',
        'time_slot__work_schedule',
        'time_slot__work_schedule__staff_profile',
        'time_slot__work_schedule__staff_profile__user'
    ).prefetch_related('services').all()

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

        if not can_access_appointment(request.user, appointment):
            return Response({'detail': 'Bạn không có quyền truy cập.'}, status=status.HTTP_403_FORBIDDEN)

        appointment.status = Appointment.Status.CANCELLED
        appointment.save()

        return Response(serializers.AppointmentSerializer(appointment).data, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=True, url_path='messages')
    def messages(self, request, pk=None):
        appointment = self.get_object()

        if not can_access_appointment(request.user, appointment):
            return Response({'detail': 'Bạn không có quyền truy cập.'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            messages = appointment.messages.select_related('sender').all()
            return Response(serializers.ChatMessageSerializer(messages, many=True).data, status=status.HTTP_200_OK)

        content = request.data.get('content', '').strip()

        if not content:
            return Response({'detail': 'Nội dung tin nhắn không được trống.'}, status=status.HTTP_400_BAD_REQUEST)

        message = ChatMessage.objects.create(appointment=appointment, sender=request.user, content=content)

        return Response(serializers.ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)

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


class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PrescriptionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action == 'dispense':
            return [perms.IsStaff()]
        return [perms.IsDoctor()]

    def get_queryset(self):
        queryset = Prescription.objects.filter(active=True).select_related(
            'medical_record',
            'medical_record__appointment',
            'medical_record__appointment__patient',
            'medical_record__appointment__time_slot',
            'medical_record__appointment__time_slot__work_schedule',
            'medical_record__appointment__time_slot__work_schedule__staff_profile',
            'medical_record__appointment__time_slot__work_schedule__staff_profile__user',
            'dispensed_by',
        ).prefetch_related('items', 'items__medicine')

        medical_record_id = self.request.query_params.get('medical_record_id')
        appointment_id = self.request.query_params.get('appointment_id')
        status_param = self.request.query_params.get('status')

        if medical_record_id:
            queryset = queryset.filter(medical_record_id=medical_record_id)

        if appointment_id:
            queryset = queryset.filter(medical_record__appointment_id=appointment_id)

        if status_param:
            queryset = queryset.filter(status=status_param)

        user = self.request.user
        if user.is_superuser:
            return queryset

        if user.role == User.Role.NURSE:
            return queryset

        if user.role == User.Role.DOCTOR:
            return queryset.filter(
                medical_record__appointment__time_slot__work_schedule__staff_profile__user=user
            )

        return queryset.filter(medical_record__appointment__patient=user)

    def perform_create(self, serializer):
        medical_record = serializer.validated_data['medical_record']

        if medical_record.get_doctor().user != self.request.user:
            raise ValidationError(
                {'medical_record': 'Doctor can only create prescriptions for their own medical records.'}
            )

        serializer.save()

    def perform_update(self, serializer):
        prescription = self.get_object()

        if prescription.status == Prescription.Status.DISPENSED:
            raise ValidationError({'detail': 'Dispensed prescriptions cannot be edited.'})

        if prescription.medical_record.get_doctor().user != self.request.user:
            raise ValidationError(
                {'medical_record': 'Doctor can only update prescriptions for their own medical records.'}
            )

        serializer.save()

    def perform_destroy(self, instance):
        if instance.status == Prescription.Status.DISPENSED:
            raise ValidationError({'detail': 'Dispensed prescriptions cannot be deleted.'})

        if instance.medical_record.get_doctor().user != self.request.user:
            raise ValidationError(
                {'medical_record': 'Doctor can only delete prescriptions for their own medical records.'}
            )

        instance.delete()

    @action(methods=['post'], detail=True, url_path='dispense')
    def dispense(self, request, pk=None):
        with transaction.atomic():
            prescription = Prescription.objects.select_for_update().get(pk=pk, active=True)

            if prescription.status == Prescription.Status.DISPENSED:
                raise ValidationError({'detail': 'Prescription has already been dispensed.'})

            if prescription.status == Prescription.Status.CANCELLED:
                raise ValidationError({'detail': 'Cancelled prescriptions cannot be dispensed.'})

            items = list(
                prescription.items.select_related('medicine').all()
            )

            if not items:
                raise ValidationError({'detail': 'Prescription has no items to dispense.'})

            locked_medicines = {}
            for item in items:
                medicine = Medicine.objects.select_for_update().get(pk=item.medicine_id)
                if medicine.stock < item.quantity:
                    raise ValidationError(
                        {'detail': f'Insufficient stock for medicine "{medicine.name}".'}
                    )
                locked_medicines[item.medicine_id] = medicine

            for item in items:
                medicine = locked_medicines[item.medicine_id]
                stock_before = medicine.stock
                medicine.stock = stock_before - item.quantity
                medicine.save(update_fields=['stock'])

                InventoryTransaction.objects.create(
                    medicine=medicine,
                    type=InventoryTransaction.Type.DISPENSE,
                    quantity=item.quantity,
                    stock_before=stock_before,
                    stock_after=medicine.stock,
                    created_by=request.user,
                    prescription=prescription,
                    prescription_item=item,
                    note=request.data.get('note')
                )

            prescription.status = Prescription.Status.DISPENSED
            prescription.dispensed_at = timezone.now()
            prescription.dispensed_by = request.user
            prescription.save(update_fields=['status', 'dispensed_at', 'dispensed_by'])

        return Response(
            serializers.PrescriptionSerializer(prescription).data,
            status=status.HTTP_200_OK
        )

    @action(methods=['post'], detail=True, url_path='confirm')
    def confirm(self, request, pk=None):
        prescription = self.get_object()

        if prescription.status == Prescription.Status.DISPENSED:
            raise ValidationError({'detail': 'Dispensed prescriptions cannot be confirmed again.'})

        if prescription.status == Prescription.Status.CANCELLED:
            raise ValidationError({'detail': 'Cancelled prescriptions cannot be confirmed.'})

        if prescription.medical_record.get_doctor().user != request.user:
            raise ValidationError(
                {'medical_record': 'Doctor can only confirm prescriptions for their own medical records.'}
            )

        prescription.status = Prescription.Status.CONFIRMED
        prescription.save(update_fields=['status'])

        return Response(
            serializers.PrescriptionSerializer(prescription).data,
            status=status.HTTP_200_OK
        )

    @action(methods=['post'], detail=True, url_path='cancel')
    def cancel(self, request, pk=None):
        prescription = self.get_object()

        if prescription.status == Prescription.Status.DISPENSED:
            raise ValidationError({'detail': 'Dispensed prescriptions cannot be cancelled.'})

        if prescription.medical_record.get_doctor().user != request.user:
            raise ValidationError(
                {'medical_record': 'Doctor can only cancel prescriptions for their own medical records.'}
            )

        prescription.status = Prescription.Status.CANCELLED
        prescription.save(update_fields=['status'])

        return Response(
            serializers.PrescriptionSerializer(prescription).data,
            status=status.HTTP_200_OK
        )


class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.InventoryTransactionSerializer

    def get_permissions(self):
        return [perms.IsStaff()]

    def get_queryset(self):
        queryset = InventoryTransaction.objects.select_related(
            'medicine', 'created_by', 'prescription', 'prescription_item'
        ).filter(active=True)

        medicine_id = self.request.query_params.get('medicine_id')
        transaction_type = self.request.query_params.get('type')
        prescription_id = self.request.query_params.get('prescription_id')
        created_by_id = self.request.query_params.get('created_by_id')

        if medicine_id:
            queryset = queryset.filter(medicine_id=medicine_id)

        if transaction_type:
            queryset = queryset.filter(type=transaction_type)

        if prescription_id:
            queryset = queryset.filter(prescription_id=prescription_id)

        if created_by_id:
            queryset = queryset.filter(created_by_id=created_by_id)

        return queryset.order_by('-created_date')


class TestResultViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TestResultSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [perms.IsStaff()]

    def get_queryset(self):
        queryset = TestResult.objects.filter(active=True).select_related(
            'medical_record',
            'medical_record__appointment',
            'medical_record__appointment__patient',
            'medical_record__appointment__time_slot',
            'medical_record__appointment__time_slot__work_schedule',
            'medical_record__appointment__time_slot__work_schedule__staff_profile',
            'medical_record__appointment__time_slot__work_schedule__staff_profile__user',
            'performed_by',
        )

        medical_record_id = self.request.query_params.get('medical_record_id')
        appointment_id = self.request.query_params.get('appointment_id')
        performed_by_id = self.request.query_params.get('performed_by_id')

        if medical_record_id:
            queryset = queryset.filter(medical_record_id=medical_record_id)

        if appointment_id:
            queryset = queryset.filter(medical_record__appointment_id=appointment_id)

        if performed_by_id:
            queryset = queryset.filter(performed_by_id=performed_by_id)

        user = self.request.user
        if user.is_superuser or user.role == User.Role.NURSE:
            return queryset

        if user.role == User.Role.DOCTOR:
            return queryset.filter(
                medical_record__appointment__time_slot__work_schedule__staff_profile__user=user
            )

        return queryset.filter(medical_record__appointment__patient=user)

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.InvoiceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [perms.IsStaff()]

    def get_queryset(self):
        queryset = Invoice.objects.filter(active=True).select_related(
            'appointment',
            'appointment__patient',
            'appointment__time_slot',
            'appointment__time_slot__work_schedule',
            'appointment__time_slot__work_schedule__staff_profile',
            'appointment__time_slot__work_schedule__staff_profile__user',
        )

        appointment_id = self.request.query_params.get('appointment_id')
        status_param = self.request.query_params.get('status')
        payment_method = self.request.query_params.get('payment_method')

        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)

        if status_param:
            queryset = queryset.filter(status=status_param)

        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)

        user = self.request.user
        if user.is_superuser or user.role in [User.Role.DOCTOR, User.Role.NURSE]:
            return queryset

        return queryset.filter(appointment__patient=user)


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
        expired = self.request.query_params.get('expired')
        near_expiry = self.request.query_params.get('near_expiry')
        today = timezone.now().date()
        near_expiry_date = today + timedelta(days=30)

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if unit:
            queryset = queryset.filter(unit=unit)

        if available == 'true':
            queryset = queryset.filter(stock__gt=0)
        elif available == 'false':
            queryset = queryset.filter(stock=0)

        if low_stock == 'true':
            queryset = queryset.filter(stock__lte=F('low_stock_threshold'))
        elif low_stock == 'false':
            queryset = queryset.filter(stock__gt=F('low_stock_threshold'))

        if expired == 'true':
            queryset = queryset.filter(expiry_date__lt=today)
        elif expired == 'false':
            queryset = queryset.exclude(expiry_date__lt=today)

        if near_expiry == 'true':
            queryset = queryset.filter(expiry_date__range=(today, near_expiry_date))
        elif near_expiry == 'false':
            queryset = queryset.exclude(expiry_date__range=(today, near_expiry_date))

        return queryset

    @action(methods=['get'], detail=False, url_path='alerts')
    def alerts(self, request):
        today = timezone.now().date()
        near_expiry_date = today + timedelta(days=30)

        queryset = self.get_queryset().filter(
            Q(stock__lte=F('low_stock_threshold')) |
            Q(expiry_date__lt=today) |
            Q(expiry_date__range=(today, near_expiry_date))
        )

        return Response(
            serializers.MedicineSerializer(queryset.distinct(), many=True).data,
            status=status.HTTP_200_OK
        )

    @action(methods=['post'], detail=True, url_path='import-stock')
    def import_stock(self, request, pk=None):
        quantity = int(request.data.get('quantity', 0))
        note = request.data.get('note')

        if quantity <= 0:
            raise ValidationError({'quantity': 'Quantity must be greater than 0.'})

        with transaction.atomic():
            medicine = Medicine.objects.select_for_update().get(pk=pk, active=True)
            stock_before = medicine.stock
            medicine.stock = stock_before + quantity
            medicine.save(update_fields=['stock'])

            inventory_transaction = InventoryTransaction.objects.create(
                medicine=medicine,
                type=InventoryTransaction.Type.IMPORT,
                quantity=quantity,
                stock_before=stock_before,
                stock_after=medicine.stock,
                note=note,
                created_by=request.user
            )

        return Response(
            {
                'medicine': serializers.MedicineSerializer(medicine).data,
                'transaction': serializers.InventoryTransactionSerializer(inventory_transaction).data
            },
            status=status.HTTP_200_OK
        )

    @action(methods=['post'], detail=True, url_path='export-stock')
    def export_stock(self, request, pk=None):
        quantity = int(request.data.get('quantity', 0))
        note = request.data.get('note')

        if quantity <= 0:
            raise ValidationError({'quantity': 'Quantity must be greater than 0.'})

        with transaction.atomic():
            medicine = Medicine.objects.select_for_update().get(pk=pk, active=True)
            if medicine.stock < quantity:
                raise ValidationError({'quantity': 'Not enough stock to export.'})

            stock_before = medicine.stock
            medicine.stock = stock_before - quantity
            medicine.save(update_fields=['stock'])

            inventory_transaction = InventoryTransaction.objects.create(
                medicine=medicine,
                type=InventoryTransaction.Type.EXPORT,
                quantity=quantity,
                stock_before=stock_before,
                stock_after=medicine.stock,
                note=note,
                created_by=request.user
            )

        return Response(
            {
                'medicine': serializers.MedicineSerializer(medicine).data,
                'transaction': serializers.InventoryTransactionSerializer(inventory_transaction).data
            },
            status=status.HTTP_200_OK
        )

    @action(methods=['post'], detail=True, url_path='adjust-stock')
    def adjust_stock(self, request, pk=None):
        new_stock = request.data.get('new_stock')
        note = request.data.get('note')

        if new_stock is None:
            raise ValidationError({'new_stock': 'new_stock is required.'})

        new_stock = int(new_stock)
        if new_stock < 0:
            raise ValidationError({'new_stock': 'new_stock cannot be negative.'})

        with transaction.atomic():
            medicine = Medicine.objects.select_for_update().get(pk=pk, active=True)
            stock_before = medicine.stock
            medicine.stock = new_stock
            medicine.save(update_fields=['stock'])

            inventory_transaction = InventoryTransaction.objects.create(
                medicine=medicine,
                type=InventoryTransaction.Type.ADJUST,
                quantity=abs(new_stock - stock_before),
                stock_before=stock_before,
                stock_after=medicine.stock,
                note=note,
                created_by=request.user
            )

        return Response(
            {
                'medicine': serializers.MedicineSerializer(medicine).data,
                'transaction': serializers.InventoryTransactionSerializer(inventory_transaction).data
            },
            status=status.HTTP_200_OK
        )

