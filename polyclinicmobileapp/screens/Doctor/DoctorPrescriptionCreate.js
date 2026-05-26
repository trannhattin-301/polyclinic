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
  const [medicineSearch, setMedicineSearch] = useState('');

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
    setMedicineSearch('');
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
      Alert.alert('Thành công', 'Đã lưu đơn thuốc', [
        {
          text: 'Xem đơn thuốc',
          // ── Navigate tới Detail để Xác nhận và Phát thuốc ──
          onPress: () => navigation.replace('DoctorPrescriptionDetail', {
            prescriptionId: res.data.id
          }),
        }
      ]);
    } catch (ex) {
      console.log('Lỗi tạo đơn thuốc:', ex.response?.data || ex.message || ex);
      Alert.alert('Lỗi', 'Không thể tạo đơn thuốc');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading || loadingRecords) return <ActivityIndicator style={{ marginTop: 20 }} />;

  const currentRecord = medicalRecord || selectedRecord;

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    (m.category?.name && m.category.name.toLowerCase().includes(medicineSearch.toLowerCase()))
  );

  return (
    <ScrollView style={{ backgroundColor: '#f5f5f5' }} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}>
      <Text style={styles.title}>Kê đơn thuốc</Text>

      {!currentRecord ? (
        <View style={{ marginTop: 12, marginBottom: 40 }}>
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
            scrollEnabled={false}
            style={{ maxHeight: 400 }}
            ListEmptyComponent={<Text>Chưa có bệnh án nào để kê đơn</Text>}
          />
        </View>
      ) : (
        <View style={{ marginTop: 12, marginBottom: 40 }}>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>Bệnh án đã chọn: #{currentRecord.id}</Text>
          
          {!adding && (
            <Button mode="outlined" onPress={startAdd} style={{ marginBottom: 12 }}>
              Bắt đầu kê đơn
            </Button>
          )}

          {adding && (
            <>
              <TextInput 
                placeholder="Tìm kiếm theo tên thuốc hoặc loại" 
                value={medicineSearch} 
                onChangeText={setMedicineSearch}
                mode="outlined"
                style={{ marginBottom: 12 }}
              />
              
              <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: '600' }}>Chọn thuốc</Text>
              {filteredMedicines.map((item) => (
                <Card 
                  key={item.id}
                  style={{ 
                    marginBottom: 8, 
                    backgroundColor: selectedMedicine?.id === item.id ? '#e3f2fd' : '#fff',
                    borderWidth: selectedMedicine?.id === item.id ? 2 : 0,
                    borderColor: selectedMedicine?.id === item.id ? '#2196F3' : 'transparent'
                  }} 
                  onPress={() => setSelectedMedicine(item)}
                >
                  <Card.Content>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
                        <Text style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Loại: {item.category?.name || 'Không rõ'}</Text>
                        <Text style={{ fontSize: 13, color: '#999', marginTop: 2 }}>Tồn kho: {item.stock}</Text>
                      </View>
                      {selectedMedicine?.id === item.id && (
                        <IconButton icon="check-circle" iconColor="#2196F3" size={28} />
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))}
              {filteredMedicines.length === 0 && (
                <Card style={{ marginBottom: 12, backgroundColor: '#f5f5f5' }}>
                  <Card.Content>
                    <Text style={{ textAlign: 'center', color: '#999' }}>Không tìm thấy thuốc nào</Text>
                  </Card.Content>
                </Card>
              )}

              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
                <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: '600' }}>Thông tin liều lượng</Text>
                <TextInput 
                  label="Số lượng *" 
                  keyboardType="numeric" 
                  value={qty} 
                  onChangeText={setQty} 
                  style={{ marginBottom: 12 }} 
                  mode="outlined" 
                />
                <TextInput 
                  label="Liều (vd: 1 viên)" 
                  value={dosage} 
                  onChangeText={setDosage} 
                  style={{ marginBottom: 12 }} 
                  mode="outlined" 
                />
                <TextInput 
                  label="Tần suất (vd: 2 lần/ngày)" 
                  value={frequency} 
                  onChangeText={setFrequency} 
                  style={{ marginBottom: 12 }} 
                  mode="outlined" 
                />
                <TextInput 
                  label="Thời điểm (trước/sau ăn)" 
                  value={timing} 
                  onChangeText={setTiming} 
                  style={{ marginBottom: 12 }} 
                  mode="outlined" 
                />
                <TextInput 
                  label="Số ngày" 
                  keyboardType="numeric" 
                  value={duration} 
                  onChangeText={setDuration} 
                  style={{ marginBottom: 12 }} 
                  mode="outlined" 
                />
                <TextInput 
                  label="Ghi chú (thuốc)" 
                  value={itemNote} 
                  onChangeText={setItemNote} 
                  style={{ marginBottom: 16 }} 
                  mode="outlined" 
                  multiline
                />

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button 
                    mode="contained" 
                    onPress={addItem} 
                    style={{ flex: 1 }}
                  >
                    Thêm vào đơn
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={() => { setAdding(false); setMedicineSearch(''); }} 
                    style={{ flex: 1 }}
                  >
                    Hủy
                  </Button>
                </View>
              </View>
            </>
          )}

          <Text style={{ marginTop: 12, fontWeight: '600' }}>Các thuốc trong đơn:</Text>
          {items.length === 0 && <Text>Chưa có thuốc nào</Text>}
          {items.map((it, idx) => (
            <Card key={idx} style={{ marginTop: 8 }}>
              <Card.Content>
                <Text style={{ fontWeight: '600' }}>{it.medicine_detail?.name || it.medicine}</Text>
                <Text>Số lượng: {it.quantity}</Text>
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

          <TextInput 
            label="Ghi chú đơn thuốc" 
            value={notes} 
            onChangeText={setNotes} 
            style={{ marginTop: 12 }} 
            mode="outlined"
            multiline
          />
          <Button 
            mode="contained" 
            onPress={submitPrescription} 
            loading={loadingSubmit} 
            style={{ marginTop: 12, marginBottom: 40 }}
          >
            Lưu đơn thuốc
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default DoctorPrescriptionCreate;