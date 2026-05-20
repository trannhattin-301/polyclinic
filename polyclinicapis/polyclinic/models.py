from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

AbstractUser.username.field.error_messages["unique"] = 'Tên đã tồn tại !'

class User(AbstractUser):
    avatar    = CloudinaryField(null=True, blank=True)
    phone = models.CharField(max_length=10, blank=True, null=True,unique=True)
    email = models.EmailField(max_length=255, blank=True, null=True,unique=True)

    class Role(models.TextChoices):
        PATIENT="patient"
        DOCTOR="doctor"
        NURSER="nurser"

    class Gender(models.TextChoices):
        MALE="male"
        FEMALE="female"
        OTHER="other"

    role = models.CharField(choices=Role.choices, default=Role.PATIENT, max_length=10)
    gender = models.CharField(choices=Gender.choices, default=Gender.OTHER, max_length=10,null=True,blank=True)
    dob = models.DateField(blank=True, null=True)

class Specialty(BaseModel):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class ServicesSpecialty(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(decimal_places=2, max_digits=10, default=0)
    Specialty=models.ManyToManyField(Specialty,blank=True)

class StaffProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name="staff_profile")
    specialties = models.ManyToManyField(Specialty,blank=True,through="staffSpecialty")
    degree=models.CharField(max_length=100,blank=True,null=True)
    experience=models.TextField(blank=True,null=True)
    fee=models.FloatField(blank=True,null=True,default=0)

    def __str__(self):
        return self.user.get_full_name()

class StaffSpecialty(BaseModel):
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE)
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = [("staff", "specialty")]

    def __str__(self):
        return f"{self.staff} - {self.specialty}"

class PatientProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name="patient_profile")
    height = models.FloatField(null=True, blank=True, help_text="cm")
    weight = models.FloatField(null=True, blank=True, help_text="kg")
    insurance_number = models.CharField(max_length=50, null=True, blank=True)
    insurance_expiry_date = models.DateField(null=True, blank=True)
    Blood_Group_Choices=[
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    blood_group = models.CharField(choices=Blood_Group_Choices, max_length=10,null=True, blank=True)
    allergy_history=models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.get_full_name()

class WorkSchedule(BaseModel):
    staff_profile = models.ForeignKey("StaffProfile", on_delete=models.CASCADE,related_name="work_schedule")
    date = models.DateField(blank=True, null=True)

    class Meta:
        unique_together = [("staff_profile", "date")]
        ordering = ["date"]

class TimeSlot(BaseModel):
    class Status(models.TextChoices):
        AVAILABLE = "available",  "Còn trống"
        BOOKED    = "booked",     "Đã đặt"

    work_schedule = models.ForeignKey(WorkSchedule, on_delete=models.CASCADE,related_name="time_slots")
    start_time = models.TimeField()
    end_time   = models.TimeField()
    status     = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )

    class Meta:
        unique_together = ("work_schedule", "start_time")
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.work_schedule.date} | {self.start_time} - {self.end_time} ({self.status})"

