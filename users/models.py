from django.contrib.auth.models import AbstractUser
from django.db import models

class BaseModel(models.Model):
    ngay_tao = models.DateTimeField(auto_now_add=True)
    kich_hoat = models.BooleanField(default=True)

    class Meta:
        abstract = True

class VaiTro(models.Model):
    ten_vai_tro = models.CharField(max_length=50)
    mo_ta = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'vai_tro'

class TaiKhoan(AbstractUser):
    email = models.EmailField(max_length=150, unique=True)
    so_dien_thoai = models.CharField(max_length=20, blank=True, null=True)
    ho_ten = models.CharField(max_length=150)
    gioi_tinh = models.CharField(max_length=3, choices=[('NAM', 'Nam'), ('NU', 'Nữ')], blank=True, null=True)
    ngay_sinh = models.DateField(blank=True, null=True) # blank: TRUE: được để trống
    dia_chi = models.TextField(blank=True, null=True)
    vai_tro = models.ForeignKey(VaiTro, on_delete=models.SET_NULL, null=True)
    kich_hoat = models.BooleanField(default=True)
    # biến: mat_khau, ngay_tao, ngay_cap_nhat dùng của kế thừa AbstractUser

    USERNAME_FIELD = 'email'    # đăng nhập bằng email
    REQUIRED_FIELDS = [] # mặc định username, pass. Các trường khác tùy chỉnh thêm

    class Meta:
        db_table = 'tai_khoan'

class HoSoBenhNhan(BaseModel):
    tai_khoan = models.OneToOneField(TaiKhoan, on_delete=models.CASCADE)
    ma_benh_nhan = models.CharField(max_length=20, unique=True)
    nhom_mau = models.CharField(max_length=10, blank=True, null=True)
    tien_su_benh = models.TextField(blank=True, null=True)
    bao_hiem_y_te = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'ho_so_benh_nhan'

class HoSoBacSi(BaseModel):
    tai_khoan = models.OneToOneField(TaiKhoan, on_delete=models.CASCADE)
    ma_bac_si = models.CharField(max_length=20, unique=True)
    bang_cap = models.CharField(max_length=255, blank=True, null=True)
    chung_chi = models.TextField(blank=True, null=True)
    mo_ta = models.TextField(blank=True, null=True)
    phi_tu_van = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = 'ho_so_bac_si'