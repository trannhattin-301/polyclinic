import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Avatar, BottomNavigation, Button, Card, Divider, List, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import styles from './Styles';
import { MyUserContext, MyDispatchContext } from '../../configs/Contexts';
import { endpoints, authApis } from '../../configs/Apis';

const routes = [
  { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
  { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
  { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
  { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
  { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
];

const roleLabels = {
  admin: 'Quản trị viên',
  doctor: 'Bác sĩ',
  nurse: 'Y tá',
  patient: 'Bệnh nhân',
};

const getFormData = user => ({
  username: user?.username || '',
  email: user?.email || '',
  phone: user?.phone || '',
  role: user?.role || '',
  avatar: null,
});

const Account = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);

  const [index, setIndex] = useState(4);
  const [form, setForm] = useState(getFormData(user));
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => setForm(getFormData(user)), [user]);

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Người dùng';
  const avatarLabel = fullName.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const avatarSource = form.avatar?.uri ? { uri: form.avatar.uri } : user?.avatar ? { uri: user.avatar } : null;

  const getRoleLabel = role => roleLabels[role] || role || 'Chưa cập nhật';
  const changeForm = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) changeForm('avatar', result.assets[0]);
  };

  const saveAccount = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      const data = new FormData();

      data.append('email', form.email);
      data.append('phone', form.phone);

      if (form.avatar) {
        data.append('avatar', {
          uri: form.avatar.uri,
          name: form.avatar.fileName || 'avatar.jpg',
          type: form.avatar.mimeType || 'image/jpeg',
        });
      }

      const res = await authApis(token).patch(endpoints['current-user'], data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch({ type: 'LOGIN', payload: res.data });
      setIsEditing(false);
      Alert.alert('Thành công', 'Cập nhật tài khoản thành công!');
    } catch (err) {
      console.log(err?.response?.data || err);
      Alert.alert('Lỗi', 'Cập nhật tài khoản thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setForm(getFormData(user));
    setIsEditing(false);
  };

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
    setIndex(routes.findIndex(r => r.key === route.key));

    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'schedule') navigation.navigate('MyAppointment');
    if (route.key === 'profile') navigation.navigate('Profile');
    if (route.key === 'notifications') navigation.navigate('Notifications');
    if (route.key === 'account') navigation.navigate('Account');
  };

  return (
    <View style={styles.profileContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          {avatarSource ? <Avatar.Image size={80} source={avatarSource} /> : <Avatar.Text size={80} label={avatarLabel || 'U'} />}
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{user?.email || 'Chưa có email'}</Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Title title="Thông tin tài khoản" />

            {!isEditing ? (
              <Card.Content>
                <List.Item title="Username" description={user?.username || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="account" />} />
                <Divider />
                <List.Item title="Email" description={user?.email || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="email" />} />
                <Divider />
                <List.Item title="Số điện thoại" description={user?.phone || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="phone" />} />
                <Divider />
                <List.Item title="Vai trò" description={getRoleLabel(user?.role)} left={props => <List.Icon {...props} icon="shield-account" />} />

                <Button mode="contained" style={styles.button} onPress={() => setIsEditing(true)}>Chỉnh sửa tài khoản</Button>
                <Button mode="outlined" textColor="red" style={styles.button} onPress={logout}>Đăng xuất</Button>
              </Card.Content>
            ) : (
              <Card.Content>
                <View style={styles.avatarWrapper}>
                  {avatarSource ? <Avatar.Image size={90} source={avatarSource} /> : <Avatar.Text size={90} label={avatarLabel || 'U'} />}
                  <Button mode="text" icon="camera" style={styles.avatarButton} onPress={pickAvatar}>Chọn ảnh đại diện</Button>
                </View>

                <TextInput label="Username" value={form.username} style={styles.input} mode="outlined" disabled />
                <TextInput label="Email" value={form.email} style={styles.input} mode="outlined" onChangeText={text => changeForm('email', text)} />
                <TextInput label="Số điện thoại" value={form.phone} style={styles.input} mode="outlined" keyboardType="phone-pad" onChangeText={text => changeForm('phone', text)} />
                <TextInput label="Vai trò" value={getRoleLabel(form.role)} style={styles.input} mode="outlined" disabled />

                <Button mode="contained" loading={loading} disabled={loading} style={styles.button} onPress={saveAccount}>Lưu tài khoản</Button>
                <Button mode="outlined" disabled={loading} style={styles.button} onPress={cancelEdit}>Hủy</Button>
              </Card.Content>
            )}
          </Card>
        </View>
      </ScrollView>

      <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
  );
};

export default Account;