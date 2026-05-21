import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { BottomNavigation, Card, Searchbar } from 'react-native-paper';
import styles from './Styles';

const specialties = [
    { id: 1, name: 'Tim mạch' },
    { id: 2, name: 'Nội tổng quát' },
    { id: 3, name: 'Ngoại tổng quát' },
    { id: 4, name: 'Nhi khoa' },
    { id: 5, name: 'Da liễu' },
];

const routes = [
    { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
    { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
    { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
    { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
];

const SelectSpecialty = ({ navigation }) => {
    const [index, setIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSpecialties = specialties.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTabPress = ({ route }) => {
        const newIndex = routes.findIndex(r => r.key === route.key);
        setIndex(newIndex);
    };

    return (
        <View style={{ flex: 1 }}>
            <Searchbar
                placeholder="Tìm chuyên khoa"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
            />

            <FlatList
                data={filteredSpecialties}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 10 }}
                renderItem={({ item }) => (
                    <Card
                        style={{ marginHorizontal: 10, marginVertical: 6 }}
                        onPress={() => navigation.navigate('SelectDoctor', { specialty: item })}
                    >
                        <Card.Title title={item.name} />
                    </Card>
                )}
            />

            <BottomNavigation.Bar
                navigationState={{ index, routes }}
                onTabPress={handleTabPress}
            />
        </View>
    );
};

export default SelectSpecialty;