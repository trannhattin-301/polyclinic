import React, { useState, useContext } from 'react';
import { View, Text, FlatList } from 'react-native';
import { BottomNavigation, Searchbar, Card } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import styles from './Styles';
import { MyUserContext } from '../../configs/Contexts';


const HomeRoute = () => <Text>Trang chủ</Text>;
const ScheduleRoute = () => <Text>Lịch hẹn</Text>;
const ProfileRoute = () => <Text>Hồ sơ</Text>;
const NotificationsRoute = () => <Text>Thông báo</Text>;
const AccountRoute = () => <Text>Tài khoản</Text>;

const Home = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');


  const [routes] = useState([
    { key: 'home', title: 'Trang chủ', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'schedule', title: 'Lịch hẹn', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
    { key: 'profile', title: 'Hồ sơ', focusedIcon: 'file-document', unfocusedIcon: 'file-document-outline' },
    { key: 'notifications', title: 'Thông báo', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
    { key: 'account', title: 'Tài khoản', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  ]);


  const handleMenuPress = (key) => {
    if (key === 'appointment') navigation.navigate('SelectSpecialty');
    if (key === 'prescription') navigation.navigate('PatientPrescriptions');
    if (key === 'record') navigation.navigate('MyAppointment');
    if (key === 'consult') navigation.navigate('MyAppointment');
  };

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    schedule: ScheduleRoute,
    profile: ProfileRoute,
    notifications: NotificationsRoute,
    account: AccountRoute,
  });
  const handleTabPress = ({ route }) => {
    const newIndex = routes.findIndex(r => r.key === route.key);
    setIndex(newIndex);

    if (route.key === 'home') navigation.navigate('Home');
    if (route.key === 'schedule') navigation.navigate('MyAppointment');
    if (route.key === 'profile') navigation.navigate('Profile');
    if (route.key === 'notifications') navigation.navigate('Notifications');
    if (route.key === 'account') navigation.navigate('Account');
  };


  const menuItems = [
    { key: 'appointment', label: 'Đặt lịch khám', icon: 'calendar' },
    { key: 'prescription', label: 'Đơn thuốc', icon: 'medkit' },
    { key: 'record', label: 'Hồ sơ bệnh án', icon: 'book' },
    { key: 'consult', label: 'Tư vấn online', icon: 'phone' },
  ];

  const currentUser = useContext(MyUserContext);
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xin chào, {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Người dùng'}</Text>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}

        />
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={menuItems}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={item => item.key}
          columnWrapperStyle={styles.menuRow}
          renderItem={({ item }) => (
            <Card style={styles.menuCard} onPress={() => handleMenuPress(item.key)}>
              <Card.Content style={styles.menuCardContent}>
                <FontAwesome name={item.icon} size={30} color="#1E88E5" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Card.Content>
            </Card>
          )}
        />

        <BottomNavigation.Bar navigationState={{ index, routes }} onTabPress={handleTabPress} renderScene={renderScene} />
      </View>
    </View>
  );
};

export default Home;