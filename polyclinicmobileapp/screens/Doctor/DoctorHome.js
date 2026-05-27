import React, { useContext, useLayoutEffect } from 'react';
import { View } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { MyDispatchContext } from '../../configs/Contexts';

const DoctorHome = ({ navigation }) => {
  const dispatch = useContext(MyDispatchContext);

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');

    dispatch({
      type: 'logout',
    });

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      gestureEnabled: false,
      headerRight: () => (
        <Button mode="text" labelStyle={styles.headerButtonText} onPress={logout}>
          Đăng xuất
        </Button>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Kê đơn thuốc</Text>
          <Text style={styles.cardText}>Tạo đơn thuốc cho bệnh nhân sau khi khám.</Text>
          <Button mode="contained" style={styles.button} labelStyle={styles.buttonText} onPress={() => navigation.navigate('DoctorPrescriptionCreate')}>
            Kê đơn thuốc
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Lịch hẹn khám</Text>
          <Text style={styles.cardText}>Xem danh sách bệnh nhân đã đặt lịch khám.</Text>
          <Button mode="contained" style={styles.button} labelStyle={styles.buttonText} onPress={() => navigation.navigate('DoctorAppointments')}>
            Xem lịch hẹn
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Quản lý thuốc</Text>
          <Text style={styles.cardText}>Xem danh sách thuốc, số lượng tồn kho.</Text>
          <Button mode="contained" style={styles.button} labelStyle={styles.buttonText} onPress={() => navigation.navigate('DoctorMedicineManagement')}>
            Quản lý thuốc
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default DoctorHome;