import React, { useContext, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { BottomNavigation, Searchbar, Card } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';

import styles from './Styles';
import { MyUserContext } from '../../configs/Contexts';

const routes = [
  { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
  { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
  { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
  { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
  { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
];

const menuItems = [
  { key: 'appointment', label: 'Đặt lịch khám', icon: 'calendar' },
  { key: 'prescription', label: 'Đơn thuốc', icon: 'medkit' },
  { key: 'record', label: 'Hồ sơ bệnh án', icon: 'book' },
];

const Home = ({ navigation }) => {
  const currentUser = useContext(MyUserContext);
  const [index, setIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuPress = key => {
    if (key === 'appointment') navigation.navigate('SelectSpecialty');
    if (key === 'prescription') navigation.navigate('PatientPrescriptions');
    if (key === 'record') navigation.navigate('PatientMedicalRecords');
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
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Xin chào, {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Người dùng'}
        </Text>

        <Searchbar
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      <View style={styles.body}>
        <FlatList
          data={menuItems}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={item => item.key}
          columnWrapperStyle={styles.menuRow}
          renderItem={({ item }) => (
            <Card style={styles.menuCard} onPress={() => handleMenuPress(item.key)}>
              <Card.Content style={styles.menuCardContent}>
                <FontAwesome name={item.icon} size={30} color="dodgerblue" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Card.Content>
            </Card>
          )}
        />

        <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default Home;