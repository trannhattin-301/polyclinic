import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card, TextInput, Button, Menu } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import styles from './Styles';

const MedicineManagement = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const selectedCategoryName = categories.find(item => item.id === selectedCategory)?.name || 'Tất cả';

  const loadCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');
      const res = await authApis(token).get(endpoints['medicine-categories']);
      setCategories([{ id: null, name: 'Tất cả' }, ...res.data]);
    } catch (ex) {
      console.log('Lỗi load nhóm thuốc:', ex.response?.data || ex.message || ex);
    }
  };

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');

      const res = await authApis(token).get(endpoints.medicines);
      setMedicines(res.data);
    } catch (ex) {
      console.log('Lỗi load thuốc:', ex.response?.data || ex.message || ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadMedicines();
  }, []);

  const filteredMedicines = medicines.filter(item => {
    const matchSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      !selectedCategory ||
      item.category?.id === selectedCategory;

    return matchSearch && matchCategory;
  });

  const renderMedicine = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{item.name || 'Tên thuốc'}</Text>
        <Text>Nhóm: {item.category?.name || 'Chưa xác định'}</Text>
        <Text>Giá: {item.price ?? '--'}</Text>
        <Text>Số lượng: {item.quantity ?? '--'}</Text>
        <Text>Mô tả: {item.description || 'Không có'}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Quản lý thuốc</Text>

      <View style={styles.topRow}>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button mode="outlined" onPress={openMenu} style={styles.dropdownButton}>
              {selectedCategoryName}
            </Button>
          }
        >
          {categories.map(item => (
            <Menu.Item
              key={item.id?.toString() || 'all'}
              onPress={() => {
                setSelectedCategory(item.id);
                closeMenu();
              }}
              title={item.name}
            />
          ))}
        </Menu>

        <Button onPress={() => navigation.navigate('InventoryTransactions')} mode="contained" style={styles.historyButton}>
          Xem lịch sử tồn kho
        </Button>
      </View>

      <TextInput
        label="Tìm kiếm thuốc"
        value={search}
        onChangeText={setSearch}
        mode="outlined"
        style={styles.search}
      />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredMedicines}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderMedicine}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadMedicines();
                setRefreshing(false);
              }}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>Chưa có thuốc nào</Text>}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Button mode="contained" onPress={loadMedicines} style={styles.button}>
        Tải lại
      </Button>
    </View>
  );
};

export default MedicineManagement;
