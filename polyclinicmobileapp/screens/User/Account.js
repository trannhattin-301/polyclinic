import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { BottomNavigation, Card, Avatar, List, Button, Divider, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import styles from './Styles';
import { MyUserContext, MyDispatchContext } from '../../configs/Contexts';
import { endpoints, authApis } from '../../configs/Apis';

const Profile = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);

  const [index, setIndex] = useState(4);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', role: '', avatar: null });

  const [routes] = useState([
    { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
    { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
    { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
    { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  ]);

  useEffect(() => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
      avatar: null,
    });
  }, [user]);

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Người dùng';
  const avatarLabel = fullName.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const getRoleLabel = role => {
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'doctor') return 'Bác sĩ';
    if (role === 'nurse') return 'Y tá';
    if (role === 'patient') return 'Bệnh nhân';
    return role || 'Chưa cập nhật';
  };

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

  const getAvatarSource = () => {
    if (form.avatar?.uri) return { uri: form.avatar.uri };
    if (user?.avatar) return { uri: user.avatar };
    return null;
  };

  const saveProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      const data = new FormData();

      data.append('first_name', form.first_name);
      data.append('last_name', form.last_name);
      data.append('email', form.email);
      data.append('phone', form.phone);
      data.append('role', form.role);

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
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
    } catch (err) {
      console.log(err?.response?.data || err);
      Alert.alert('Lỗi', 'Cập nhật hồ sơ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
      avatar: null,
    });

    setIsEditing(false);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      dispatch({ type: 'LOGOUT' });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Lỗi', 'Đăng xuất thất bại!');
    }
  };

  const handleTabPress = ({ route }) => {
    const newIndex = routes.findIndex(r => r.key === route.key);
    setIndex(newIndex);

    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'account' || route.key === 'profile') navigation.navigate('Profile');
  };

  const avatarSource = getAvatarSource();

  return (
    <View style={styles.profileContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          {avatarSource ? <Avatar.Image size={80} source={avatarSource} /> : <Avatar.Text size={80} label={avatarLabel || 'U'} />}

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{user?.email || 'Chưa có email'}</Text>
        </View>

        <View style={styles.content}>
          {!isEditing ? (
            <>
              <Card style={styles.card}>
                <Card.Title title="Thông tin cá nhân" />

                <Card.Content>
                  <List.Item title="Họ và tên" description={fullName} left={props => <List.Icon {...props} icon="account" />} />
                  <Divider />

                  <List.Item title="Email" description={user?.email || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="email" />} />
                  <Divider />

                  <List.Item title="Số điện thoại" description={user?.phone || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="phone" />} />
                  <Divider />

                  <List.Item title="Vai trò" description={getRoleLabel(user?.role)} left={props => <List.Icon {...props} icon="account-badge" />} />
                </Card.Content>
              </Card>

              <Button mode="contained" icon="account-edit" style={styles.button} onPress={() => setIsEditing(true)}>
                Chỉnh sửa hồ sơ
              </Button>

              <Button mode="outlined" icon="logout" style={styles.button} onPress={logout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Card style={styles.card}>
                <Card.Title title="Chỉnh sửa hồ sơ" />

                <Card.Content>
                  <View style={styles.avatarWrapper}>
                    {avatarSource ? <Avatar.Image size={90} source={avatarSource} /> : <Avatar.Text size={90} label={avatarLabel || 'U'} />}

                    <Button mode="outlined" icon="camera" style={styles.avatarButton} onPress={pickAvatar}>
                      Chọn ảnh đại diện
                    </Button>
                  </View>

                  <TextInput label="Họ" mode="outlined" value={form.first_name} style={styles.profileInput} onChangeText={text => changeForm('first_name', text)} />
                  <TextInput label="Tên" mode="outlined" value={form.last_name} style={styles.profileInput} onChangeText={text => changeForm('last_name', text)} />
                  <TextInput label="Email" mode="outlined" value={form.email} keyboardType="email-address" autoCapitalize="none" style={styles.profileInput} onChangeText={text => changeForm('email', text)} />
                  <TextInput label="Số điện thoại" mode="outlined" value={form.phone} keyboardType="phone-pad" style={styles.profileInput} onChangeText={text => changeForm('phone', text)} />
                  <TextInput label="Vai trò" mode="outlined" value={form.role} style={styles.profileInput} onChangeText={text => changeForm('role', text)} />
                </Card.Content>
              </Card>

              <Button mode="contained" icon="content-save" style={styles.button} loading={loading} disabled={loading} onPress={saveProfile}>
                Lưu hồ sơ
              </Button>

              <Button mode="outlined" icon="close" style={styles.button} disabled={loading} onPress={cancelEdit}>
                Hủy
              </Button>
            </>
          )}
        </View>
      </ScrollView>

      <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
  );
};

export default Profile;