import React from 'react';
import { View } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import styles from './Styles';

const DoctorHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang bác sĩ</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Lịch hẹn khám</Text>
          <Text style={styles.cardText}>Xem danh sách bệnh nhân đã đặt lịch khám.</Text>
          <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('DoctorAppointments')}>
            Xem lịch hẹn
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Quản lý thuốc</Text>
          <Text style={styles.cardText}>Xem danh sách thuốc, số lượng tồn kho.</Text>
          <Button mode="outlined" style={styles.button} onPress={() => navigation.navigate('DoctorMedicineManagement')}>
            Quản lý thuốc
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Kê đơn thuốc</Text>
          <Text style={styles.cardText}>Tạo đơn thuốc cho bệnh nhân sau khi khám.</Text>
          <Button mode="outlined" style={styles.button} onPress={() => navigation.navigate('DoctorPrescriptionCreate')}>
            Kê đơn thuốc
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default DoctorHome;