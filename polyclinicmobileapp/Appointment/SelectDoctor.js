import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { Card, Avatar, Text, BottomNavigation, Button } from 'react-native-paper';

const doctors = [
    { id: 1, name: 'BS. Nguyễn Văn An', specialtyId: 1, degree: 'Bác sĩ Tim mạch', experience: '10 năm kinh nghiệm' },
    { id: 2, name: 'BS. Trần Thị Bình', specialtyId: 1, degree: 'Thạc sĩ Tim mạch', experience: '8 năm kinh nghiệm' },
    { id: 3, name: 'BS. Lê Văn Cường', specialtyId: 2, degree: 'Bác sĩ Nội tổng quát', experience: '12 năm kinh nghiệm' },
    { id: 4, name: 'BS. Phạm Thị Dung', specialtyId: 3, degree: 'Bác sĩ Ngoại tổng quát', experience: '9 năm kinh nghiệm' },
    { id: 5, name: 'BS. Hoàng Văn Minh', specialtyId: 4, degree: 'Bác sĩ Nhi khoa', experience: '7 năm kinh nghiệm' },
    { id: 6, name: 'BS. Đặng Thị Hoa', specialtyId: 5, degree: 'Bác sĩ Da liễu', experience: '6 năm kinh nghiệm' },
];

const routes = [
    { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
    { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
    { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
    { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
];

const SelectDoctor = ({ route, navigation }) => {
    const { specialty } = route.params;
    const [index, setIndex] = useState(0);

    const filteredDoctors = doctors.filter(doctor => doctor.specialtyId === specialty.id);

    const handleTabPress = ({ route }) => {
        const newIndex = routes.findIndex(r => r.key === route.key);
        setIndex(newIndex);
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>Chuyên khoa: {specialty.name}</Text>

            <FlatList
                data={filteredDoctors}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 10 }}
                renderItem={({ item }) => (
                    <Card
                        style={{ marginBottom: 10 }}
                        onPress={() =>
                            navigation.navigate('SelectSchedule', {
                                specialty: specialty,
                                doctor: item,
                            })
                        }
                    >
                        <Card.Title
                            title={item.name}
                            subtitle={`${item.degree} • ${item.experience}`}
                            left={(props) => (
                                <Avatar.Image
                                    {...props}
                                    source={require('../assets/doctor.png')}
                                />
                            )}
                        />
                    </Card>
                )}
            />


            <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
        </View>
    );
};

export default SelectDoctor;