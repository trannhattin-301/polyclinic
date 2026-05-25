import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card, TextInput, Button, Menu, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import { MyUserContext } from '../../configs/Contexts';
import styles from './Styles';

const MedicineManagement = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Check permission - only doctor and nurse can access
  useEffect(() => {
    if (user && user.role !== 'doctor' && user.role !== 'nurse') {
      navigation.navigate('Home');
    }
  }, [user]);

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

  const renderMedicine = ({ item }) => {
    const isLowStock = item.is_low_stock;
    const isExpired = item.is_expired;
    const isNearExpiry = item.is_near_expiry;

    return (
      <Card style={[styles.card, isLowStock ? styles.lowStockCard : styles.normalStockCard]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium">{item.name || 'Tên thuốc'}</Text>
              <Text>Nhóm: {item.category?.name || 'Chưa xác định'}</Text>
              <Text>Giá: {item.price ?? '--'}</Text>
            </View>
            {isLowStock && (
              <View style={styles.lowStockBadge}>
                <Text style={styles.lowStockText}>⚠ Cảnh báo</Text>
              </View>
            )}
          </View>

          <Text style={{ marginTop: 8 }}>Số lượng: {item.stock ?? '--'} {item.unit ? `(${item.unit})` : ''}</Text>
          {isLowStock && (
            <Text style={{ color: '#ff6b6b', marginTop: 4, fontSize: 12 }}>
              ⚠ Dưới ngưỡng cảnh báo ({item.low_stock_threshold})
            </Text>
          )}
          {isExpired && (
            <Text style={{ color: '#d32f2f', marginTop: 4, fontSize: 12 }}>❌ Đã hết hạn</Text>
          )}
          {isNearExpiry && !isExpired && (
            <Text style={{ color: '#ffa726', marginTop: 4, fontSize: 12 }}>⏰ Sắp hết hạn</Text>
          )}
          <Text style={{ marginTop: 8 }}>Mô tả: {item.description || 'Không có'}</Text>
        </Card.Content>
      </Card>
    );
  };

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
