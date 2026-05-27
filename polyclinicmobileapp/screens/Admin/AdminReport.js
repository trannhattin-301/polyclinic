import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { authApis, endpoints } from '../../configs/Apis';

const AdminReport = ({ navigation }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');

      const res = await authApis(token).get(endpoints['admin-reports']);
      setReport(res.data);
    } catch (ex) {
      console.log('Lỗi tải thống kê:', ex.response?.data || ex.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    navigation.replace('Login');
  };

  useEffect(() => { loadReport(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  const overview = report?.overview || {};
  const appointmentStatus = report?.appointment_status || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thống kê báo cáo</Text>

      <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>

      <View style={styles.row}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Bệnh nhân</Text>
            <Text style={styles.cardNumber}>{overview.total_patients || 0}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Bác sĩ</Text>
            <Text style={styles.cardNumber}>{overview.total_doctors || 0}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.row}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Thuốc</Text>
            <Text style={styles.cardNumber}>{overview.total_medicines || 0}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Lịch hẹn</Text>
            <Text style={styles.cardNumber}>{overview.total_appointments || 0}</Text>
          </Card.Content>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Thống kê lịch hẹn theo trạng thái</Text>

      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <Text style={styles.statusTitle}>Chờ xác nhận</Text>
          <Text style={styles.statusNumber}>{appointmentStatus.pending || 0}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <Text style={styles.statusTitle}>Đã xác nhận</Text>
          <Text style={styles.statusNumber}>{appointmentStatus.confirmed || 0}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <Text style={styles.statusTitle}>Đang khám</Text>
          <Text style={styles.statusNumber}>{appointmentStatus.in_progress || 0}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <Text style={styles.statusTitle}>Đã hoàn thành</Text>
          <Text style={styles.statusNumber}>{appointmentStatus.completed || 0}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <Text style={styles.statusTitle}>Đã hủy</Text>
          <Text style={styles.statusNumber}>{appointmentStatus.cancelled || 0}</Text>
        </Card.Content>
      </Card>

      <Button mode="contained" buttonColor="dodgerblue" textColor="white" style={styles.logoutButton} onPress={logout}>
        Đăng xuất
      </Button>
    </ScrollView>
  );
};

export default AdminReport;