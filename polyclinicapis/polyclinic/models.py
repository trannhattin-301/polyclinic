from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from cloudinary.models import CloudinaryField

<<<<<<< Updated upstream
=======
class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

AbstractUser.username.field.error_messages["unique"] = 'Tên đã tồn tại !'
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    avatar = CloudinaryField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=RoleChoices.choices,  default=RoleChoices.PATIENT)
    created_at = models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        pass
    def __str__(self):
        return self.username
=======
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
>>>>>>> Stashed changes

    role = models.CharField(choices=Role.choices, default=Role.PATIENT, max_length=10)
    gender = models.CharField(choices=Gender.choices, default=Gender.OTHER, max_length=10,null=True,blank=True)
    dob = models.DateField(blank=True, null=True)

<<<<<<< Updated upstream
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
        pass
    def __str__(self):
        return self.user.username


# Chuyên khoa
class Specialty(models.Model):
    name = models.CharField(max_length=100)
=======
class Specialty(BaseModel):
    name        = models.CharField(max_length=100, unique=True)
>>>>>>> Stashed changes
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        pass
    def __str__(self):
        return self.name


<<<<<<< Updated upstream
# Bác sĩ
class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True)
    degree = models.CharField(max_length=255,default='')
    description = models.TextField(blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    active_online = models.BooleanField(default=False)

    class Meta:
        pass
    def __str__(self):
        return self.user.username


# Y tá
class Nurse(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    work_room = models.CharField(max_length=100, blank=True, null=True)
    active_online = models.BooleanField(default=False)

    class Meta:
        pass
    def __str__(self):
        return self.user.username
=======
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

>>>>>>> Stashed changes
