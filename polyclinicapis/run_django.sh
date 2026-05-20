
echo "=== Tạo superuser ==="
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=Admin@123



python manage.py createsuperuser --no-input || echo "SuperUser đã tồn tại!"

echo "=== Chen du lieu mau ==="
python manage.py shell <<EOF
from polyclinic.models import User, Specialty, ServicesSpecialty, StaffProfile, PatientProfile, WorkSchedule, TimeSlot, StaffSpecialty
import datetime

s1, _ = Specialty.objects.get_or_create(name='Noi tong quat', description='Kham noi khoa tong quat')
s2, _ = Specialty.objects.get_or_create(name='Nhi khoa', description='Kham va dieu tri tre em')
s3, _ = Specialty.objects.get_or_create(name='Da lieu', description='Kham va dieu tri benh da')

dv1, _ = ServicesSpecialty.objects.get_or_create(name='Kham tong quat', description='Kham suc khoe tong quat', price=200000)
dv1.Specialty.set([s1])
dv2, _ = ServicesSpecialty.objects.get_or_create(name='Kham nhi', description='Kham suc khoe tre em', price=150000)
dv2.Specialty.set([s2])
dv3, _ = ServicesSpecialty.objects.get_or_create(name='Kham da lieu', description='Kham va tu van da lieu', price=250000)
dv3.Specialty.set([s3])

d1 = User.objects.create_user(username='bsnguyenvana', password='bs@123', first_name='Van A', last_name='Nguyen', role='doctor', email='bsnguyenvana@gmail.com', phone='0901111111')
d2 = User.objects.create_user(username='bstranthib', password='bs@123', first_name='Thi B', last_name='Tran', role='doctor', email='bstranthib@gmail.com', phone='0902222222')

sp1 = StaffProfile.objects.create(user=d1, degree='Tien si Y khoa', experience='10 nam kinh nghiem', fee=300000)
StaffSpecialty.objects.create(staff=sp1, specialty=s1)
sp2 = StaffProfile.objects.create(user=d2, degree='Thac si Y khoa', experience='5 nam kinh nghiem', fee=200000)
StaffSpecialty.objects.create(staff=sp2, specialty=s2)

p1 = User.objects.create_user(username='bnlethic', password='bn@123', first_name='Thi C', last_name='Le', role='patient', email='bnlethic@gmail.com', phone='0903333333')
p2 = User.objects.create_user(username='bnphamvand', password='bn@123', first_name='Van D', last_name='Pham', role='patient', email='bnphamvand@gmail.com', phone='0904444444')

PatientProfile.objects.create(user=p1, height=160, weight=50, blood_group='A+')
PatientProfile.objects.create(user=p2, height=170, weight=65, blood_group='O+')

ws1, _ = WorkSchedule.objects.get_or_create(staff_profile=sp1, date=datetime.date(2025, 6, 10))
TimeSlot.objects.get_or_create(work_schedule=ws1, start_time='08:00', end_time='08:30')
TimeSlot.objects.get_or_create(work_schedule=ws1, start_time='08:30', end_time='09:00')
TimeSlot.objects.get_or_create(work_schedule=ws1, start_time='09:00', end_time='09:30')

ws2, _ = WorkSchedule.objects.get_or_create(staff_profile=sp2, date=datetime.date(2025, 6, 11))
TimeSlot.objects.get_or_create(work_schedule=ws2, start_time='13:00', end_time='13:30')
TimeSlot.objects.get_or_create(work_schedule=ws2, start_time='13:30', end_time='14:00')

print("Seed data thanh cong!")
EOF