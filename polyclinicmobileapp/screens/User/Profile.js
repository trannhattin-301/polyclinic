import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { BottomNavigation, Card, Avatar, List, Button, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { MyUserContext, MyDispatchContext } from '../../configs/Contexts';

const Profile = ({ navigation }) => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [index, setIndex] = useState(4);

    const [routes] = useState([
        { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
        { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
        { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
        { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
        { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
    ]);

    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Người dùng';
    const avatarLabel = fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('access_token');
            dispatch({ type: 'LOGOUT' });
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (err) {
            console.log(err);
            Alert.alert('Lỗi', 'Đăng xuất thất bại!');
        }
    };

    const handleTabPress = ({ route }) => {
        const newIndex = routes.findIndex(r => r.key === route.key);
        setIndex(newIndex);

        if (route.key === 'home') navigation.navigate('Home');
        if (route.key === 'account') navigation.navigate('Profile');
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                {user?.avatar ? <Avatar.Image size={80} source={{ uri: user.avatar }} /> : <Avatar.Text size={80} label={avatarLabel} />}

                <Text style={styles.name}>{fullName}</Text>
                <Text style={styles.email}>{user?.email || 'Chưa có email'}</Text>
            </View>

            <ScrollView style={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <List.Item title="Họ tên" description={fullName} left={() => <List.Icon icon="account" />} />
                        <Divider />

                        <List.Item title="Email" description={user?.email || 'Chưa cập nhật'} left={() => <List.Icon icon="email" />} />
                        <Divider />

                        <List.Item title="Số điện thoại" description={user?.phone || 'Chưa cập nhật'} left={() => <List.Icon icon="phone" />} />
                        <Divider />

                        <List.Item title="Vai trò" description={user?.role || 'Chưa cập nhật'} left={() => <List.Icon icon="account-badge" />} />
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Button mode="contained" style={styles.button}>Chỉnh sửa hồ sơ</Button>

                        <Button mode="outlined" style={styles.button} textColor="red" onPress={logout}>
                            Đăng xuất
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>

            <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
        </View>
    );
};

export default Profile;