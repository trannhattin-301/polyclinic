
echo "=== Tạo superuser ==="
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=Admin@123

python manage.py createsuperuser --no-input || echo "SuperUser đã tồn tại!"

echo "=== Chen du lieu mau ==="
python seed_data.py

Client_id:R4fOkaPaP8WNCZSulz9BFbN5leKfToNcwEftXRKl
client_secret:M7g8KfMU9XuDBEeg2ZCgfTdaiU8Ov3RXO5RCHkh85zJrmFiZwqh9c6LZUJ0y32cj5md64zoAEIQh6PRn0QYBxjZshi7bvEljw8RvTTtljlQpolfE2K2w0n4N0NnQzRtT