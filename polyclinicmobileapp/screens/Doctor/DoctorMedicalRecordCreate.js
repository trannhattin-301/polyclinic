import React, { useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { authApis, endpoints } from '../../configs/Apis';

const DoctorMedicalRecordCreate = ({ route, navigation }) => {
  const { appointment } = route.params || {};

  const [record, setRecord] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRecord = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const res = await authApis(token).get(`${endpoints['medical-records']}?appointment_id=${appointment.id}`);
      const data = Array.isArray(res.data) ? res.data : res.data.results;

      if (data?.length > 0) {
        const item = data[0];

        setRecord(item);
        setDiagnosis(item.diagnosis || '');
        setMedicalNotes(item.medical_notes || '');
        setFollowUpDate(item.follow_up_date || '');
      }
    } catch (ex) {
      console.log('Lỗi load bệnh án:', ex.response?.data || ex.message);
    }
  };

  const saveRecord = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập chẩn đoán!');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const payload = {
        appointment: appointment.id,
        diagnosis,
        medical_notes: medicalNotes,
        follow_up_date: followUpDate || null,
      };

      const res = record
        ? await authApis(token).patch(`${endpoints['medical-records']}${record.id}/`, payload)
        : await authApis(token).post(endpoints['medical-records'], payload);

      setRecord(res.data);
      Alert.alert('Thông báo', 'Lưu bệnh án thành công!');
      navigation.goBack();
    } catch (ex) {
      console.log('Lỗi lưu bệnh án:', ex.response?.data || ex.message);
      Alert.alert('Lỗi', 'Không thể lưu bệnh án!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointment?.id) loadRecord();
  }, []);

  if (!appointment) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text>Không có dữ liệu lịch hẹn.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ghi bệnh án</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Lịch hẹn #{appointment.id}</Text>
          <Text style={styles.cardText}>Bệnh nhân: {appointment.patient_name || '--'}</Text>
          <Text style={styles.cardText}>Ngày khám: {appointment.work_schedule?.date || '--'}</Text>
          <Text style={styles.cardText}>Mô tả bệnh: {appointment.disease_description || '--'}</Text>
        </Card.Content>
      </Card>

      <TextInput mode="outlined" label="Chẩn đoán" value={diagnosis} onChangeText={setDiagnosis} multiline style={styles.input} />
      <TextInput mode="outlined" label="Ghi chú điều trị" value={medicalNotes} onChangeText={setMedicalNotes} multiline style={styles.input} />
      <TextInput mode="outlined" label="Ngày tái khám, ví dụ: 2026-05-30" value={followUpDate} onChangeText={setFollowUpDate} style={styles.input} />

      {loading && <ActivityIndicator style={styles.loadingIcon} />}

      <Button mode="contained" style={styles.button} textColor="white" disabled={loading} onPress={saveRecord}>
        Lưu bệnh án
      </Button>

      <Button mode="contained" style={styles.button} textColor="white" onPress={() => navigation.goBack()}>
        Quay lại
      </Button>
    </ScrollView>
  );
};

export default DoctorMedicalRecordCreate;