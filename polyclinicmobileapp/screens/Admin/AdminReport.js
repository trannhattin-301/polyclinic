import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authApis, endpoints } from '../../configs/Apis';
import { MyDispatchContext } from '../../configs/Contexts';
import styles from './Styles';

const AdminReport = ({ navigation }) => {
    const dispatch = useContext(MyDispatchContext);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadReport = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem('access_token');
            const res = await authApis(token).get(endpoints['admin-reports']);

            setReport(res.data);
        } catch (ex) {
            console.log('Lỗi tải thống kê:', ex.response?.data || ex.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('access_token');

        dispatch({
            type: 'LOGOUT',
        });

        navigation.replace('Login');
    };

    useEffect(() => {
        loadReport();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Đang tải thống kê...</Text>
            </View>
        );
    }

    const overview = report?.overview || {};
    const status = report?.appointment_status || {};

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Thống kê báo cáo</Text>

            <Text style={styles.sectionTitle}>Tổng quan</Text>

            <View style={styles.row}>
                <ReportCard title="Bệnh nhân" value={overview.total_patients} />
                <ReportCard title="Bác sĩ" value={overview.total_doctors} />
            </View>

            <View style={styles.row}>
                <ReportCard title="Thuốc" value={overview.total_medicines} />
                <ReportCard title="Lịch hẹn" value={overview.total_appointments} />
            </View>

            <Text style={styles.sectionTitle}>Lịch hẹn theo trạng thái</Text>

            <StatusCard title="Chờ xác nhận" value={status.pending} />
            <StatusCard title="Đã xác nhận" value={status.confirmed} />
            <StatusCard title="Đang khám" value={status.in_progress} />
            <StatusCard title="Đã hoàn thành" value={status.completed} />
            <StatusCard title="Đã hủy" value={status.cancelled} />

            <Button mode="outlined" style={styles.logoutButton} onPress={logout}>
                Đăng xuất
            </Button>
        </ScrollView>
    );
};

const ReportCard = ({ title, value }) => (
    <Card style={styles.card}>
        <Card.Content>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardNumber}>{value || 0}</Text>
        </Card.Content>
    </Card>
);

const StatusCard = ({ title, value }) => (
    <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
            <Text style={styles.statusTitle}>{title}</Text>
            <Text style={styles.statusNumber}>{value || 0}</Text>
        </Card.Content>
    </Card>
);

export default AdminReport;