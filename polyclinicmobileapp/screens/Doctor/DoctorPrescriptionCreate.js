import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, ScrollView } from 'react-native';
import { Text, Button, TextInput, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './Styles';
import { authApis, endpoints } from '../../configs/Apis';

const DoctorPrescriptionCreate = ({ route, navigation }) => {
  const { appointment, medicalRecord } = route.params || {};
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [items, setItems] = useState([]);
  const [qty, setQty] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [timing, setTiming] = useState('');
  const [duration, setDuration] = useState('');
  const [itemNote, setItemNote] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadMedicines();
    if (!medicalRecord) loadMedicalRecords();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');
      const res = await authApis(token).get(endpoints.medicines);
      setMedicines(res.data || []);
    } catch (ex) {
      console.log('Lỗi load thuốc:', ex.response?.data || ex.message || ex);
      Alert.alert('Lỗi', 'Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  const loadMedicalRecords = async () => {
    try {
      setLoadingRecords(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');
      const res = await authApis(token).get(endpoints['medical-records']);
      setMedicalRecords(res.data || []);
    } catch (ex) {
      console.log('Lỗi load bệnh án:', ex.response?.data || ex.message || ex);
      Alert.alert('Lỗi', 'Không thể tải danh sách bệnh án');
    } finally {
      setLoadingRecords(false);
    }
  };

  const startAdd = () => {
    setSelectedMedicine(null);
    setQty('');
    setDosage('');
    setFrequency('');
    setTiming('');
    setDuration('');
    setItemNote('');
    setAdding(true);
  };

  const selectMedicalRecord = record => {
    setSelectedRecord(record);
    setAdding(false);
  };

  const addItem = () => {
    if (!selectedMedicine) return Alert.alert('Lỗi', 'Vui lòng chọn thuốc');
    if (!qty || Number(qty) <= 0) return Alert.alert('Lỗi', 'Số lượng không hợp lệ');

    const newItem = {
      medicine: selectedMedicine.id,
      quantity: Number(qty),
      dosage: dosage || '',
      frequency: frequency || '',
      timing: timing || '',
      duration_days: duration ? Number(duration) : 0,
      notes: itemNote || '',
      medicine_detail: selectedMedicine,
    };

    setItems(prev => [...prev, newItem]);
    setAdding(false);
  };

  const removeItem = idx => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const submitPrescription = async () => {
    const currentRecord = medicalRecord || selectedRecord;
    if (!currentRecord?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy bệnh án. Vui lòng chọn bệnh án trước.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một thuốc vào đơn');
      return;
    }

    try {
      setLoadingSubmit(true);
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return navigation.navigate('Login');

      const payload = {
        medical_record: currentRecord.id,
        notes: notes || '',
        items: items.map(i => ({
          medicine: i.medicine,
          quantity: i.quantity,
          dosage: i.dosage,
          frequency: i.frequency,
          timing: i.timing,
          duration_days: i.duration_days,
          notes: i.notes,
        }))
      };

      const res = await authApis(token).post(endpoints.prescriptions, payload);
      Alert.alert('Thành công', 'Đã tạo đơn thuốc');
      navigation.goBack();
    } catch (ex) {
      console.log('Lỗi tạo đơn thuốc:', ex.response?.data || ex.message || ex);
      Alert.alert('Lỗi', 'Không thể tạo đơn thuốc');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading || loadingRecords) return <ActivityIndicator style={{ marginTop: 20 }} />;

  const currentRecord = medicalRecord || selectedRecord;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kê đơn thuốc</Text>

      {!currentRecord ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>Chọn bệnh án để kê đơn</Text>
          <FlatList
            data={medicalRecords}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <Card style={{ marginTop: 8 }} onPress={() => selectMedicalRecord(item)}>
                <Card.Content>
                  <Text>Số bệnh án: {item.id}</Text>
                  <Text>Bệnh nhân: {item.patient?.name || 'Không rõ'}</Text>
                  <Text>Chẩn đoán: {item.diagnosis || 'Chưa có'}</Text>
                </Card.Content>
              </Card>
            )}
            nestedScrollEnabled
            style={{ maxHeight: 400 }}
            ListEmptyComponent={<Text>Chưa có bệnh án nào để kê đơn</Text>}
          />
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>Bệnh án đã chọn: #{currentRecord.id}</Text>
          <Button mode="outlined" onPress={startAdd} style={{ marginBottom: 12 }}>
            Bắt đầu kê đơn
          </Button>

          {adding && (
            <Card style={{ padding: 8 }}>
              <Text variant="titleMedium">Chọn thuốc</Text>
              <FlatList
                data={medicines}
                keyExtractor={m => m.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                  <Card style={{ marginTop: 8 }} onPress={() => setSelectedMedicine(item)}>
                    <Card.Content>
                      <Text>{item.name} ({item.stock})</Text>
                    </Card.Content>
                    {selectedMedicine?.id === item.id && <IconButton icon="check" />}
                  </Card>
                )}
                nestedScrollEnabled
                style={{ maxHeight: 250 }}
              />

              <TextInput label="Số lượng" keyboardType="numeric" value={qty} onChangeText={setQty} style={{ marginTop: 8 }} />
              <TextInput label="Liều (vd: 1 viên)" value={dosage} onChangeText={setDosage} style={{ marginTop: 8 }} />
              <TextInput label="Tần suất (vd: 2 lần/ngày)" value={frequency} onChangeText={setFrequency} style={{ marginTop: 8 }} />
              <TextInput label="Thời điểm (trước/sau ăn)" value={timing} onChangeText={setTiming} style={{ marginTop: 8 }} />
              <TextInput label="Số ngày" keyboardType="numeric" value={duration} onChangeText={setDuration} style={{ marginTop: 8 }} />
              <TextInput label="Ghi chú (thuốc)" value={itemNote} onChangeText={setItemNote} style={{ marginTop: 8 }} />

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Button mode="contained" onPress={addItem}>
                  Thêm vào đơn
                </Button>
                <Button mode="outlined" onPress={() => setAdding(false)}>
                  Hủy
                </Button>
              </View>
            </Card>
          )}

          <Text style={{ marginTop: 12, fontWeight: '600' }}>Các thuốc trong đơn:</Text>
          {items.length === 0 && <Text>Chưa có thuốc nào</Text>}
          {items.map((it, idx) => (
            <Card key={idx} style={{ marginTop: 8 }}>
              <Card.Content>
                <Text>{it.medicine_detail?.name || it.medicine} x{it.quantity}</Text>
                <Text>Liều: {it.dosage}</Text>
                <Text>Tần suất: {it.frequency}</Text>
                <Text>Thời gian: {it.duration_days} ngày</Text>
                {it.notes ? <Text>Ghi chú: {it.notes}</Text> : null}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => removeItem(idx)}>Xóa</Button>
              </Card.Actions>
            </Card>
          ))}

          <TextInput label="Ghi chú đơn thuốc" value={notes} onChangeText={setNotes} style={{ marginTop: 12 }} />
          <Button mode="contained" onPress={submitPrescription} loading={loadingSubmit} style={{ marginTop: 12 }}>
            Lưu đơn thuốc
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default DoctorPrescriptionCreate;