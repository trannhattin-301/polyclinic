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
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, related_name='doctors',null=True)
    degree    = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    fee         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    active_online = models.BooleanField(default=False)

    class Meta:
        db_table = 'doctor'

    def save(self, *args, **kwargs):
        self.user.user_role = UserRole.DOCTOR
        self.user.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Patient(models.Model):
    user             = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    dob              = models.DateField(blank=True, null=True)
    gender           = models.CharField(max_length=10, blank=True, null=True)
    address          = models.CharField(max_length=255, blank=True, null=True)
    medical_history  = models.TextField(blank=True, null=True)
    allergy          = models.TextField(blank=True, null=True)
    insurance_number = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'patient'

    def save(self, *args, **kwargs):
        self.user.user_role = UserRole.PATIENT
        self.user.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Manager(models.Model):
    user      = models.OneToOneField(User, on_delete=models.CASCADE, related_name='manager_profile')
    hire_date = models.DateField(blank=True, null=True)  # Ngày vào làm
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'manager'

    def save(self, *args, **kwargs):
        self.user.user_role = UserRole.MANAGER
        self.user.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class WorkSchedule(models.Model):
    doctor        = models.ForeignKey(Doctor,on_delete=models.CASCADE,related_name='work_schedule')
    ngay          = models.DateField()
    start_time   = models.TimeField()
    end_time  = models.TimeField()

    class Meta:
        db_table = 'work_schedule'

    def __str__(self):
        return f"{self.doctor.user.get_full_name()} - {self.ngay}"

class Appointment(models.Model):
    patient       = models.ForeignKey(Patient,on_delete=models.CASCADE,related_name='appointments')
    doctor        = models.ForeignKey(Doctor,on_delete=models.CASCADE,related_name='appointments',)
    work_schedule = models.ForeignKey(WorkSchedule,on_delete=models.SET_NULL,null=True,related_name='appointments',)
    appointment_time = models.DateTimeField()
    status    = models.CharField(max_length=50, blank=True, null=True)
    reason    = models.TextField(blank=True, null=True)
    examination_method     = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'apointment'

    def __str__(self):
        return f"Lịch hẹn {self.id} - {self.patient.user.get_full_name()}"