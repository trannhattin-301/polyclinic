import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/User/Register';
import LoginScreen from './screens/User/Login';
import HomeScreen from './screens/Home/Home';
import ProfileScreen from './screens/User/Profile';
import SelectSpecialty from './Appointment/SelectSpecialty';
import SelectDoctor from './Appointment/SelectDoctor';
import SelectSchedule from './Appointment/SelectSchedule';


const Stack = createNativeStackNavigator();

export default function App() {
 return (
  <NavigationContainer>
    <StatusBar style="auto" />  
    <Stack.Navigator initialRouteName="SelectSpecialty">
      <Stack.Screen name="Login" component={LoginScreen}    options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen}     options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Thông tin tài khoản' }}/>
      <Stack.Screen name="SelectSpecialty" component={SelectSpecialty} options={{ headerShown: true, title: 'Đặt lịch khám' }}/>
      <Stack.Screen name="SelectDoctor" component={SelectDoctor} options={{ headerShown: true, title: 'Chọn bác sĩ' }}/>
      <Stack.Screen name="SelectSchedule" component={SelectSchedule} options={{ headerShown: true, title: 'Chọn ngày khám' }}/>

    </Stack.Navigator>
  </NavigationContainer>
);
}