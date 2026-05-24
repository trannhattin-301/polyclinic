import React from 'react';
import { View } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import styles from './Styles';

const DoctorAppointmentDetail = ({ route, navigation }) => {
  const { appointment } = route.params || {};

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text>Không có dữ liệu lịch hẹn.</Text>
      </View>
    );
  }

  const formatTime = t => t ? String(t).slice(0, 5) : '--:--';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết lịch hẹn</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Lịch hẹn #{appointment.id}</Text>
          <Text style={styles.cardText}>Ngày khám: {appointment.work_schedule?.date || '--'}</Text>
          <Text style={styles.cardText}>Giờ khám: {formatTime(appointment.time_slot_detail?.start_time)} - {formatTime(appointment.time_slot_detail?.end_time)}</Text>
          <Text style={styles.cardText}>Trạng thái: {appointment.status || '--'}</Text>
          <Text style={styles.cardText}>Mô tả bệnh: {appointment.disease_description || '--'}</Text>
        </Card.Content>
      </Card>

      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('DoctorPrescriptionCreate', { appointment })}>
        Kê đơn thuốc
      </Button>

      <Button mode="outlined" style={styles.button} onPress={() => navigation.goBack()}>
        Quay lại
      </Button>
    </View>
  );
};

export default DoctorAppointmentDetail;