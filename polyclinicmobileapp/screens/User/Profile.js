import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { BottomNavigation, Button, Card, Divider, List, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const emptyForm = {
  first_name: '',
  last_name: '',
  dob: '',
  gender: '',
  blood_group: '',
  insurance_number: '',
  insurance_expiry_date: '',
  height: '',
  weight: '',
  allergy_history: '',
};

const Profile = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);

  const [index, setIndex] = useState(2);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);

  const getFormData = profile => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    blood_group: profile?.blood_group || '',
    insurance_number: profile?.insurance_number || '',
    insurance_expiry_date: profile?.insurance_expiry_date || '',
    height: profile?.height ? String(profile.height) : '',
    weight: profile?.weight ? String(profile.weight) : '',
    allergy_history: profile?.allergy_history || '',
  });

  const getGenderLabel = gender => {
    if (gender === 'male') return 'Nam';
    if (gender === 'female') return 'Nữ';
    if (gender === 'other') return 'Khác';
    return gender || 'Chưa cập nhật';
  };

  const changeForm = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const loadPatientProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await authApis(token).get(endpoints['patient-profile']);

      setPatientProfile(res.data);
      setForm(getFormData(res.data));
    } catch (err) {
      console.log(err?.response?.data || err);
    }
  };

  useEffect(() => {
    loadPatientProfile();
  }, [user]);

  const saveProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      const userData = new FormData();

      userData.append('first_name', form.first_name);
      userData.append('last_name', form.last_name);
      userData.append('dob', form.dob);
      userData.append('gender', form.gender);

      const userRes = await authApis(token).patch(endpoints['current-user'], userData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const profileData = {
        height: form.height || null,
        weight: form.weight || null,
        insurance_number: form.insurance_number,
        insurance_expiry_date: form.insurance_expiry_date || null,
        blood_group: form.blood_group,
        allergy_history: form.allergy_history,
      };

      const profileRes = await authApis(token).patch(endpoints['patient-profile'], profileData);

      dispatch({ type: 'LOGIN', payload: userRes.data });
      setPatientProfile(profileRes.data);
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
    setForm(getFormData(patientProfile));
    setIsEditing(false);
  };

  const handleTabPress = ({ route }) => {
    setIndex(routes.findIndex(r => r.key === route.key));

    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'schedule') navigation.navigate('MyAppointment');
    if (route.key === 'profile') navigation.navigate('Profile');
    if (route.key === 'account') navigation.navigate('Account');
  };

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Chưa cập nhật';

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.flexScroll}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Title title="Hồ sơ bệnh nhân" subtitle="Thông tin cá nhân và y tế" />

            {!isEditing ? (
              <View>
                <List.Item title="Họ tên" description={fullName} left={props => <List.Icon {...props} icon="account" />} />
                <Divider />
                <List.Item title="Ngày sinh" description={user?.dob || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="calendar" />} />
                <Divider />
                <List.Item title="Giới tính" description={getGenderLabel(user?.gender)} left={props => <List.Icon {...props} icon="gender-male-female" />} />
                <Divider />
                <List.Item title="Nhóm máu" description={patientProfile?.blood_group || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="water" />} />
                <Divider />
                <List.Item title="Số bảo hiểm" description={patientProfile?.insurance_number || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="card-account-details" />} />
                <Divider />
                <List.Item title="Ngày hết hạn bảo hiểm" description={patientProfile?.insurance_expiry_date || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="calendar-alert" />} />
                <Divider />
                <List.Item title="Chiều cao" description={patientProfile?.height ? `${patientProfile.height} cm` : 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="human-male-height" />} />
                <Divider />
                <List.Item title="Cân nặng" description={patientProfile?.weight ? `${patientProfile.weight} kg` : 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="weight-kilogram" />} />
                <Divider />
                <List.Item title="Tiền sử dị ứng" description={patientProfile?.allergy_history || 'Chưa cập nhật'} left={props => <List.Icon {...props} icon="alert-circle" />} />

                <Button mode="contained" style={styles.button} onPress={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</Button>
              </View>
            ) : (
              <View>
                <TextInput label="Tên" value={form.first_name} style={styles.input} mode="outlined" onChangeText={text => changeForm('first_name', text)} />
                <TextInput label="Họ" value={form.last_name} style={styles.input} mode="outlined" onChangeText={text => changeForm('last_name', text)} />
                <TextInput label="Ngày sinh YYYY-MM-DD" value={form.dob} style={styles.input} mode="outlined" onChangeText={text => changeForm('dob', text)} />
                <TextInput label="Giới tính male/female/other" value={form.gender} style={styles.input} mode="outlined" onChangeText={text => changeForm('gender', text)} />
                <TextInput label="Nhóm máu" value={form.blood_group} style={styles.input} mode="outlined" onChangeText={text => changeForm('blood_group', text)} />
                <TextInput label="Số bảo hiểm" value={form.insurance_number} style={styles.input} mode="outlined" onChangeText={text => changeForm('insurance_number', text)} />
                <TextInput label="Ngày hết hạn bảo hiểm YYYY-MM-DD" value={form.insurance_expiry_date} style={styles.input} mode="outlined" onChangeText={text => changeForm('insurance_expiry_date', text)} />
                <TextInput label="Chiều cao cm" value={form.height} style={styles.input} mode="outlined" keyboardType="numeric" onChangeText={text => changeForm('height', text)} />
                <TextInput label="Cân nặng kg" value={form.weight} style={styles.input} mode="outlined" keyboardType="numeric" onChangeText={text => changeForm('weight', text)} />
                <TextInput label="Tiền sử dị ứng" value={form.allergy_history} style={styles.input} mode="outlined" multiline onChangeText={text => changeForm('allergy_history', text)} />

                <Button mode="contained" loading={loading} disabled={loading} style={styles.button} onPress={saveProfile}>Lưu hồ sơ</Button>
                <Button mode="outlined" style={styles.button} onPress={cancelEdit}>Hủy</Button>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>

      <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
  );
};

export default Profile;