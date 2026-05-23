import os, django
from datetime import date, time, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'polyclinicapis.settings')
django.setup()

from polyclinic.models import User, Specialty, StaffProfile, StaffSpecialty, ServicesSpecialty, WorkSchedule, TimeSlot, MedicineCategory, Medicine

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

# seed data cho bang Danh muc thuoc
medicine_categories = [
    ("Giam dau - Ha sot", "Thuoc giam dau, ha sot thong dung"),
    ("Khang sinh", "Thuoc dieu tri nhiem khuan"),
    ("Tieu hoa", "Thuoc ho tro tieu hoa, da day, ruot"),
    ("Ho hap", "Thuoc dieu tri ho, cam, viem duong ho hap"),
    ("Da lieu", "Thuoc boi, thuoc uong dieu tri benh da lieu"),
    ("Vitamin - Khoang chat", "Vitamin va khoang chat bo sung"),
]

for name, description in medicine_categories:
    MedicineCategory.objects.get_or_create(
        name=name,
        defaults={"description": description}
    )

# seed data cho bang Thuoc
medicines = [
    {
        "category": "Giam dau - Ha sot",
        "name": "Paracetamol 500mg",
        "ingredient": "Paracetamol",
        "description": "Giam dau, ha sot cho cac trieu chung thong thuong",
        "unit": Medicine.Unit.TABLET,
        "price": 1500,
        "stock": 2000,
        "low_stock_threshold": 200,
        "expiry_date": date.today() + timedelta(days=540),
    },
    {
        "category": "Khang sinh",
        "name": "Amoxicillin 500mg",
        "ingredient": "Amoxicillin",
        "description": "Khang sinh penicillin pho bien dieu tri nhiem khuan ho hap, tai mui hong",
        "unit": Medicine.Unit.CAPSULE,
        "price": 2500,
        "stock": 1500,
        "low_stock_threshold": 150,
        "expiry_date": date.today() + timedelta(days=450),
    },
    {
        "category": "Tieu hoa",
        "name": "Smecta",
        "ingredient": "Diosmectite",
        "description": "Ho tro dieu tri tieu chay cap va roi loan tieu hoa",
        "unit": Medicine.Unit.PACK,
        "price": 3500,
        "stock": 800,
        "low_stock_threshold": 100,
        "expiry_date": date.today() + timedelta(days=365),
    },
    {
        "category": "Tieu hoa",
        "name": "Omeprazole 20mg",
        "ingredient": "Omeprazole",
        "description": "Giam tiet acid da day, ho tro dieu tri viem loet da day",
        "unit": Medicine.Unit.CAPSULE,
        "price": 3000,
        "stock": 1200,
        "low_stock_threshold": 120,
        "expiry_date": date.today() + timedelta(days=480),
    },
    {
        "category": "Ho hap",
        "name": "Acetylcysteine 200mg",
        "ingredient": "Acetylcysteine",
        "description": "Long dom, ho tro dieu tri ho co dom",
        "unit": Medicine.Unit.PACK,
        "price": 2800,
        "stock": 900,
        "low_stock_threshold": 100,
        "expiry_date": date.today() + timedelta(days=400),
    },
    {
        "category": "Ho hap",
        "name": "Cetirizine 10mg",
        "ingredient": "Cetirizine dihydrochloride",
        "description": "Giam trieu chung di ung, so mui, viem mui di ung",
        "unit": Medicine.Unit.TABLET,
        "price": 1800,
        "stock": 1400,
        "low_stock_threshold": 150,
        "expiry_date": date.today() + timedelta(days=500),
    },
    {
        "category": "Da lieu",
        "name": "Clotrimazole Cream",
        "ingredient": "Clotrimazole",
        "description": "Thuoc boi da khang nam",
        "unit": Medicine.Unit.TUBE,
        "price": 22000,
        "stock": 300,
        "low_stock_threshold": 40,
        "expiry_date": date.today() + timedelta(days=360),
    },
    {
        "category": "Vitamin - Khoang chat",
        "name": "Vitamin C 500mg",
        "ingredient": "Ascorbic acid",
        "description": "Bo sung vitamin C, ho tro de khang",
        "unit": Medicine.Unit.TABLET,
        "price": 1200,
        "stock": 2500,
        "low_stock_threshold": 250,
        "expiry_date": date.today() + timedelta(days=600),
    },
]

for item in medicines:
    category = MedicineCategory.objects.filter(name=item["category"]).first()
    if category:
        Medicine.objects.get_or_create(
            name=item["name"],
            defaults={
                "category": category,
                "ingredient": item["ingredient"],
                "description": item["description"],
                "unit": item["unit"],
                "price": item["price"],
                "stock": item["stock"],
                "low_stock_threshold": item["low_stock_threshold"],
                "expiry_date": item["expiry_date"],
                "active": True,
            }
        )
    else:
        print(f"Khong tim thay danh muc thuoc: {item['category']}")

# Seed data cho schedule,
# WorkSchedule: 5 bac si x 7 ngay = 35
# TimeSlot: 5 bac si x 7 ngay x 11 khung gio = 385 dong
today = date.today()

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
for staff in StaffProfile.objects.filter(active=True):
    for i in range(7):
        work_schedule, created = WorkSchedule.objects.get_or_create(staff_profile=staff, date=today + timedelta(days=i), defaults={"active": True})

        for start, end in TIME_SLOTS:
            TimeSlot.objects.get_or_create(work_schedule=work_schedule, start_time=start, defaults={"end_time": end, "status": TimeSlot.Status.AVAILABLE, "active": True})


print("Da chen du lieu mau thanh cong!")
