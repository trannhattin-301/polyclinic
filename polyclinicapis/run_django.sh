
#echo "=== Tạo superuser ==="
#export DJANGO_SUPERUSER_USERNAME=admin
#export DJANGO_SUPERUSER_EMAIL=admin@example.com
#export DJANGO_SUPERUSER_PASSWORD=Admin@123

#python manage.py createsuperuser --no-input || echo "SuperUser đã tồn tại!"

echo "=== Chen du lieu mau ==="
python seed_data.py