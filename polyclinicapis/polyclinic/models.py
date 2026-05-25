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
        PATIENT="patient", "Bệnh nhân"
        DOCTOR="doctor", "Bác sĩ"
        NURSE="nurse", "Y tá"

    class Gender(models.TextChoices):
        MALE = "male", "Nam"
        FEMALE = "female", "Nữ"
        OTHER = "other", "Khác"

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
    specialties=models.ManyToManyField(Specialty,blank=True)

class StaffProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name="staff_profile")
    specialties = models.ManyToManyField(Specialty,blank=True,through="staffSpecialty")
    degree=models.CharField(max_length=100,blank=True,null=True)
    experience=models.IntegerField(blank=True,null=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

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
    staff_profile = models.ForeignKey("StaffProfile", on_delete=models.CASCADE,related_name="work_schedules")
    date = models.DateField(null=True)


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

class Appointment(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Chờ xác nhận"
        CONFIRMED = "confirmed", "Đã xác nhận"
        IN_PROGRESS = "in_progress", "Đang khám"
        COMPLETED = "completed", "Hoàn thành"
        CANCELLED = "cancelled", "Đã hủy"

    patient = models.ForeignKey(User, on_delete=models.CASCADE,related_name="appointment_patient")
    disease_description=models.TextField(blank=True, null=True)
    status=models.CharField(choices=Status.choices, default=Status.PENDING, max_length=20)
    time_slot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE,related_name="appointment_time_slot")
    services=models.ManyToManyField(ServicesSpecialty,blank=True,related_name="appointment_services")

    class Meta:
        ordering = ["-created_date"]

    def __str__(self):
        return f"{self.patient} - {self.time_slot}"

    @property
    def doctor(self):
        return self.time_slot.work_schedule.staff_profile

class MedicalRecord(BaseModel):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE,related_name="medical_record")
    diagnosis=models.TextField()
    medical_notes=models.TextField(blank=True, null=True)
    follow_up_date=models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Bệnh án: {self.appointment.patient.get_full_name()}"

    def get_doctor(self):
        return self.appointment.doctor

    def get_patient(self):
        return self.appointment.patient

class MedicineCategory(BaseModel):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Medicine(BaseModel):
    class Unit(models.TextChoices):
        TABLET = "tablet", "Viên"
        CAPSULE = "capsule", "Nang"
        BOTTLE = "bottle", "Chai"
        TUBE = "tube", "Tuýp"
        VIAL = "vial", "Lọ tiêm"
        PACK = "pack", "Gói"
        OTHER = "other", "Khác"

    category = models.ForeignKey(MedicineCategory, on_delete=models.SET_NULL, null=True, blank=True,related_name="medicines")
    name = models.CharField(max_length=200)
    ingredient = models.TextField(blank=True, null=True, help_text="Hoạt chất")
    description = models.TextField(blank=True, null=True)
    unit = models.CharField(max_length=10, choices=Unit.choices, default=Unit.TABLET)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0, help_text="Số lượng tồn kho")
    low_stock_threshold = models.PositiveIntegerField(default=100, help_text="Low stock alert threshold")
    expiry_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.get_unit_display()})"

    def is_available(self):
        return self.stock > 0

    def is_low_stock(self):
        return self.stock <= self.low_stock_threshold

    def is_expired(self):
        from django.utils import timezone
        return self.expiry_date and self.expiry_date < timezone.now().date()

    def is_near_expiry(self):
        from django.utils import timezone
        if not self.expiry_date:
            return False
        delta = self.expiry_date - timezone.now().date()
        return 0 <= delta.days <= 30

class Prescription(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Đang tạo"
        CONFIRMED = "confirmed", "Hoàn tất"
        DISPENSED = "dispensed", "Đã phát"
        CANCELLED = "cancelled", "Đã hủy"

    medical_record = models.OneToOneField(MedicalRecord, on_delete=models.CASCADE, related_name="prescription_medical_record")
    notes          = models.TextField(blank=True, null=True, help_text="Lưu ý chung của đơn thuốc")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    dispensed_at = models.DateTimeField(null=True, blank=True)
    dispensed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="dispensed_prescriptions")

    def __str__(self):
        return f"Đơn thuốc: {self.medical_record.appointment.patient.get_full_name()}"

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())


