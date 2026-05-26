// DoctorPrescriptionDetail.js
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';

const STATUS_COLOR = {
  draft:      '#FF9800',
  confirmed:  '#2196F3',
  dispensed:  '#4CAF50',
  cancelled:  '#F44336',
};

const STATUS_LABEL = {
  draft:      'Đang tạo',
  confirmed:  'Hoàn tất',
  dispensed:  'Đã phát',
  cancelled:  'Đã huỷ',
};

const DoctorPrescriptionDetail = ({ route, navigation }) => {
  const { prescriptionId } = route.params;
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await authApis(token).get(
        endpoints['prescription-detail'](prescriptionId)
    );
      setPrescription(res.data);
    } catch (ex) {
      console.log('Lỗi load đơn:', ex.response?.data || ex.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrescription(); }, []);

  const handleAction = async (actionName, label) => {
    Alert.alert('Xác nhận', `Bạn chắc chắn muốn ${label}?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            setActionLoading(true);
            const token = await AsyncStorage.getItem('access_token');
            await authApis(token).post(
                endpoints['prescription-action'](prescriptionId, actionName)
            );
            Alert.alert('Thành công', `Đã ${label}`);
            loadPrescription(); // reload lại trạng thái mới
          } catch (ex) {
            const msg = ex.response?.data?.detail || 'Thao tác thất bại';
            Alert.alert('Lỗi', msg);
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!prescription) return null;

  const { status, notes, items = [], medical_record } = prescription;

  return (
    <ScrollView style={{ backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ padding: 12 }}>

      {/* Header */}
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium">Đơn thuốc #{prescription.id}</Text>
            <Chip
              style={{ backgroundColor: STATUS_COLOR[status] }}
              textStyle={{ color: '#fff', fontSize: 12 }}>
              {STATUS_LABEL[status] || status}
            </Chip>
          </View>
          {notes ? <Text style={{ marginTop: 8, color: '#666' }}>Ghi chú: {notes}</Text> : null}
        </Card.Content>
      </Card>

      {/* Danh sách thuốc */}
      <Text style={{ fontWeight: '600', marginBottom: 8 }}>
        Danh sách thuốc ({items.length})
      </Text>
      {items.map((item, idx) => (
        <Card key={idx} style={{ marginBottom: 8 }}>
          <Card.Content>
            <Text style={{ fontWeight: '600', fontSize: 15 }}>
              {item.medicine_detail?.name || item.medicine_name || `Thuốc #${item.medicine}`}
            </Text>
            <Text>Số lượng: {item.quantity}</Text>
            {item.dosage    ? <Text>Liều: {item.dosage}</Text> : null}
            {item.frequency ? <Text>Tần suất: {item.frequency}</Text> : null}
            {item.timing    ? <Text>Thời điểm: {item.timing}</Text> : null}
            {item.duration_days ? <Text>Số ngày: {item.duration_days}</Text> : null}
          </Card.Content>
        </Card>
      ))}

      {/* Action buttons theo trạng thái */}
      <View style={{ marginTop: 16, gap: 10 }}>
        {status === 'draft' && (
          <>
            <Button
              mode="contained"
              loading={actionLoading}
              onPress={() => handleAction('confirm', 'xác nhận đơn thuốc')}
              buttonColor="#2196F3"
            >
              Xác nhận đơn (Confirm)
            </Button>
            <Button
              mode="outlined"
              loading={actionLoading}
              onPress={() => handleAction('cancel', 'huỷ đơn thuốc')}
              textColor="#F44336"
            >
              Huỷ đơn
            </Button>
          </>
        )}

        {status === 'confirmed' && (
          <Button
            mode="contained"
            loading={actionLoading}
            onPress={() => handleAction('dispense', 'phát thuốc')}
            buttonColor="#4CAF50"
          >
            Phát thuốc → Xuất kho
          </Button>
        )}

        {status === 'dispensed' && (
          <Card style={{ backgroundColor: '#E8F5E9' }}>
            <Card.Content>
              <Text style={{ color: '#2E7D32', textAlign: 'center' }}>
                ✓ Đã phát thuốc — Lịch sử tồn kho đã được cập nhật
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

export default DoctorPrescriptionDetail;