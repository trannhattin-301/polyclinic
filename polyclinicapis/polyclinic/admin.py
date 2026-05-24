from django.contrib import admin
from .models import User, Specialty, StaffProfile, WorkSchedule, TimeSlot, Appointment

admin.site.register(User)
admin.site.register(Specialty)
admin.site.register(StaffProfile)
admin.site.register(WorkSchedule)
admin.site.register(TimeSlot)
admin.site.register(Appointment)


