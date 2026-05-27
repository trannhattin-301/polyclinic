import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authApis, endpoints } from '../../configs/Apis';
import styles from '../Doctor/Styles';

const PatientMedicalRecords = ({ navigation }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadRecords = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                navigation.navigate('Login');
                return;
            }

            const res = await authApis(token).get(endpoints['medical-records']);
            const data = Array.isArray(res.data) ? res.data : res.data.results;

            setRecords(data || []);
        } catch (ex) {
            console.log('Lỗi tải hồ sơ bệnh án:', ex.response?.data || ex.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, []);

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.cardTitle}>Bệnh án #{item.id}</Text>

                <Text style={styles.cardText}>
                    Ngày khám: {item.appointment_detail?.work_schedule?.date || '--'}
                </Text>

                <Text style={styles.cardText}>
                    Giờ khám: {item.appointment_detail?.time_slot?.start_time || '--'} - {item.appointment_detail?.time_slot?.end_time || '--'}
                </Text>

                <Text style={styles.cardText}>
                    Bác sĩ: {item.doctor?.name || '--'}
                </Text>

                <Text style={styles.cardText}>
                    Triệu chứng ban đầu: {item.appointment_detail?.disease_description || '--'}
                </Text>

                <Text style={styles.cardText}>
                    Chẩn đoán: {item.diagnosis || '--'}
                </Text>

                <Text style={styles.cardText}>
                    Ghi chú điều trị: {item.medical_notes || '--'}
                </Text>

                <Text style={styles.cardText}>
                    Ngày tái khám: {item.follow_up_date || '--'}
                </Text>
            </Card.Content>
        </Card>
    );

    if (loading && records.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text>Đang tải hồ sơ bệnh án...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hồ sơ bệnh án</Text>

            <FlatList
                data={records}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRecords} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Chưa có hồ sơ bệnh án.</Text>
                }
            />
        </View>
    );
};

export default PatientMedicalRecords;