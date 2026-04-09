from django.db import models
from users.models import HoSoBacSi, HoSoBenhNhan

class BaseModel(models.Model):
    ngay_tao = models.DateTimeField(auto_now_add=True)
    kich_hoat = models.BooleanField(default=True)

    class Meta:
        abstract = True

class ChuyenKhoa(BaseModel):
    ma_ck = models.CharField(max_length=20, unique=True)
    ten_ck = models.CharField(max_length=150)
    mo_ta = models.TextField(blank=True, null=True)
    hinh_anh = models.CharField(max_length=255, blank=True, null=True)
    kich_hoat = models.BooleanField(default=True)

    class Meta:
        db_table = 'chuyen_khoa'

class BacSiChuyenKhoa(models.Model):
    bac_si = models.ForeignKey(HoSoBacSi, on_delete=models.CASCADE)
    chuyen_khoa = models.ForeignKey(ChuyenKhoa, on_delete=models.CASCADE)

    class Meta:
        db_table = 'bac_si_chuyen_khoa'
        unique_together = ('bac_si', 'chuyen_khoa')

class LichLamViec(BaseModel):
    bac_si = models.ForeignKey(HoSoBacSi, on_delete=models.CASCADE)
    chuyen_khoa = models.ForeignKey(ChuyenKhoa, on_delete=models.CASCADE)
    ngay_lam_viec = models.DateField()
    gio_bat_dau = models.TimeField()
    gio_ket_thuc = models.TimeField()
    tong_slot = models.IntegerField(default=0)
    kich_hoat = models.BooleanField(default=True)
    ghi_chu = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'lich_lam_viec'
        unique_together = ('bac_si', 'ngay_lam_viec', 'gio_bat_dau') # tránh trùng lịch làm, ví dụ 2 ca 1 nagfy

class LichHen(BaseModel):
    HINH_THUC = [('TRUC_TIEP', 'Trực tiếp'), ('TRUC_TUYEN', 'Trực tuyến')]
    TRANG_THAI = [
        ('CHO_XAC_NHAN', 'Chờ xác nhận'),
        ('DA_XAC_NHAN', 'Đã xác nhận'),
        ('HOAN_THANH', 'Hoàn thành'),
        ('HUY', 'Hủy'),
    ]

    ma_lich_hen = models.CharField(max_length=30, unique=True)
    benh_nhan = models.ForeignKey(HoSoBenhNhan, on_delete=models.CASCADE)
    lich_lv = models.ForeignKey(LichLamViec, on_delete=models.CASCADE)
    ngay_hen = models.DateField()
    gio_hen = models.TimeField()
    ly_do_kham = models.TextField(blank=True, null=True)
    hinh_thuc = models.CharField(max_length=20, choices=HINH_THUC, default='TRUC_TIEP')
    link_video = models.CharField(max_length=500, blank=True, null=True)
    trang_thai = models.CharField(max_length=20, choices=TRANG_THAI, default='CHO_XAC_NHAN')
    ghi_chu = models.TextField(blank=True, null=True)
    ngay_cap_nhat = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lich_hen'