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
    const [index, setIndex] = useState(1), [loading, setLoading] = useState(false), [appointments, setAppointments] = useState([]),
        [refreshing, setRefreshing] = useState(false), [canceling, setCanceling] = useState(false),
        [selected, setSelected] = useState(null), [visible, setVisible] = useState(false);

    const loadAppointments = async () => {
        try {
            setLoading(true); const token = await AsyncStorage.getItem('access_token');
            if (!token) return navigation.navigate('Login');
            const res = await authApis(token).get(endpoints['appointments']);
            setAppointments(res.data);
        }
        catch (ex) { console.log('Lỗi load:', ex.response?.data || ex); }
        finally { setLoading(false); }
    };

    const cancelAppointment = async () => {
        try {
            setCanceling(true); const token = await AsyncStorage.getItem('access_token');
            if (!token) return navigation.navigate('Login');
            await authApis(token).patch(`${endpoints['appointments']}${selected.id}/cancel/`);
            setVisible(false);
            setSelected(null);
            loadAppointments();
        }
        catch (ex) { console.log('Lỗi hủy:', ex.response?.data || ex); }
        finally { setCanceling(false); }
    };

    useEffect(() => { loadAppointments(); }, []);

    const formatTime = t => t ? String(t).slice(0, 5) : '--:--';
    const getStatus = s => s === 'pending' ? 'Chờ xác nhận' : s === 'confirmed' ? 'Đã xác nhận' : s === 'completed' ? 'Đã khám' : s === 'cancelled' ? 'Đã hủy' : 'Chưa cập nhật';

    const renderItem = ({ item }) => {
        const date = item.work_schedule?.date || '--',
            start = formatTime(item.time_slot_detail?.start_time),
            end = formatTime(item.time_slot_detail?.end_time);
        const cancelled = item.status === 'cancelled';
        return (<Card style={{ marginVertical: 6, padding: 6, backgroundColor: '#fdfdfd' }}><Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text variant="titleMedium">#{item.id}</Text>
                <Chip compact>{getStatus(item.status)}</Chip>
            </View>
            <Text>Bác sĩ: {item.doctor_name || '--'}</Text>
            <Text>Ngày: {date}</Text>
            <Text>Giờ: {start} - {end}</Text>
            {item.disease_description ? <Text>Mô tả: {item.disease_description}</Text> : <Text>Mô tả: --</Text>}
            {item.services_detail?.length > 0 && <Text>Dịch vụ: {item.services_detail.map(s => s.name).join(', ')}</Text>}
            {!cancelled && <Button mode="outlined" style={{ marginTop: 6 }} onPress={() => {
                setSelected(item);
                setVisible(true)
            }}>Hủy</Button>}
        </Card.Content></Card>);
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
            <Text variant="titleLarge" style={{ marginBottom: 12 }}>Lịch hẹn của tôi</Text>
            {loading && !refreshing ? <ActivityIndicator size="large" style={{ marginTop: 20 }} /> :
                <FlatList data={appointments} keyExtractor={i => i.id.toString()} renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            loadAppointments().finally(() => setRefreshing(false));
                        }} />}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có lịch hẹn nào</Text>} />
            }
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
            <BottomNavigation.Bar
                navigationState={{ index, routes }}
                onTabPress={({ route }) => {
                    const newIndex = routes.findIndex(r => r.key === route.key);
                    setIndex(newIndex);

                    if (route.key === 'home') navigation.navigate('Home');
                    if (route.key === 'schedule') navigation.navigate('MyAppointment');
                    if (route.key === 'profile' || route.key === 'account') navigation.navigate('Profile');
                }}
            />
        </View>
    );
};

export default MyAppointment;