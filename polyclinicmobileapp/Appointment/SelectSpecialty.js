import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { BottomNavigation, Card, Searchbar, Text } from 'react-native-paper';

import styles from './Styles';
import Apis, { endpoints } from '../configs/Apis';

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
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const res = await Apis.get(endpoints.specialties);
      setSpecialties(res.data);
    } catch (ex) {
      console.log('Lỗi load chuyên khoa:', ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSpecialties(); }, []);

  const handleTabPress = ({ route }) => {
    setIndex(routes.findIndex(r => r.key === route.key));

    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'account') navigation.navigate('Profile');
  };

  const filteredSpecialties = specialties.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.root}>
      <Searchbar placeholder="Tìm chuyên khoa" value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBar} inputStyle={styles.searchInput} />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={filteredSpecialties}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có chuyên khoa</Text>}
          renderItem={({ item }) => (
            <Card style={styles.listCard} onPress={() => navigation.navigate('SelectDoctor', { specialty: item })}>
              <Card.Title title={item.name} subtitle={item.description} />
            </Card>
          )}
        />
      )}

      <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
    </View>
  );
};

export default SelectSpecialty;