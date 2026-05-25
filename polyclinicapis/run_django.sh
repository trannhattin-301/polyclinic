
echo "=== Tạo superuser ==="
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=Admin@123

python manage.py createsuperuser --no-input || echo "SuperUser đã tồn tại!"

echo "=== Chen du lieu mau ==="
python seed_data.py

Client_id:42kqtXSm0XIZHk5Qy7drK5kfQ0BnHo6vpjK8G0xq
client_secret:5hTrEobTbiCFQsIjaFi8a0AGBG1GEfwheKpfltusGedzogbIdgo59k5TH7RJ9XOHLZRcYg1RvJwZQ7dgnXBEVIqvzWkc5uXRe8KJq9Ui9A3FDHyD50QaStng1KfLShDG