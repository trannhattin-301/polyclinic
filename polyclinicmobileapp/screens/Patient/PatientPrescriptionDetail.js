import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import styles from './PatientPrescriptionDetailStyles';

const STATUS_COLOR = {
  draft: '#FF9800',
  confirmed: '#2196F3',
  dispensed: '#4CAF50',
  cancelled: '#F44336',
};

const STATUS_LABEL = {
  draft: 'Đang tạo',
  confirmed: 'Hoàn tất',
  dispensed: 'Đã phát thuốc',
  cancelled: 'Đã huỷ',
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const PatientPrescriptionDetail = ({ route }) => {
  const { prescriptionId } = route.params;
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('access_token');
        const res = await authApis(token).get(
          endpoints['prescription-detail'](prescriptionId)
        );
        setPrescription(res.data);
      } catch (ex) {
        console.log('Lỗi tải đơn thuốc:', ex.response?.data || ex.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [prescriptionId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
      </View>
    );
  }

  if (!prescription) return null;

  const { status, notes, items = [] } = prescription;

  // API trả về: data['doctor']['name'], data['medical_record_detail']['diagnosis']
  const doctorName = prescription.doctor?.name ?? 'Chưa có thông tin';
  const diagnosis = prescription.medical_record_detail?.diagnosis ?? '';
  const appointmentDate = prescription.medical_record_detail?.appointment_id
    ? `#${prescription.medical_record_detail.appointment_id}`
    : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, paddingBottom: 48 }}>

      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.prescriptionTitle}>Đơn thuốc #{prescription.id}</Text>
              <Text style={styles.subTitle}>Chi tiết đơn thuốc của bạn</Text>
            </View>
            <Chip
              style={{ backgroundColor: STATUS_COLOR[status] ?? '#9E9E9E' }}
              textStyle={{ color: '#fff', fontSize: 12 }}
            >
              {STATUS_LABEL[status] ?? status}
            </Chip>
          </View>
          {status === 'dispensed' ? (
            <View style={styles.dispensedBanner}>
              <Text style={styles.dispensedText}>
                ✓ Đã phát thuốc — bạn có thể nhận thuốc tại quầy
              </Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      {/* Thông tin khám */}
      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Thông tin khám</Text>
          <Divider style={{ marginBottom: 10 }} />
          <InfoRow label="Bác sĩ kê đơn" value={doctorName} />
          {diagnosis ? <InfoRow label="Chẩn đoán" value={diagnosis} /> : null}
          {notes ? <InfoRow label="Ghi chú đơn" value={notes} /> : null}
        </Card.Content>
      </Card>

      {/* Danh sách thuốc */}
      <Text style={styles.medicineHeader}>
        Danh sách thuốc ({items.length} loại)
      </Text>

      {items.length === 0 ? (
        <Card style={styles.section}>
          <Card.Content>
            <Text style={{ color: '#999', textAlign: 'center' }}>Đơn thuốc chưa có thuốc nào</Text>
          </Card.Content>
        </Card>
      ) : null}

      {items.map((item, idx) => {
        // item.medicine là object { id, name, unit, price, stock }
        const med = item.medicine ?? {};
        const medName = med.name ?? `Thuốc #${med.id ?? idx + 1}`;
        const unit = med.unit ?? '';

        return (
          <Card key={item.id ?? idx} style={styles.medicineCard}>
            <Card.Content>
              <View style={styles.medHeader}>
                <View style={styles.medBadge}>
                  <Text style={styles.medBadgeText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{medName}</Text>
                  {med.price ? (
                    <Text style={styles.medIngredient}>
                      Đơn giá: {Number(med.price).toLocaleString('vi-VN')}đ
                    </Text>
                  ) : null}
                </View>
              </View>

              <Divider style={{ marginVertical: 8 }} />

              <View style={styles.dosageGrid}>
                <View style={styles.dosageItem}>
                  <Text style={styles.dosageLabel}>Số lượng</Text>
                  <Text style={styles.dosageValue}>{item.quantity} {unit}</Text>
                </View>
                {item.dosage ? (
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Liều dùng</Text>
                    <Text style={styles.dosageValue}>{item.dosage}</Text>
                  </View>
                ) : null}
                {item.frequency ? (
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Tần suất</Text>
                    <Text style={styles.dosageValue}>{item.frequency}</Text>
                  </View>
                ) : null}
                {item.timing ? (
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Thời điểm</Text>
                    <Text style={styles.dosageValue}>{item.timing}</Text>
                  </View>
                ) : null}
                {item.duration_days ? (
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Số ngày</Text>
                    <Text style={styles.dosageValue}>{item.duration_days} ngày</Text>
                  </View>
                ) : null}
                {item.subtotal ? (
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Thành tiền</Text>
                    <Text style={[styles.dosageValue, { color: '#1E88E5' }]}>
                      {Number(item.subtotal).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                ) : null}
              </View>

              {item.notes ? (
                <Text style={styles.itemNotes}>Ghi chú: {item.notes}</Text>
              ) : null}
            </Card.Content>
          </Card>
        );
      })}

      {/* Tổng tiền */}
      {prescription.total_price ? (
        <Card style={[styles.section, { backgroundColor: '#E3F2FD' }]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#333' }}>Tổng tiền thuốc</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E88E5' }}>
                {Number(prescription.total_price).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </Card.Content>
        </Card>
      ) : null}

    </ScrollView>
  );
};

export default PatientPrescriptionDetail;