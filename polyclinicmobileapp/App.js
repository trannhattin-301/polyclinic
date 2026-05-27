import { StatusBar } from 'expo-status-bar';
import { useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';

import RegisterScreen from './screens/User/Register';
import LoginScreen from './screens/User/Login';
import HomeScreen from './screens/Home/Home';
import ProfileScreen from './screens/User/Profile';
import AccountScreen from './screens/User/Account';

import SelectSpecialty from './Appointment/SelectSpecialty';
import SelectDoctor from './Appointment/SelectDoctor';
import SelectSchedule from './Appointment/SelectSchedule';
import MyAppointment from './Appointment/MyAppointments';
import Chat from './Appointment/Chat';
import Notifications from './screens/Notification/Notifications';

import MedicineManagementScreen from './screens/Medicine/MedicineManagement';
import InventoryTransactions from './screens/Medicine/InventoryTransactions';

import DoctorHome from './screens/Doctor/DoctorHome';
import DoctorAppointments from './screens/Doctor/DoctorAppointments';
import DoctorAppointmentDetail from './screens/Doctor/DoctorAppointmentDetail';
import DoctorMedicineManagement from './screens/Doctor/DoctorMedicineManagement';
import DoctorPrescriptionCreate from './screens/Doctor/DoctorPrescriptionCreate';
import DoctorScheduleManagement from './screens/Doctor/DoctorScheduleManagement';
import DoctorMedicalRecordCreate from './screens/Doctor/DoctorMedicalRecordCreate';
import DoctorPrescriptionDetail from './screens/Doctor/DoctorPrescriptionDetail';

import PatientPrescriptions from './screens/Patient/PatientPrescriptions';
import PatientPrescriptionDetail from './screens/Patient/PatientPrescriptionDetail';

import AdminReport from './screens/Admin/AdminReport';

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
              <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: true, title: 'Tài khoản' }} />
              
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Thông tin tài khoản' }} />
              <Stack.Screen name="SelectSpecialty" component={SelectSpecialty} options={{ headerShown: true, title: 'Đặt lịch khám' }} />
              <Stack.Screen name="SelectDoctor" component={SelectDoctor} options={{ headerShown: true, title: 'Chọn bác sĩ' }} />
              <Stack.Screen name="SelectSchedule" component={SelectSchedule} options={{ headerShown: true, title: 'Chọn ngày khám' }} />
              <Stack.Screen name="MyAppointment" component={MyAppointment} options={{ headerShown: true, title: 'Lịch hẹn của tôi' }} />
              <Stack.Screen name="Chat" component={Chat} options={{ headerShown: true, title: 'Chat với bác sĩ' }} />
              <Stack.Screen name="MedicineManagement" component={MedicineManagementScreen} options={{ headerShown: true, title: 'Quản lý thuốc' }} />
              <Stack.Screen name="InventoryTransactions" component={InventoryTransactions} options={{ headerShown: true, title: 'Tồn kho thuốc' }} />
              <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: true, title: 'Thông báo' }} />

              <Stack.Screen name="DoctorHome" component={DoctorHome} options={{ title: 'Trang bác sĩ' }} />
              <Stack.Screen name="DoctorAppointments" component={DoctorAppointments} options={{ title: 'Lịch hẹn bác sĩ' }} />
              <Stack.Screen name="DoctorAppointmentDetail" component={DoctorAppointmentDetail} options={{ title: 'Chi tiết lịch hẹn' }} />
              <Stack.Screen name="DoctorMedicineManagement" component={DoctorMedicineManagement} options={{ title: 'Quản lý thuốc' }} />
              <Stack.Screen name="DoctorPrescriptionCreate" component={DoctorPrescriptionCreate} options={{ title: 'Kê đơn thuốc' }} />
              <Stack.Screen name="DoctorScheduleManagement" component={DoctorScheduleManagement} options={{ title: 'Lịch làm việc' }} />
              <Stack.Screen name="DoctorMedicalRecordCreate" component={DoctorMedicalRecordCreate} options={{ title: 'Ghi bệnh án' }} />
              <Stack.Screen name="DoctorPrescriptionDetail" component={DoctorPrescriptionDetail} options={{ title: 'Chi tiết đơn thuốc' }} />
              
              <Stack.Screen name="PatientPrescriptions" component={PatientPrescriptions} options={{ headerShown: true, title: 'Đơn thuốc của tôi' }} />
              <Stack.Screen name="PatientPrescriptionDetail" component={PatientPrescriptionDetail} options={{ headerShown: true, title: 'Chi tiết đơn thuốc' }} />

              <Stack.Screen name="AdminReport" component={AdminReport} options={{ headerShown: true, title: 'Báo cáo thống kê' }} />

            </Stack.Navigator>
          </NavigationContainer>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </PaperProvider>
  );
}