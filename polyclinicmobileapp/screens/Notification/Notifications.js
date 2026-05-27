import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, BottomNavigation } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import styles from './Styles';

const Notifications = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(3);

    const [routes] = useState([
        { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
        { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
        { key: 'profile', title: 'Hồ sơ', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
        { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
        { key: 'account', title: 'Tài khoản', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },
    ]);

    const handleTabPress = ({ route }) => {
        const screens = { home: 'Home', schedule: 'MyAppointment', profile: 'Profile', notifications: 'Notifications', account: 'Account' };
        setIndex(routes.findIndex(r => r.key === route.key));
        navigation.navigate(screens[route.key]);
    };

    const getTitle = (status) => {
        if (status === 'pending') return 'Đặt lịch thành công';
        if (status === 'confirmed') return 'Lịch hẹn đã được xác nhận';
        if (status === 'cancelled') return 'Lịch hẹn đã bị hủy';
        if (status === 'completed') return 'Buổi khám đã hoàn thành';
        return 'Cập nhật lịch hẹn';
    };

    const getContent = (status) => {
        if (status === 'pending') return 'Bạn đã đặt lịch khám thành công. Vui lòng chờ bác sĩ xác nhận.';
        if (status === 'confirmed') return 'Bác sĩ đã xác nhận lịch hẹn của bạn. Vui lòng đến đúng giờ.';
        if (status === 'cancelled') return 'Lịch hẹn của bạn đã bị hủy.';
        if (status === 'completed') return 'Buổi khám đã hoàn thành. Bạn có thể xem lại hồ sơ bệnh án.';
        return 'Lịch hẹn của bạn vừa được cập nhật.';
    };

    const loadNotifications = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem('access_token');

            let userRes = await authApis(token).get(endpoints['current-user']);
            let currentUser = userRes.data;

            let res = await authApis(token).get(endpoints['appointments']);
            let data = res.data.results ? res.data.results : res.data;

            let list = data.map(a => ({ id: `appointment-${a.id}`, title: getTitle(a.status), content: getContent(a.status), created_date: a.created_date, status: a.status }));

            let messageList = [];

            for (let a of data) {
                try {
                    let msgRes = await authApis(token).get(endpoints['appointment-messages'](a.id));
                    let messages = msgRes.data.results ? msgRes.data.results : msgRes.data;

                    if (messages.length > 0) {
                        let lastMsg = messages[messages.length - 1];

                        if (lastMsg.sender !== currentUser.id) {
                            messageList.push({ id: `message-${lastMsg.id}`, title: 'Có tin nhắn mới', content: `${lastMsg.sender_name || 'Bác sĩ'} vừa gửi tin nhắn cho bạn.`, created_date: lastMsg.created_date, status: 'message' });
                        }
                    }
                } catch (err) {
                    console.log("Lỗi lấy tin nhắn:", err.response?.data || err.message);
                }
            }

            setNotifications([...messageList, ...list]);
        } catch (ex) {
            console.log("Lỗi load thông báo:", ex.response?.data || ex.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.content}>{item.content}</Text>
                <Text style={styles.status}>Trạng thái: {item.status}</Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator style={styles.loading} /> : <FlatList data={notifications} keyExtractor={item => item.id} renderItem={renderItem} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} />} ListEmptyComponent={<Text style={styles.emptyText}>Chưa có thông báo</Text>} />}
            <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
        </View>
    );
};

export default Notifications;