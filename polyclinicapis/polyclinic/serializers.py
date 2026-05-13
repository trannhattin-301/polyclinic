from rest_framework import serializers
from polyclinic.models import User, Doctor, Patient, Specialty, Nurse

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'avatar', 'role', 'created_at', 'password']
        read_only_fields = ['id', 'created_at', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    # Tùy chỉnh JSON trả về, ví dụ avatar thành URL
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    # hash password trước khi lưu
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description', 'icon']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user', write_only=True)
    specialty = SpecialtySerializer(read_only=True)
    specialty_id = serializers.PrimaryKeyRelatedField(queryset=Specialty.objects.all(),source='specialty',write_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'user_id', 'specialty', 'specialty_id',
                  'degree', 'description', 'consultation_fee', 'active_online']


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'user', 'date_of_birth', 'gender',
                  'address', 'blood_group', 'medical_history', 'insurance_number']


class NurseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Nurse
        fields = ['id', 'user', 'description', 'work_room', 'active_online']