import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, ScrollView  } from 'react-native';
import { Text, BottomNavigation, Button, Card, Dialog, Portal } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Apis, { authApis, endpoints } from '../configs/Apis';

const routes = [
  { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
  { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
  { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
  { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
  { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
];

const SelectSchedule = ({ route, navigation }) => {
  const { specialty, doctor } = route.params || {};
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visible, setVisible] = useState(false);

  const getDoctorName = item => {
    const fullName = `${item?.user?.last_name || ''} ${item?.user?.first_name || ''}`.trim();
    return fullName ? `BS. ${fullName}` : item?.user?.username || 'Bác sĩ';
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await Apis.get(endpoints['work-schedules']);
      setSchedules(res.data.filter(item => item.staff_profile?.id === doctor.id && item.active !== false));
    } catch (ex) {
      console.log('Lỗi load lịch làm việc:', ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchedules(); }, []);

  const handleSelectDate = day => {
    const date = day.dateString;
    setSelectedDate(date);
    setSelectedSchedule(schedules.find(item => item.date === date) || null);
    setSelectedSlot(null);
  };

const bookAppointment = async () => {
  try {
    setBooking(true);

    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      navigation.navigate('Login');
      return;
    }

    await authApis(token).post(endpoints['appointments'], {
      time_slot: selectedSlot.id,
      services: [],
    });

    setVisible(true);
  } catch (ex) {
    console.log('Lỗi đặt lịch:', ex.response?.data || ex);
  } finally {
    setBooking(false);
  }
};

  const handleTabPress = ({ route }) => {
    const newIndex = routes.findIndex(r => r.key === route.key);
    setIndex(newIndex);
    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'account') navigation.navigate('Profile');
  };

  const markedDates = schedules.reduce((result, item) => ({ ...result, [item.date]: { marked: true, dotColor: '#00897B' } }), {});
  if (selectedDate) markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: '#00897B' };

  const timeSlots = selectedSchedule?.time_slots?.filter(item => item.active !== false) || [];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10, paddingBottom: 30 }}>
        <Card style={{ marginBottom: 15 }}>
          <Card.Content>
            <Text variant="titleMedium">Thông tin đặt lịch</Text>
            <Text>Chuyên khoa: {specialty?.name}</Text>
            <Text>Bác sĩ: {getDoctorName(doctor)}</Text>
            <Text>Phí khám: {doctor?.fee ? `${doctor.fee} VNĐ` : 'Chưa cập nhật'}</Text>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={{ marginBottom: 10 }}>Chọn ngày khám</Text>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <>
            <Calendar onDayPress={handleSelectDate} markedDates={markedDates} />

            {selectedDate ? (
              <View style={{ marginTop: 15 }}>
                <Text variant="titleMedium" style={{ marginBottom: 10 }}>Khung giờ ngày {selectedDate}</Text>

                {timeSlots.length === 0 ? (
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>Ngày này chưa có khung giờ khám</Text>
                ) : (
                  <FlatList
                    data={timeSlots}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <Button mode={selectedSlot?.id === item.id ? 'contained' : 'outlined'} style={{ flex: 1, margin: 5 }} onPress={() => setSelectedSlot(item)}>
                        {item.start_time} - {item.end_time}
                      </Button>
                    )}
                  />
                )}
              </View>
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 15 }}>Vui lòng chọn ngày có dấu chấm</Text>
            )}

            <Button mode="contained" style={{ marginTop: 20 }} disabled={!selectedSlot || booking} loading={booking} onPress={bookAppointment}>Đặt lịch</Button>
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Thông báo</Dialog.Title>
          <Dialog.Content><Text>Đặt lịch thành công!</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => { setVisible(false); navigation.navigate('Home'); }}>Hoàn tất</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
  );
};

export default SelectSchedule;