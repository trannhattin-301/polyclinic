from rest_framework import serializers
from .models import (
    User, Specialty, ServicesSpecialty,
    StaffProfile, StaffSpecialty,
    PatientProfile, WorkSchedule, TimeSlot, Appointment,
    MedicalRecord, MedicineCategory, Medicine
)

# User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name',
                  'email', 'phone', 'role', 'gender', 'dob', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'write_only': True},
            'avatar': {'required': False},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role in [User.Role.DOCTOR, User.Role.NURSE]:
            StaffProfile.objects.create(user=user)

        elif user.role == User.Role.PATIENT:
            PatientProfile.objects.create(
                user=user,
                height=profile_data.get('height'),
                weight=profile_data.get('weight'),
                insurance_number=profile_data.get('insurance_number'),
                insurance_expiry_date=profile_data.get('insurance_expiry_date'),
                blood_group=profile_data.get('blood_group'),
                allergy_history=profile_data.get('allergy_history'),
            )

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class SimpleUserSerializer(UserSerializer):
    class Meta:
        model = UserSerializer.Meta.model
        fields = ['id', 'first_name', 'last_name', 'avatar', 'role']
        extra_kwargs = UserSerializer.Meta.extra_kwargs


# Specialty
class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description']


# Services Specialty
class ServicesSpecialtySerializer(serializers.ModelSerializer):
    specialties = serializers.PrimaryKeyRelatedField(
        queryset=Specialty.objects.filter(active=True),
        many=True,
        required=False
    )

    class Meta:
        model = ServicesSpecialty
        fields = ['id', 'name', 'description', 'price', 'active', 'specialties']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['specialties'] = SpecialtySerializer(instance.specialties.all(), many=True).data
        return data

    def create(self, validated_data):
        specialties = validated_data.pop('specialties', [])
        service = ServicesSpecialty.objects.create(**validated_data)
        service.specialties.set(specialties)
        return service

    def update(self, instance, validated_data):
        specialties = validated_data.pop('specialties', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if specialties is not None:
            instance.specialties.set(specialties)

        return instance


# Staff Specialty
class StaffSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffSpecialty
        fields = ['id', 'staff', 'specialty', 'active']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['specialty'] = SpecialtySerializer(instance.specialty).data
        return data

    def validate(self, attrs):
        staff     = attrs.get('staff')
        specialty = attrs.get('specialty')
        qs = StaffSpecialty.objects.filter(staff=staff, specialty=specialty)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Nhân viên này đã được gán chuyên khoa đó rồi.')
        return attrs


# Staff Profile

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ['id', 'user', 'degree', 'experience', 'fee', 'active', 'specialties']
        extra_kwargs = {
            'specialties': {'required': False},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user']        = SimpleUserSerializer(instance.user).data
        data['specialties'] = SpecialtySerializer(instance.specialties, many=True).data
        return data

    def create(self, validated_data):
        specialties = validated_data.pop('specialties', [])
        profile = StaffProfile.objects.create(**validated_data)
        for specialty in specialties:
            StaffSpecialty.objects.create(staff=profile, specialty=specialty)
        return profile

    def update(self, instance, validated_data):
        specialties = validated_data.pop('specialties', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if specialties is not None:
            StaffSpecialty.objects.filter(staff=instance).delete()
            for specialty in specialties:
                StaffSpecialty.objects.create(staff=instance, specialty=specialty)
        return instance


# Patient Profile
class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'height', 'weight',
                  'insurance_number', 'insurance_expiry_date',
                  'blood_group', 'allergy_history', 'active']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = SimpleUserSerializer(instance.user).data
        return data

    def validate_insurance_expiry_date(self, value):
        from datetime import date
        if value and value < date.today():
            raise serializers.ValidationError('Ngày hết hạn bảo hiểm đã qua.')
        return value



# Time slot
class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'work_schedule', 'start_time', 'end_time', 'status', 'active']


# Work Schedule
class WorkScheduleSerializer(serializers.ModelSerializer):
    time_slots = TimeSlotSerializer(many=True, read_only=True)

    class Meta:
        model = WorkSchedule
        fields = ['id', 'staff_profile', 'date', 'active', 'time_slots']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['staff_profile'] = {
            'id': instance.staff_profile.id,
            'user': SimpleUserSerializer(instance.staff_profile.user).data,
            'degree': instance.staff_profile.degree,
            'experience': instance.staff_profile.experience,
            'fee': instance.staff_profile.fee,
        }

        data['time_slots'] = TimeSlotSerializer(
            instance.time_slots.filter(active=True),
            many=True
        ).data

        return data

# Appointment
class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'disease_description', 'status', 'time_slot', 'services', 'created_date', 'updated_date']
        extra_kwargs = {'patient': {'read_only': True}, 'status': {'read_only': True}, 'services': {'required': False}}

    def create(self, validated_data):
        services = validated_data.pop('services', [])
        appointment = Appointment.objects.create(**validated_data)
        appointment.services.set(services)
        return appointment

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['patient_name'] = instance.patient.get_full_name() or instance.patient.username
        data['doctor_id'] = instance.doctor.id
        data['doctor_name'] = instance.doctor.user.get_full_name() or instance.doctor.user.username
        data['time_slot_detail'] = {'id': instance.time_slot.id, 'start_time': instance.time_slot.start_time, 'end_time': instance.time_slot.end_time}
        data['work_schedule'] = {'id': instance.time_slot.work_schedule.id, 'date': instance.time_slot.work_schedule.date}
        data['services_detail'] = [{'id': service.id, 'name': service.name, 'price': service.price} for service in instance.services.all()]
        return data


# Medical Record
class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'appointment', 'diagnosis', 'medical_notes',
            'follow_up_date', 'active', 'created_date', 'updated_date'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        appointment = instance.appointment

        data['appointment_detail'] = {
            'id': appointment.id,
            'status': appointment.status,
            'disease_description': appointment.disease_description,
            'created_date': appointment.created_date,
            'time_slot': {
                'id': appointment.time_slot.id,
                'start_time': appointment.time_slot.start_time,
                'end_time': appointment.time_slot.end_time,
            },
            'work_schedule': {
                'id': appointment.time_slot.work_schedule.id,
                'date': appointment.time_slot.work_schedule.date,
            },
        }
        data['patient'] = {
            'id': appointment.patient.id,
            'name': appointment.patient.get_full_name() or appointment.patient.username,
        }
        data['doctor'] = {
            'id': appointment.doctor.id,
            'name': appointment.doctor.user.get_full_name() or appointment.doctor.user.username,
        }

        return data

# Medicine
class MedicineCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineCategory
        fields = ['id', 'name', 'description', 'active']


class MedicineSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=MedicineCategory.objects.filter(active=True),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Medicine
        fields = [
            'id', 'category', 'name', 'ingredient', 'description',
            'unit', 'price', 'stock', 'expiry_date', 'active'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category'] = (
            MedicineCategorySerializer(instance.category).data
            if instance.category else None
        )
        data['is_available'] = instance.is_available()
        data['is_low_stock'] = instance.is_low_stock()
        data['is_expired'] = instance.is_expired()
        data['is_near_expiry'] = instance.is_near_expiry()
        return data