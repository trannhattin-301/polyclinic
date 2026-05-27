import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import { authApis, endpoints } from '../configs/Apis';
import { MyUserContext } from '../configs/Contexts';

const Chat = ({ route, navigation }) => {
  const { appointment } = route.params || {};
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
    } catch (ex) {
      console.log('Lỗi load tin nhắn:', ex.response?.data || ex);
    } finally {
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
    } catch (ex) {
      console.log('Lỗi gửi tin nhắn:', ex.response?.data || ex);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { if (appointment?.id) loadMessages(); }, [appointment]);

  const isMyMessage = item => item.sender === user?.id || item.sender?.id === user?.id;

  const renderItem = ({ item }) => {
    const mine = isMyMessage(item);

    return (
      <View style={mine ? styles.myMessageRow : styles.otherMessageRow}>
        <View style={mine ? styles.myMessageBox : styles.otherMessageBox}>
          {!mine && <Text style={styles.senderName}>{item.sender_name || 'Bác sĩ'}</Text>}
          <Text style={mine ? styles.myMessageText : styles.otherMessageText}>{item.content}</Text>
          {item.created_date && <Text style={mine ? styles.myMessageTime : styles.otherMessageTime}>{String(item.created_date).slice(11, 16)}</Text>}
        </View>
      </View>
    );
  };

  if (!appointment) {
    return (
      <View style={styles.chatEmptyContainer}>
        <Text style={styles.chatEmptyText}>Vui lòng chọn lịch hẹn trước khi tư vấn.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('MyAppointment')}>Chọn lịch hẹn</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={styles.chatContainer}>
        <Card style={styles.chatInfoCard}>
          <Card.Content>
            <Text variant="titleMedium">Lịch hẹn #{appointment.id}</Text>
            <Text>Bác sĩ: {appointment.doctor_name || '--'}</Text>
            <Text>Trạng thái: {appointment.status || '--'}</Text>
          </Card.Content>
        </Card>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loading} />
        ) : (
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tin nhắn</Text>}
          />
        )}

        <View style={styles.chatInputRow}>
          <TextInput mode="outlined" value={content} placeholder="Nhập tin nhắn..." onChangeText={setContent} style={styles.chatInput} />
          <Button mode="contained" loading={sending} disabled={sending} onPress={sendMessage} style={styles.sendButton}>Gửi</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;