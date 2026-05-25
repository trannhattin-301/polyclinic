import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { authApis, endpoints } from '../../configs/Apis';

const DoctorAppointments = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const res = await authApis(token).get(endpoints['appointments']);
      setAppointments(res.data);
    } catch (ex) {
      console.log('Lỗi load lịch hẹn bác sĩ:', ex.response?.data || ex.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const formatTime = t => t ? String(t).slice(0, 5) : '--:--';

  const getStatus = s => {
    if (s === 'pending') return 'Chờ xác nhận';
    if (s === 'confirmed') return 'Đã xác nhận';
    if (s === 'completed') return 'Đã khám';
    if (s === 'cancelled') return 'Đã hủy';
    return 'Chưa cập nhật';
  };

  const getPatientName = item => {
    if (item.patient_detail) {
      const fullName = `${item.patient_detail.last_name || ''} ${item.patient_detail.first_name || ''}`.trim();
      return fullName || item.patient_detail.username || '--';
    }

    if (item.patient) return `Bệnh nhân #${item.patient}`;

    return '--';
  };

  const renderItem = ({ item }) => {
    const date = item.work_schedule?.date || '--';
    const start = formatTime(item.time_slot_detail?.start_time);
    const end = formatTime(item.time_slot_detail?.end_time);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Lịch hẹn #{item.id}</Text>
            <Chip compact>{getStatus(item.status)}</Chip>
          </View>

          <Text style={styles.cardText}>Bệnh nhân: {getPatientName(item)}</Text>
          <Text style={styles.cardText}>Ngày khám: {date}</Text>
          <Text style={styles.cardText}>Giờ khám: {start} - {end}</Text>
          <Text style={styles.cardText}>Mô tả: {item.disease_description || '--'}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Button mode="contained" style={{ flex: 1, marginRight: 6 }} onPress={() => navigation.navigate('DoctorAppointmentDetail', { appointment: item })}>
              Xem chi tiết
            </Button>

            <Button mode="contained-tonal" style={{ flex: 1, marginLeft: 6 }} onPress={() => navigation.navigate('Chat', { appointment: item })}>
              Chat
            </Button>
          </View>
    
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch hẹn khám của bác sĩ</Text>

      {loading && !refreshing ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              loadAppointments().finally(() => setRefreshing(false));
            }} />
          }
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có lịch hẹn nào</Text>}
        />
      )}
    </View>
  );
};

export default DoctorAppointments;