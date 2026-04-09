from django.db.models import IntegerChoices
from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class UserRole(IntegerChoices):
    ADMIN   = 0, 'Admin'
    DOCTOR  = 1, 'Doctor'
    PATIENT = 2, 'Patient'
    MANAGER = 3, 'Manager'

class User(AbstractUser):
    avatar    = CloudinaryField(null=True, blank=True)
    user_role = models.IntegerField(
        choices=UserRole.choices,
        default=UserRole.PATIENT
    )
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='polyclinic_users',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='polyclinic_users_permissions',
        blank=True
    )

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.get_full_name() or self.username


class Specialty(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'specialty'

    def __str__(self):
        return self.name


class Doctor(models.Model):
    user      = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE, related_name='doctors')
    degree    = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    fee         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    active_online = models.BooleanField(default=False)

    class Meta:
        db_table = 'doctor'

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Patient(models.Model):  # ✅
    user             = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    dob              = models.DateField(blank=True, null=True)
    gender           = models.CharField(max_length=10, blank=True, null=True)
    address          = models.CharField(max_length=255, blank=True, null=True)
    medical_history  = models.TextField(blank=True, null=True)
    allergy          = models.TextField(blank=True, null=True)
    insurance_number = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'patient'

    def __str__(self):
        return self.user.get_full_name() or self.user.username