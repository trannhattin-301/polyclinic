import { StatusBar } from 'expo-status-bar';
import { useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';

import RegisterScreen from './screens/User/Register';
import LoginScreen from './screens/User/Login';
import HomeScreen from './screens/Home/Home';
import ProfileScreen from './screens/User/Profile';

import SelectSpecialty from './Appointment/SelectSpecialty';
import SelectDoctor from './Appointment/SelectDoctor';
import SelectSchedule from './Appointment/SelectSchedule';
import MyAppointment from './Appointment/MyAppointments';
import MedicineManagementScreen from './screens/Medicine/MedicineManagement';
import InventoryTransactions from './screens/Medicine/InventoryTransactions';

import { MyUserContext, MyDispatchContext } from './configs/Contexts';
import { MyUserReducer } from './reducers/reducers';

// MyUserContext: lưu thông tin user
// MyDispatchContext: dùng để gọi dispatch

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <PaperProvider>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <NavigationContainer>
            <StatusBar style="auto" />

            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

              <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Thông tin tài khoản' }} />
              <Stack.Screen name="SelectSpecialty" component={SelectSpecialty} options={{ headerShown: true, title: 'Đặt lịch khám' }} />
              <Stack.Screen name="SelectDoctor" component={SelectDoctor} options={{ headerShown: true, title: 'Chọn bác sĩ' }} />
              <Stack.Screen name="SelectSchedule" component={SelectSchedule} options={{ headerShown: true, title: 'Chọn ngày khám' }} />
              <Stack.Screen name="MyAppointment" component={MyAppointment} options={{ headerShown: true, title: 'Lịch hẹn của tôi' }} />
              <Stack.Screen name="MedicineManagement" component={MedicineManagementScreen} options={{ headerShown: true, title: 'Quản lý thuốc' }} />
              <Stack.Screen name="InventoryTransactions" component={InventoryTransactions} options={{ headerShown: true, title: 'Tồn kho thuốc' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}