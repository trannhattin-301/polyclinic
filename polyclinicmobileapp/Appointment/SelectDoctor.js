import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { Card, Avatar, Text, BottomNavigation, Searchbar } from 'react-native-paper';

import styles from './Styles';
import Apis, { endpoints } from '../configs/Apis';

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
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await Apis.get(endpoints.staff);
      const data = res.data.filter(item => item.specialties?.some(s => typeof s === 'number' ? s === specialty.id : s.id === specialty.id));
      setDoctors(data);
    } catch (ex) {
      console.log('Lỗi load bác sĩ:', ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDoctors(); }, []);

  const getDoctorName = item => {
    const fullName = `${item.user?.last_name || ''} ${item.user?.first_name || ''}`.trim();
    return fullName ? `BS. ${fullName}` : item.user?.username || 'Bác sĩ';
  };

  const filteredDoctors = doctors.filter(item => getDoctorName(item).toLowerCase().includes(searchQuery.toLowerCase()));

  const handleTabPress = ({ route }) => {
    const newIndex = routes.findIndex(r => r.key === route.key);
    setIndex(newIndex);
    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'account') navigation.navigate('Profile');
  };

  return (
    <View style={{ flex: 1 }}>
      <Text variant="titleMedium" style={{ margin: 10 }}>Chuyên khoa: {specialty.name}</Text>

      <Searchbar placeholder="Tìm bác sĩ" onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} inputStyle={styles.searchInput} />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 10 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có bác sĩ thuộc chuyên khoa này</Text>}
          renderItem={({ item }) => (
            <Card style={{ marginHorizontal: 10, marginVertical: 6 }} onPress={() => navigation.navigate('SelectSchedule', { specialty, doctor: item })}>
              <Card.Title
                title={getDoctorName(item)}
                subtitle={`${item.degree || 'Bác sĩ'} • ${item.experience || 0} năm kinh nghiệm`}
                left={props => <Avatar.Image {...props} source={require('../assets/doctor.png')} />}
              />
            </Card>
          )}
        />
      )}

      <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
  );
};

export default SelectDoctor;