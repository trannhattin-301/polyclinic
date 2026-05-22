from rest_framework import serializers
from .models import (
    User, Specialty, ServicesSpecialty,
    StaffProfile, StaffSpecialty,
    PatientProfile, WorkSchedule, TimeSlot,
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
    class Meta:
        model = ServicesSpecialty
        fields = ['id', 'name', 'description', 'price', 'active', 'Specialty']
        extra_kwargs = {
            'Specialty': {'required': False},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Specialty'] = SpecialtySerializer(instance.Specialty, many=True).data
        return data

    def create(self, validated_data):
        specialties = validated_data.pop('Specialty', [])
        service = ServicesSpecialty.objects.create(**validated_data)
        service.Specialty.set(specialties)
        return service

    def update(self, instance, validated_data):
        specialties = validated_data.pop('Specialty', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if specialties is not None:
            instance.Specialty.set(specialties)
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


# Work Schedule
class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = ['id', 'staff_profile', 'date', 'active']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['staff_profile'] = SimpleUserSerializer(instance.staff_profile.user).data
        return data

# Time slot
class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'work_schedule', 'start_time', 'end_time', 'status', 'active']