import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';

const STATUS_COLOR = {
  draft: '#FF9800',
  confirmed: '#2196F3',
  dispensed: '#4CAF50',
  cancelled: '#F44336',
};

const STATUS_LABEL = {
  draft: 'Đang tạo',
  confirmed: 'Hoàn tất',
  dispensed: 'Đã phát',
  cancelled: 'Đã huỷ',
};

const PatientPrescriptions = ({ navigation }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');
      const res = await authApis(token).get(endpoints.prescriptions);
      const data = res.data?.results ?? res.data ?? [];
      setPrescriptions(data);
      setFiltered(data);
    } catch (ex) {
      console.log('Lỗi tải đơn thuốc:', ex.response?.data || ex.message);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFiltered(prescriptions);
    } else {
      const q = text.toLowerCase();
      setFiltered(prescriptions.filter(p =>
        String(p.id).includes(q) ||
        (p.notes || '').toLowerCase().includes(q) ||
        (STATUS_LABEL[p.status] || '').toLowerCase().includes(q)
      ));
    }
  };

  const renderItem = ({ item }) => {
    const doctorUser = item.medical_record?.appointment?.time_slot
      ?.work_schedule?.staff_profile?.user;
    const doctorDisplay = doctorUser
      ? `BS. ${doctorUser.last_name} ${doctorUser.first_name}`
      : 'Bác sĩ';
    const appointmentDate = item.medical_record?.appointment?.time_slot
      ?.work_schedule?.date;
    const itemCount = item.items?.length ?? 0;

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('PatientPrescriptionDetail', { prescriptionId: item.id })}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.prescriptionId}>Đơn thuốc #{item.id}</Text>
            <Chip
              style={{ backgroundColor: STATUS_COLOR[item.status] ?? '#9E9E9E' }}
              textStyle={{ color: '#fff', fontSize: 11 }}
            >
              {STATUS_LABEL[item.status] ?? item.status}
            </Chip>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Bác sĩ kê đơn:</Text>
            <Text style={styles.value}>{doctorDisplay}</Text>
          </View>
          {appointmentDate ? (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Ngày khám:</Text>
              <Text style={styles.value}>{appointmentDate}</Text>
            </View>
          ) : null}
          <View style={styles.cardRow}>
            <Text style={styles.label}>Số loại thuốc:</Text>
            <Text style={styles.value}>{itemCount} loại</Text>
          </View>
          {item.notes ? (
            <Text style={styles.notes} numberOfLines={2}>Ghi chú: {item.notes}</Text>
          ) : null}
        </Card.Content>
        <Card.Actions>
          <Text style={styles.viewDetail}>Xem chi tiết →</Text>
        </Card.Actions>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải đơn thuốc...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm theo số đơn, trạng thái..."
        value={search}
        onChangeText={handleSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 13 }}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Bạn chưa có đơn thuốc nào</Text>
            <Text style={styles.emptySubText}>
              Đơn thuốc sẽ xuất hiện sau khi bác sĩ kê đơn cho bạn
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 12,
    marginBottom: 4,
    elevation: 1,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prescriptionId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E88E5',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#666',
    width: 130,
  },
  value: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  notes: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  viewDetail: {
    color: '#1E88E5',
    fontSize: 13,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PatientPrescriptions;