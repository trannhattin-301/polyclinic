import { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import styles from './Styles';
import Apis, { endpoints } from '../../configs/Apis';

const userInfo = [
  { field: 'username', label: 'Tên đăng nhập', icon: 'account' },
  { field: 'email', label: 'Email', icon: 'email', keyboardType: 'email-address' },
  { field: 'firstName', label: 'Họ', icon: 'account' },
  { field: 'lastName', label: 'Tên', icon: 'account' },
  { field: 'phone', label: 'Số điện thoại', icon: 'phone', keyboardType: 'phone-pad' },
  { field: 'password', label: 'Mật khẩu', icon: 'lock', secureTextEntry: true },
  { field: 'confirmPassword', label: 'Xác nhận mật khẩu', icon: 'lock-check', secureTextEntry: true },
];

const Register = () => {
  const [user, setUser] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validate = () => {
    for (let i of userInfo)
      if (!user[i.field]) {
        setErr(`Vui lòng nhập ${i.label}!`);
        return false;
      }

    if (user.password !== user.confirmPassword) {
      setErr('Mật khẩu không khớp!');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setErr('');
    setLoading(true);

    try {
      const form = new FormData();

      form.append('username', user.username);
      form.append('password', user.password);
      form.append('first_name', user.firstName);
      form.append('last_name', user.lastName);
      form.append('email', user.email);
      form.append('phone', user.phone);

      await Apis.post(endpoints.register, form, { headers: { 'Content-Type': 'multipart/form-data' } });

      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
      navigation.navigate('Login');
    } catch (ex) {
      console.log('Lỗi đăng ký:', ex.response?.data || ex.message);
      setErr(ex.response?.data ? JSON.stringify(ex.response.data) : 'Không thể kết nối đến server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <HelperText type="error" visible={!!err}>{err}</HelperText>

      {userInfo.map(i => (
        <TextInput
          key={i.field}
          label={i.label}
          value={user[i.field] || ''}
          onChangeText={t => setUser({ ...user, [i.field]: t })}
          secureTextEntry={!!i.secureTextEntry}
          keyboardType={i.keyboardType || 'default'}
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          right={<TextInput.Icon icon={i.icon} />}
        />
      ))}

      <Button loading={loading} disabled={loading} onPress={handleRegister} mode="contained" style={styles.button}>
        Đăng ký
      </Button>

      <View style={styles.linkRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Register;