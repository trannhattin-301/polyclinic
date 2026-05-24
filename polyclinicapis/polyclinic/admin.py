from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Specialty, StaffProfile, WorkSchedule, TimeSlot, Appointment, MedicineCategory, Medicine

admin.site.register(User)
admin.site.register(Specialty)
admin.site.register(StaffProfile)
admin.site.register(WorkSchedule)
admin.site.register(TimeSlot)
admin.site.register(Appointment)
admin.site.register(MedicineCategory)
admin.site.register(Medicine)