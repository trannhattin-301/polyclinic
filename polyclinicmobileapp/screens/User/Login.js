import { useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';

const userInfo = [
  { field: 'email', label: 'Email', icon: 'email', keyboardType: 'email-address' },
  { field: 'password', label: 'Mật khẩu', icon: 'lock', secureTextEntry: true },
];

const Login = () => {
  const [user, setUser] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validate = () => {
    for (let i of userInfo) {
      if (!user[i.field]) {
        setErr(`Vui lòng nhập ${i.label}!`);
        return false;
      }
    }
  };

  const handleLogin = () => {
    if (validate()) {
      setErr('');
      setLoading(true);
      console.log('Đăng nhập:', user);
      // TODO: gọi API ở đây
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
          keyboardType={i.keyboardType || 'default'}
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          right={<TextInput.Icon icon={i.icon} />}
        />
      ))}

      <Button
        loading={loading}
        disabled={loading}
        onPress={handleLogin}
        mode="contained"
        style={styles.button}
      >
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