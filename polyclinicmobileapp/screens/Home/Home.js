import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { BottomNavigation, Searchbar, Card, Icon } from 'react-native-paper';
import styles from './Styles';
import { FontAwesome } from '@expo/vector-icons';

const HomeRoute = () => <Text>Trang chủ</Text>;
const ScheduleRoute = () => <Text>Lịch hẹn</Text>;
const ProfileRoute = () => <Text>Hồ sơ</Text>;
const NotificationsRoute = () => <Text>Thông báo</Text>;
const AccountRoute = () => <Text>Tài khoản</Text>;

const Home = ({ navigation }) => {
    const [index, setIndex] = useState(0);
    const [searchQuery, setSearchQuery] = React.useState('');


    const [routes] = useState([
        {
            key: 'home',
            title: 'Trang chủ',
            focusedIcon: 'home',
            unfocusedIcon: 'home-outline',
        },
        {
            key: 'schedule',
            title: 'Lịch hẹn',
            focusedIcon: 'calendar',
            unfocusedIcon: 'calendar-outline',
        },
        {
            key: 'profile',
            title: 'Hồ sơ',
            focusedIcon: 'file-document',
            unfocusedIcon: 'file-document-outline',
        },
        {
            key: 'notifications',
            title: 'Thông báo',
            focusedIcon: 'bell',
            unfocusedIcon: 'bell-outline',
        },
        {
            key: 'account',
            title: 'Tài khoản',
            focusedIcon: 'account',
            unfocusedIcon: 'account-outline',
        },
    ]);

    const renderScene = BottomNavigation.SceneMap({
        home: HomeRoute,
        schedule: ScheduleRoute,
        profile: ProfileRoute,
        notifications: NotificationsRoute,
        account: AccountRoute,
    });

    const menuItems = [
        { key: 'appointment', label: 'Đặt lịch khám', icon: 'calendar' },
        { key: 'medicine', label: 'Đơn thuốc', icon: 'medkit' },
        { key: 'record', label: 'Hồ sơ bệnh án', icon: 'book' },
        { key: 'consult', label: 'Tư vấn online', icon: 'phone' },
    ];

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Xin chào, [Tên người dùng]</Text>
                <Searchbar
                    placeholder="Search"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}

                />
            </View>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={menuItems}
                    numColumns={2}
                    keyExtractor={(item) => item.key}
                    columnWrapperStyle={styles.menuRow}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <Card
                            style={styles.menuCard}
                            onPress={() => {
                                if (item.key === 'appointment') {
                                    navigation.navigate('SelectSpecialty');
                                }
                            }}
                        >
                            <Card.Content style={styles.menuCardContent}>
                                <FontAwesome name={item.icon} size={30} color="#1E88E5" />
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </Card.Content>
                        </Card>
                    )}
                />
                <BottomNavigation.Bar
                    navigationState={{ index, routes }}
                    onTabPress={({ route }) => {
                        const newIndex = routes.findIndex(r => r.key === route.key);
                        setIndex(newIndex);

                        if (route.key === 'account') navigation.navigate('Profile');
                    }}
                />
            </View>
        </View>
    );
};

export default Home;