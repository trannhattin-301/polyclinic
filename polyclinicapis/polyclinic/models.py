from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from cloudinary.models import CloudinaryField


# Role
class RoleChoices(models.TextChoices):
    DOCTOR = 'doctor', 'Doctor'
    NURSE = 'nurse', 'Nurse'
    PATIENT = 'patient', 'Patient'

# Giới tính
class GenderChoices(models.TextChoices):
    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'
    OTHER = 'other', 'Other'

# Người dùng
class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    avatar = CloudinaryField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=RoleChoices.choices,  default=RoleChoices.PATIENT)
    created_at = models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.username


# Bệnh nhân
class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GenderChoices.choices, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    insurance_number = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'patient'

    def __str__(self):
        return self.user.username


# Chuyên khoa
class Specialty(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'specialty'

    def __str__(self):
        return self.name


# Bác sĩ
class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True)
    degree = models.CharField(max_length=255,default='')
    description = models.TextField(blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    active_online = models.BooleanField(default=False)

    class Meta:
        db_table = 'doctor'

    def __str__(self):
        return self.user.username


# Y tá
class Nurse(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    work_room = models.CharField(max_length=100, blank=True, null=True)
    active_online = models.BooleanField(default=False)

    class Meta:
        db_table = 'nurse'

    def __str__(self):
        return self.user.username