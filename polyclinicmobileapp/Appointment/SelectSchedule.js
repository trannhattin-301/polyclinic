import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, BottomNavigation, Button, Card } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

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
    const [selectedDate, setSelectedDate] = useState('');

    const handleTabPress = ({ route }) => {
        const newIndex = routes.findIndex(r => r.key === route.key);
        setIndex(newIndex);
    };


    return (
    <View style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 10 }}>
            <Card style={{ marginBottom: 15 }}>
                <Card.Content>
                    <Text variant="titleMedium">Thông tin đặt lịch</Text>
                    <Text>Chuyên khoa: {specialty.name}</Text>
                    <Text>Bác sĩ: {doctor.name}</Text>
                </Card.Content>
            </Card>

            <Text variant="titleMedium" style={{ marginBottom: 10 }}>Chọn ngày khám</Text>

            <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: {
                        selected: true,
                        selectedColor: '#00897B',
                    },
                }}
            />

            <Button mode="contained" style={{ marginTop: 20 }} disabled={!selectedDate}>
                Xác nhận đặt lịch
            </Button>
        </View>

        <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
);
};

export default SelectSchedule;