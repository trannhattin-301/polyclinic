import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BottomNavigation, Card, Avatar, List, Button, Divider } from 'react-native-paper';
import styles from './Styles';


const HomeRoute = () => <Text>Trang chủ</Text>;
const ScheduleRoute = () => <Text>Lịch hẹn</Text>;
const ProfileRoute = () => <Text>Hồ sơ</Text>;
const NotificationsRoute = () => <Text>Thông báo</Text>;
const AccountRoute = () => <Text>Tài khoản</Text>;

const Profile = ({ navigation }) => {
    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
        { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
        { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
        { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
        { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
    ]);

    const renderScene = BottomNavigation.SceneMap({
        home: HomeRoute,
        schedule: ScheduleRoute,
        profile: ProfileRoute,
        notifications: NotificationsRoute,
        account: AccountRoute,
    });

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Avatar.Text size={80} label="NV" />
                <Text style={styles.name}>Nguyễn Văn An</Text>
                <Text style={styles.email}>nguyenvanan@gmail.com</Text>
            </View>

            <ScrollView style={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <List.Item title="Họ tên" description="Nguyễn Văn An" left={() => <List.Icon icon="account" />} />
                        <Divider />
                        <List.Item title="Ngày sinh" description="01/01/1990" left={() => <List.Icon icon="calendar" />} />
                        <Divider />
                        <List.Item title="Số điện thoại" description="0912 345 678" left={() => <List.Icon icon="phone" />} />
                        <Divider />
                        <List.Item title="Địa chỉ" description="Hồ Chí Minh" left={() => <List.Icon icon="map-marker" />} />
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Button mode="contained" style={styles.button}>Chỉnh sửa hồ sơ</Button>
                        <Button mode="outlined" style={styles.button} textColor="red">Đăng xuất</Button>
                    </Card.Content>
                </Card>
            </ScrollView>

            <BottomNavigation.Bar
                navigationState={{ index, routes }}
                onTabPress={({ route }) => {
                    const newIndex = routes.findIndex(r => r.key === route.key);
                    setIndex(newIndex);

                    if (route.key === 'home') navigation.navigate('Home');
                }}
            />

        </View>
    );
};

export default Profile;