class PrescriptionItem(BaseModel):
    class Frequency(models.TextChoices):
        ONCE_DAILY   = "1x_day",  "1 lần/ngày"
        TWICE_DAILY  = "2x_day",  "2 lần/ngày"
        THREE_DAILY  = "3x_day",  "3 lần/ngày"
        FOUR_DAILY   = "4x_day",  "4 lần/ngày"
        AS_NEEDED    = "as_needed", "Khi cần"

    class Timing(models.TextChoices):
        BEFORE_MEAL = "before_meal", "Trước ăn"
        AFTER_MEAL  = "after_meal",  "Sau ăn"
        WITH_MEAL   = "with_meal",   "Trong khi ăn"
        BEDTIME     = "bedtime",     "Trước khi ngủ"

    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="items")
    medicine     = models.ForeignKey(Medicine, on_delete=models.PROTECT, related_name="prescription_items")
    quantity     = models.PositiveIntegerField(help_text="Tổng số lượng")
    dosage       = models.CharField(max_length=50, help_text="Liều mỗi lần, vd: 1 viên, 2 viên")
    frequency    = models.CharField(max_length=20, choices=Frequency.choices)
    timing       = models.CharField(max_length=20, choices=Timing.choices, blank=True)
    duration_days= models.IntegerField(help_text="Số ngày uống")
    notes        = models.TextField(blank=True, null=True, help_text="Ghi chú riêng cho thuốc này")

    class Meta:
        unique_together = ("prescription", "medicine")

    def __str__(self):
        return f"{self.medicine.name} x{self.quantity}"

    @property
    def subtotal(self):
        return self.medicine.price * self.quantity

class InventoryTransaction(BaseModel):
    class Type(models.TextChoices):
        IMPORT = "import", "Nhập kho"
        EXPORT = "export", "Xuất kho"
        ADJUST = "adjust", "Điều chỉnh"
        DISPENSE = "dispense", "Cấp phát theo đơn"

    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT, related_name="inventory_transactions")
    type = models.CharField(max_length=20, choices=Type.choices)
    quantity = models.PositiveIntegerField()
    stock_before = models.PositiveIntegerField()
    stock_after = models.PositiveIntegerField()
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="inventory_transactions_created")
    prescription = models.ForeignKey(Prescription, on_delete=models.PROTECT, null=True, blank=True, related_name="inventory_transactions")
    prescription_item = models.ForeignKey(PrescriptionItem, on_delete=models.PROTECT, null=True, blank=True, related_name="inventory_transactions")

    class Meta:
        ordering = ["-created_date"]

    def __str__(self):
        return f"{self.medicine.name} | {self.type} | {self.quantity}"


class TestResult(BaseModel):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.PROTECT, related_name="test_results")
    test_name = models.CharField(max_length=200)
    result = models.TextField()
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,related_name="test_results_performed")
    performed_at = models.DateTimeField(null=True, blank=True)
    file = CloudinaryField(null=True, blank=True)

    def __str__(self):
        return f"{self.test_name} - {self.medical_record}"

class Invoice(BaseModel):
    class Status(models.TextChoices):
        UNPAID = "unpaid", "Chưa thanh toán"
        PAID   = "paid",   "Đã thanh toán"

    class PaymentMethod(models.TextChoices):
        CASH     = "cash",     "Tiền mặt"
        TRANSFER = "transfer", "Chuyển khoản"
        INSURANCE= "insurance","Bảo hiểm"

    appointment    = models.OneToOneField(Appointment, on_delete=models.PROTECT, related_name="invoice")
    status         = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, blank=True)
    paid_at        = models.DateTimeField(null=True, blank=True)
    total_amount   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes          = models.TextField(blank=True, null=True)

class ChatMessage(BaseModel):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE,  related_name="sent_messages")
    content = models.TextField()

    class Meta:
        ordering = ["created_date"]
