import { useContext, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Styles';
import Apis, { endpoints, authApis } from '../../configs/Apis';
import { MyDispatchContext } from '../../configs/Contexts';

const CLIENT_ID = 'q0HDNWb5oJl8A43PWAdeROTsKb2UXf6L7gmliQ7O';
const CLIENT_SECRET = 'pB2Mbo0DUM81Vjs2k4HP9WNX621UCtx8Jbp2v8yH2kDwG62Ua0U6U5kjoqDGOUvdwxXOX6tvzFhYJ6jnHbDhBBCo0HBjcJ6cXHirz50PiQjArWAeam34HwoUIZ6haEUM';

const userInfo = [
  { field: 'username', label: 'Tên đăng nhập', icon: 'account' },
  { field: 'password', label: 'Mật khẩu', icon: 'lock', secureTextEntry: true },
];

const Login = () => {
  const [user, setUser] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useContext(MyDispatchContext);

  const validate = () => {
    for (let i of userInfo)
      if (!user[i.field]) {
        setErr(`Vui lòng nhập ${i.label}!`);
        return false;
      }

    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setErr('');
    setLoading(true);

    try {
      const form = new URLSearchParams();
      form.append('username', user.username);
      form.append('password', user.password);
      form.append('grant_type', 'password');
      form.append('client_id', CLIENT_ID);
      form.append('client_secret', CLIENT_SECRET);


      const res = await Apis.post(endpoints.login, form.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = res.data.access_token;
      await AsyncStorage.setItem('access_token', token);

      const currentUser = await authApis(token).get(endpoints['current-user']);
      dispatch({ type: 'LOGIN', payload: currentUser.data });

      console.log('Current user:', currentUser.data);

      if (currentUser.data.role === 'admin') {
        navigation.navigate('AdminReport');
      } else if (['doctor', 'nurse'].includes(currentUser.data.role)) {
        navigation.navigate('DoctorHome');
      } else {
        navigation.navigate('Home');
      }
    } catch (ex) {
      console.log('Lỗi đăng nhập:', ex.response?.data || ex.message);

      if (ex.response?.data?.error_description) setErr(ex.response.data.error_description);
      else if (ex.response?.data) setErr(JSON.stringify(ex.response.data));
      else setErr('Không thể kết nối đến server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <HelperText type="error" visible={!!err}>{err}</HelperText>

      {userInfo.map(i => (
        <TextInput
          key={i.field}
          label={i.label}
          value={user[i.field] || ''}
          onChangeText={t => setUser({ ...user, [i.field]: t })}
          secureTextEntry={!!i.secureTextEntry}
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          right={<TextInput.Icon icon={i.icon} />}
        />
      ))}

      <Button loading={loading} disabled={loading} onPress={handleLogin} mode="contained" style={styles.button}>
        Đăng nhập
      </Button>

      <View style={styles.linkRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Login;