import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import styles from './Styles';

const DoctorPrescriptionCreate = ({ route }) => {
  const { appointment } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kê đơn thuốc</Text>
      <Text>Lịch hẹn: {appointment?.id || '--'}</Text>
      <Text>Chức năng này chưa làm, Tín làm đi</Text>
    </View>
  );
};

export default DoctorPrescriptionCreate;