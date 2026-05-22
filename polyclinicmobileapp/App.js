import { StatusBar } from 'expo-status-bar';
import { useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterScreen from './screens/User/Register';
import LoginScreen from './screens/User/Login';
import HomeScreen from './screens/Home/Home';
import ProfileScreen from './screens/User/Profile';

import SelectSpecialty from './Appointment/SelectSpecialty';
import SelectDoctor from './Appointment/SelectDoctor';
import SelectSchedule from './Appointment/SelectSchedule';

import { MyUserContext, MyDispatchContext } from './configs/Contexts';
import { MyUserReducer } from './reducers/reducers';

// MyUserContext: lưu thông tin user
// MyDispatchContext: dùng để gọi dispatch

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <StatusBar style="auto" />

          <Stack.Navigator initialRouteName="Register">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Thông tin tài khoản' }} />
            <Stack.Screen name="SelectSpecialty" component={SelectSpecialty} options={{ headerShown: true, title: 'Đặt lịch khám' }} />
            <Stack.Screen name="SelectDoctor" component={SelectDoctor} options={{ headerShown: true, title: 'Chọn bác sĩ' }} />
            <Stack.Screen name="SelectSchedule" component={SelectSchedule} options={{ headerShown: true, title: 'Chọn ngày khám' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}