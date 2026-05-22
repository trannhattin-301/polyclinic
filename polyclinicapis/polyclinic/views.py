from rest_framework import viewsets, generics, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from polyclinic import serializers
from polyclinic.models import User, Specialty, ServicesSpecialty, StaffProfile, PatientProfile, WorkSchedule, TimeSlot
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


class ServicesSpecialtyViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = ServicesSpecialty.objects.filter(active=True)
    serializer_class = serializers.ServicesSpecialtySerializer

    def get_queryset(self):
        query = self.queryset

        specialty_id = self.request.query_params.get('specialty_id')
        if specialty_id:
            query = query.filter(Specialty=specialty_id)

        return query


class StaffProfileViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = StaffProfile.objects.filter(active=True)
    serializer_class = serializers.StaffProfileSerializer

    def get_queryset(self):
        query = self.queryset

        specialty_id = self.request.query_params.get('specialty_id')
        if specialty_id:
            query = query.filter(specialties=specialty_id)

        return query

    @action(methods=['get'], url_path='schedules', detail=True)
    def schedules(self, request, pk):
        schedules = self.get_object().work_schedule.filter(active=True)
        return Response(serializers.WorkScheduleSerializer(schedules, many=True).data, status=status.HTTP_200_OK)


class PatientProfileViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = PatientProfile.objects.filter(active=True)
    serializer_class = serializers.PatientProfileSerializer
    permission_classes = [perms.IsPatient]

    def get_object(self):
        return self.request.user.patient_profile


class WorkScheduleViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    serializer_class = serializers.WorkScheduleSerializer
    permission_classes = [perms.IsDoctor]

    def get_queryset(self):
        return WorkSchedule.objects.filter(
            staff_profile__user=self.request.user,
            active=True
        )

    def perform_create(self, serializer):
        serializer.save(staff_profile=self.request.user.staff_profile)

    @action(methods=['get'], url_path='time-slots', detail=True)
    def time_slots(self, request, pk):
        slots = self.get_object().time_slots.filter(active=True)
        return Response(serializers.TimeSlotSerializer(slots, many=True).data, status=status.HTTP_200_OK)


class TimeSlotViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    serializer_class = serializers.TimeSlotSerializer
    permission_classes = [perms.IsDoctor]

    def get_queryset(self):
        return TimeSlot.objects.filter(active=True)

    @action(methods=['post'], url_path='book', detail=True, permission_classes=[perms.IsPatient])
    def book(self, request, pk):
        slot = self.get_object()
        if slot.status.__eq__(TimeSlot.Status.BOOKED):
            return Response({'detail': 'Slot đã được đặt.'}, status=status.HTTP_400_BAD_REQUEST)
        slot.status = TimeSlot.Status.BOOKED
        slot.save()
        return Response(serializers.TimeSlotSerializer(slot).data, status=status.HTTP_200_OK)