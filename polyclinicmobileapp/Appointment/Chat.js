import React, { useContext, useEffect, useState } from 'react';

import { View, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

import { Text, TextInput, Button, Card } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { authApis, endpoints } from '../configs/Apis';

import { MyUserContext } from '../configs/Contexts';

const Chat = ({ route, navigation }) => {
    const { appointment } = route.params;

    const user = useContext(MyUserContext);

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const loadMessages = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem('access_token');

            if (!token) return navigation.navigate('Login');

            const res = await authApis(token).get(endpoints['appointment-messages'](appointment.id));

            setMessages(res.data);
        }
        catch (ex) {
            console.log('Lỗi load tin nhắn:', ex.response?.data || ex);
        }
        finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!content.trim()) return;

        try {
            setSending(true);

            const token = await AsyncStorage.getItem('access_token');

            if (!token) return navigation.navigate('Login');

            await authApis(token).post(endpoints['appointment-messages'](appointment.id), { content });

            setContent('');

            loadMessages();
        }
        catch (ex) {
            console.log('Lỗi gửi tin nhắn:', ex.response?.data || ex);
        }
        finally {
            setSending(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const isMyMessage = (item) => {
        if (item.sender === user?.id) return true;
        if (item.sender?.id === user?.id) return true;
        return false;
    };

    const renderItem = ({ item }) => {
        const mine = isMyMessage(item);

        return (
            <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <View style={{
                    maxWidth: '78%',
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor: mine ? '#1976D2' : '#e0e0e0'
                }}>
                    {!mine && <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>{item.sender_name || 'Bác sĩ'}</Text>}

                    <Text style={{ color: mine ? 'white' : 'black' }}>{item.content}</Text>

                    {item.created_date && (
                        <Text style={{
                            fontSize: 10,
                            marginTop: 4,
                            textAlign: 'right',
                            color: mine ? '#eeeeee' : '#555'
                        }}>
                            {String(item.created_date).slice(11, 16)}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 12, backgroundColor: '#f5f5f5' }}>
                <Card style={{ marginBottom: 10 }}>
                    <Card.Content>
                        <Text variant="titleMedium">Lịch hẹn #{appointment.id}</Text>
                        <Text>Bác sĩ: {appointment.doctor_name || '--'}</Text>
                        <Text>Trạng thái: {appointment.status || '--'}</Text>
                    </Card.Content>
                </Card>

                {loading ? <ActivityIndicator size="large" style={{ marginTop: 20 }} /> : (
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 10 }}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có tin nhắn</Text>}
                    />
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <TextInput
                        mode="outlined"
                        value={content}
                        placeholder="Nhập tin nhắn..."
                        onChangeText={setContent}
                        style={{ flex: 1, backgroundColor: 'white' }}
                    />

                    <Button mode="contained" loading={sending} disabled={sending} onPress={sendMessage} style={{ marginLeft: 8 }}>
                        Gửi
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Chat;