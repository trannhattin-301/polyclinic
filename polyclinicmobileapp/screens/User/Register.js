import { useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';

const userInfo = [
  { field: 'fullName',        label: 'Họ và tên',          icon: 'account' },
  { field: 'email',           label: 'Email',               icon: 'email',      keyboardType: 'email-address' },
  { field: 'password',        label: 'Mật khẩu',            icon: 'lock',       secureTextEntry: true },
  { field: 'confirmPassword', label: 'Xác nhận mật khẩu',  icon: 'lock-check', secureTextEntry: true },
];

const Register = () => {
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
    if (user.password !== user.confirmPassword) {
      setErr('Mật khẩu không khớp!');
      return false;
    }
    return true;
  };

  const handleRegister = () => {
    if (validate()) {
      setErr('');
      setLoading(true);
      console.log('Đăng ký:', user);
      // TODO: gọi API ở đây
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

      <Button
        loading={loading}
        disabled={loading}
        onPress={handleRegister}
        mode="contained"
        style={styles.button}
      >
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