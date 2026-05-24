import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import styles from './Styles';

const InventoryTransactions = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');
      const res = await authApis(token).get(endpoints['inventory-transactions']);
      setTransactions(res.data);
    } catch (ex) {
      console.log('Lỗi load tồn kho:', ex.response?.data || ex.message || ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const renderTransaction = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Giao dịch #{item.id}</Text>
        <Text>Thuốc: {item.medicine?.name || item.medicine || item.medicine_name || 'Không rõ'}</Text>
        <Text>Loại: {item.type || item.transaction_type || 'Không xác định'}</Text>
        <Text>Số lượng: {item.quantity ?? '--'}</Text>
        <Text>Ngày: {item.created_at || item.date || '--'}</Text>
        {item.note ? <Text>Ghi chú: {item.note}</Text> : null}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Giao dịch tồn kho</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderTransaction}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadTransactions();
                setRefreshing(false);
              }}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>Chưa có giao dịch tồn kho</Text>}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default InventoryTransactions;
