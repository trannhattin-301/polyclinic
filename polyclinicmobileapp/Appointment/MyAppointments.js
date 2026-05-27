import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, Portal, Dialog, BottomNavigation } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { authApis, endpoints } from '../configs/Apis';

const routes = [
  { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
  { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
  { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
  { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
  { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
];

const MyAppointment = ({ navigation }) => {
  const [index, setIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');

      const res = await authApis(token).get(endpoints['appointments']);
      setAppointments(res.data);
    } catch (ex) {
      console.log('Lỗi load:', ex.response?.data || ex);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async () => {
    try {
      setCanceling(true);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');

      await authApis(token).patch(`${endpoints['appointments']}${selected.id}/cancel/`);
      setVisible(false);
      setSelected(null);
      loadAppointments();
    } catch (ex) {
      console.log('Lỗi hủy:', ex.response?.data || ex);
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const formatTime = time => time ? String(time).slice(0, 5) : '--:--';

  const getStatus = status => {
    if (status === 'pending') return 'Chờ xác nhận';
    if (status === 'confirmed') return 'Đã xác nhận';
    if (status === 'completed') return 'Đã khám';
    if (status === 'cancelled') return 'Đã hủy';
    return 'Chưa cập nhật';
  };

  const handleCancelPress = item => {
    setSelected(item);
    setVisible(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments().finally(() => setRefreshing(false));
  };

  const handleTabPress = ({ route }) => {
    setIndex(routes.findIndex(r => r.key === route.key));

    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'schedule') navigation.navigate('MyAppointment');
    if (route.key === 'profile' || route.key === 'account') navigation.navigate('Profile');
  };

  const renderItem = ({ item }) => {
    const date = item.work_schedule?.date || '--';
    const start = formatTime(item.time_slot_detail?.start_time);
    const end = formatTime(item.time_slot_detail?.end_time);
    const cancelled = item.status === 'cancelled';

    return (
      <Card style={styles.appointmentCard}>
        <Card.Content>
          <View style={styles.appointmentHeader}>
            <Text variant="titleMedium">#{item.id}</Text>
            <Chip compact>{getStatus(item.status)}</Chip>
          </View>

          <Text>Bác sĩ: {item.doctor_name || '--'}</Text>
          <Text>Ngày: {date}</Text>
          <Text>Giờ: {start} - {end}</Text>
          <Text>Mô tả: {item.disease_description || '--'}</Text>

          {item.services_detail?.length > 0 && <Text>Dịch vụ: {item.services_detail.map(s => s.name).join(', ')}</Text>}

          <Button mode="contained-tonal" style={styles.smallButton} onPress={() => navigation.navigate('Chat', { appointment: item })}>Chat với bác sĩ</Button>
          {!cancelled && <Button mode="outlined" style={styles.smallButton} onPress={() => handleCancelPress(item)}>Hủy</Button>}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.appointmentContainer}>
      <Text variant="titleLarge" style={styles.pageTitle}>Lịch hẹn của tôi</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có lịch hẹn nào</Text>}
        />
      )}

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Xác nhận hủy</Dialog.Title>
          <Dialog.Content><Text>Bạn có chắc muốn hủy lịch này không?</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Không</Button>
            <Button loading={canceling} disabled={canceling} onPress={cancelAppointment}>Hủy</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
  );
};

export default MyAppointment;   