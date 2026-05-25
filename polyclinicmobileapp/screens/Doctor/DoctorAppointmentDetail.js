import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { authApis, endpoints, appointmentStatusEndpoints } from '../../configs/Apis';

const DoctorAppointmentDetail = ({ route, navigation }) => {
  const { appointment } = route.params || {};
  const [item, setItem] = useState(appointment);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatTime = t => t ? String(t).slice(0, 5) : '--:--';

  const getStatus = s => {
    if (s === 'pending') return 'Chờ xác nhận';
    if (s === 'confirmed') return 'Đã xác nhận';
    if (s === 'in_progress') return 'Đang khám';
    if (s === 'completed') return 'Hoàn thành';
    if (s === 'cancelled') return 'Đã hủy';
    return 'Chưa cập nhật';
  };

  const loadMedicalRecord = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token || !item?.id) return;

      const res = await authApis(token).get(`${endpoints['medical-records']}?appointment_id=${item.id}`);
      const data = Array.isArray(res.data) ? res.data : res.data.results;

      setRecord(data && data.length > 0 ? data[0] : null);
    } catch (ex) {
      console.log('Lỗi load bệnh án:', ex.response?.data || ex.message);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadMedicalRecord());
    return unsubscribe;
  }, [navigation, item]);

  const updateStatus = async type => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        navigation.navigate('Login');
        return;
      }

      let url = '';
      if (type === 'confirm') url = appointmentStatusEndpoints.confirm(item.id);
      if (type === 'start') url = appointmentStatusEndpoints.start(item.id);

      if (type === 'complete') {
        if (!record) {
          Alert.alert('Thông báo', 'Vui lòng ghi bệnh án trước khi hoàn thành khám!');
          return;
        }

        url = appointmentStatusEndpoints.complete(item.id);
      }

      const res = await authApis(token).patch(url);
      setItem(res.data);
      Alert.alert('Thông báo', 'Cập nhật trạng thái thành công!');
    } catch (ex) {
      console.log('Lỗi cập nhật trạng thái:', ex.response?.data || ex.message);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái lịch hẹn!');
    } finally {
      setLoading(false);
    }
  };

  const goToPrescription = () => {
    if (!record) {
      Alert.alert('Thông báo', 'Vui lòng ghi bệnh án trước khi kê đơn thuốc!');
      return;
    }

    navigation.navigate('DoctorPrescriptionCreate', { appointment: item, medicalRecord: record });
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>Không có dữ liệu lịch hẹn.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết lịch hẹn</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Lịch hẹn #{item.id}</Text>
          <Chip style={styles.chip}>{getStatus(item.status)}</Chip>

          <Text style={styles.cardText}>Bệnh nhân: {item.patient_name || '--'}</Text>
          <Text style={styles.cardText}>Ngày khám: {item.work_schedule?.date || '--'}</Text>
          <Text style={styles.cardText}>Giờ khám: {formatTime(item.time_slot_detail?.start_time)} - {formatTime(item.time_slot_detail?.end_time)}</Text>
          <Text style={styles.cardText}>Mô tả bệnh: {item.disease_description || '--'}</Text>

          {record && (
            <>
              <Text style={styles.cardText}>Chẩn đoán: {record.diagnosis}</Text>
              <Text style={styles.cardText}>Ghi chú: {record.medical_notes || '--'}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      {item.status === 'pending' && <Button mode="contained" style={styles.button} onPress={() => updateStatus('confirm')}>Xác nhận lịch hẹn</Button>}
      {item.status === 'confirmed' && <Button mode="contained" style={styles.button} onPress={() => updateStatus('start')}>Bắt đầu khám</Button>}

      {item.status === 'in_progress' && (
        <>
          <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('DoctorMedicalRecordCreate', { appointment: item })}>Ghi bệnh án</Button>
          <Button mode="outlined" style={styles.button} onPress={goToPrescription}>Kê đơn thuốc</Button>
          <Button mode="contained" style={styles.button} onPress={() => updateStatus('complete')}>Hoàn thành khám</Button>
        </>
      )}

      {item.status === 'completed' && <Button mode="outlined" style={styles.button} onPress={goToPrescription}>Xem / kê đơn thuốc</Button>}

      <Button mode="outlined" style={styles.button} onPress={() => navigation.goBack()}>Quay lại</Button>
    </View>
  );
};

export default DoctorAppointmentDetail;