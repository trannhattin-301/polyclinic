import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import styles from './InventoryStyles';

const TYPE_COLOR = { dispense: '#4CAF50', import: '#2196F3', adjust: '#FF9800' };
const TYPE_LABEL = { dispense: 'Xuất kho', import: 'Nhập kho', adjust: 'Điều chỉnh' };

const groupByPrescription = (transactions) => {
  const groups = {};
  transactions.forEach(t => {
    const key = t.prescription ? `rx_${t.prescription}` : `other_${t.id}`;
    if (!groups[key]) {
      groups[key] = { key, prescriptionId: t.prescription ?? null, date: t.created_date, items: [] };
    }
    groups[key].items.push(t);
    if (t.created_date > groups[key].date) groups[key].date = t.created_date;
  });
  return Object.values(groups).sort((a, b) => b.date?.localeCompare(a.date));
};

const PrescriptionGroup = ({ group, onPress }) => {
  const { prescriptionId, date, items } = group;
  const totalQty = items.reduce((s, t) => s + (t.quantity ?? 0), 0);
  const types = [...new Set(items.map(t => t.type))];

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>
              {prescriptionId ? `Đơn thuốc #${prescriptionId}` : 'Giao dịch thủ công'}
            </Text>
            <Text style={styles.cardDate}>{date ? date.slice(0, 10) : '--'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {types.map(t => (
              <Chip key={t} style={{ backgroundColor: TYPE_COLOR[t] ?? '#9E9E9E' }} textStyle={{ color: '#fff', fontSize: 11 }}>
                {TYPE_LABEL[t] ?? t}
              </Chip>
            ))}
          </View>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Số loại thuốc</Text>
            <Text style={styles.summaryValue}>{items.length} loại</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng số lượng</Text>
            <Text style={styles.summaryValue}>{totalQty}</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Text style={styles.viewDetail}>Xem chi tiết →</Text>
      </Card.Actions>
    </Card>
  );
};

const GroupDetail = ({ group, onClose }) => {
  const { prescriptionId, date, items } = group;

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.detailTitle}>
            {prescriptionId ? `Đơn thuốc #${prescriptionId}` : 'Giao dịch thủ công'}
          </Text>
          <Text style={styles.cardDate}>{date ? date.slice(0, 10) : '--'}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕ Đóng</Text>
        </TouchableOpacity>
      </View>
      <Divider style={{ marginBottom: 12 }} />
      {items.map((t, idx) => (
        <Card key={t.id ?? idx} style={styles.itemCard}>
          <Card.Content>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>
                {t.medicine?.name ?? `Thuốc #${t.medicine?.id ?? '--'}`}
              </Text>
              <Chip style={{ backgroundColor: TYPE_COLOR[t.type] ?? '#9E9E9E' }} textStyle={{ color: '#fff', fontSize: 10 }}>
                {TYPE_LABEL[t.type] ?? t.type}
              </Chip>
            </View>
            <View style={styles.dosageGrid}>
              <View style={styles.dosageItem}>
                <Text style={styles.dosageLabel}>Số lượng</Text>
                <Text style={styles.dosageValue}>{t.quantity}</Text>
              </View>
              <View style={styles.dosageItem}>
                <Text style={styles.dosageLabel}>Tồn trước</Text>
                <Text style={styles.dosageValue}>{t.stock_before ?? '--'}</Text>
              </View>
              <View style={styles.dosageItem}>
                <Text style={styles.dosageLabel}>Tồn sau</Text>
                <Text style={styles.dosageValue}>{t.stock_after ?? '--'}</Text>
              </View>
              <View style={styles.dosageItem}>
                <Text style={styles.dosageLabel}>Người thực hiện</Text>
                <Text style={styles.dosageValue}>
                  {t.created_by ? `${t.created_by.last_name} ${t.created_by.first_name}` : '--'}
                </Text>
              </View>
            </View>
            {t.note ? <Text style={styles.itemNote}>Ghi chú: {t.note}</Text> : null}
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

const InventoryTransactions = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');
      const res = await authApis(token).get(endpoints['inventory-transactions']);
      const data = res.data?.results ?? res.data ?? [];
      setGroups(groupByPrescription(data));
    } catch (ex) {
      console.log('Lỗi tải giao dịch:', ex.response?.data || ex.message);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#1E88E5" /></View>;
  }

  if (selectedGroup) {
    return (
      <FlatList
        data={[]}
        ListHeaderComponent={<GroupDetail group={selectedGroup} onClose={() => setSelectedGroup(null)} />}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        style={{ backgroundColor: '#f5f5f5' }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Lịch sử giao dịch kho</Text>
      <FlatList
        data={groups}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <PrescriptionGroup group={item} onPress={() => setSelectedGroup(item)} />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có giao dịch nào</Text>}
      />
    </View>
  );
};

export default InventoryTransactions;