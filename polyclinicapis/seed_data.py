import os, django
from datetime import date, time, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'polyclinicapis.settings')
django.setup()

from polyclinic.models import User, Specialty, StaffProfile, StaffSpecialty, ServicesSpecialty, WorkSchedule, TimeSlot

# seed data cho bảng Chuyên khoa
specialties = [
    ("Noi tong quat", "Kham noi khoa tong quat"),
    ("Nhi khoa", "Kham va dieu tri tre em"),
    ("Da lieu", "Kham va dieu tri benh da lieu"),
    ("Tai mui hong", "Kham va dieu tri cac benh tai mui hong"),
    ("Rang ham mat", "Kham va dieu tri rang ham mat"),
]

for name, description in specialties:
    Specialty.objects.get_or_create(name=name, defaults={"description": description})

# seed data cho bảng Staff
staffs = [
    ("bacsi_noi", "bacsi_noi@example.com", "Nguyen", "Van Noi", "0900000001", "Bac si chuyen khoa I", 5, 150000),
    ("bacsi_nhi", "bacsi_nhi@example.com", "Tran", "Thi Nhi", "0900000002", "Thac si Bac si", 7, 180000),
    ("bacsi_dalieu", "bacsi_dalieu@example.com", "Le", "Van Da", "0900000003", "Bac si chuyen khoa Da lieu", 4, 160000),
    ("bacsi_tmh", "bacsi_tmh@example.com", "Pham", "Thi Hong", "0900000004", "Bac si Tai mui hong", 6, 170000),
    ("bacsi_rhm", "bacsi_rhm@example.com", "Hoang", "Van Rang", "0900000005", "Bac si Rang ham mat", 8, 200000),
]

for username, email, first_name, last_name, phone, degree, experience, fee in staffs:
    user, created = User.objects.get_or_create(username=username, defaults={"email": email, "first_name": first_name, "last_name": last_name, "phone": phone, "role": "staff"})
    user.set_password("123456")     # dù user mới tạo hay đã tồn tại, đều set password lại.
    user.save()
    StaffProfile.objects.get_or_create(user=user, defaults={"degree": degree, "experience": experience, "fee": fee})

# seed data cho bảng
mapping = [
    ("bacsi_noi", "Noi tong quat"),
    ("bacsi_nhi", "Nhi khoa"),
    ("bacsi_dalieu", "Da lieu"),
    ("bacsi_tmh", "Tai mui hong"),
    ("bacsi_rhm", "Rang ham mat"),
]

for username, specialty_name in mapping:
    staff = StaffProfile.objects.filter(user__username=username).first()
    specialty = Specialty.objects.filter(name=specialty_name).first()

    if staff and specialty:
        StaffSpecialty.objects.get_or_create(
            staff=staff,
            specialty=specialty
        )
    else:
        print(f"Khong tim thay: {username} - {specialty_name}")

# seed data cho bảng Dịch vụ
data = [
    {"name": "Kham tong quat", "description": "Dich vu kham suc khoe tong quat", "price": 150000, "specialties": ["Noi tong quat"]},
    {"name": "Kham nhi", "description": "Kham va tu van suc khoe cho tre em", "price": 180000, "specialties": ["Nhi khoa"]},
    {"name": "Kham da lieu", "description": "Kham va dieu tri cac benh ngoai da", "price": 200000, "specialties": ["Da lieu"]},
    {"name": "Kham tai mui hong", "description": "Kham cac benh tai, mui, hong", "price": 170000, "specialties": ["Tai mui hong"]},
    {"name": "Kham rang ham mat", "description": "Kham va tu van rang ham mat", "price": 160000, "specialties": ["Rang ham mat"]},
]

for item in data:
    service, created = ServicesSpecialty.objects.get_or_create(name=item["name"], defaults={"description": item["description"], "price": item["price"], "active": True})
    service.specialties.set(Specialty.objects.filter(name__in=item["specialties"]))

# Seed data cho schedule,
# WorkSchedule: 5 bac si x 7 ngay = 35
# TimeSlot: 5 bac si x 7 ngay x 11 khung gio = 385 dong
TIME_SLOTS = [
    (time(7, 30), time(8, 0)),
    (time(8, 0), time(8, 30)),
    (time(8, 30), time(9, 0)),
    (time(9, 0), time(9, 30)),
    (time(9, 30), time(10, 0)),
    (time(10, 0), time(10, 30)),

    (time(13, 30), time(14, 0)),
    (time(14, 0), time(14, 30)),
    (time(14, 30), time(15, 0)),
    (time(15, 0), time(15, 30)),
    (time(15, 30), time(16, 0)),
]

today = date.today()

for staff in StaffProfile.objects.filter(active=True):
    for i in range(7):
        work_schedule, created = WorkSchedule.objects.get_or_create(staff_profile=staff, date=today + timedelta(days=i), defaults={"active": True})

        for start, end in TIME_SLOTS:
            TimeSlot.objects.get_or_create(work_schedule=work_schedule, start_time=start, defaults={"end_time": end, "status": TimeSlot.Status.AVAILABLE, "active": True})


print("Da chen du lieu mau thanh cong!")