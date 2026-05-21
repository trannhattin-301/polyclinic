import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/User/Register';
import LoginScreen from './screens/User/Login';
import HomeScreen from './screens/Home/Home';
import ProfileScreen from './screens/User/Profile';

const Stack = createNativeStackNavigator();

export default function App() {
 return (
  <NavigationContainer>
    <StatusBar style="auto" />  
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen name="Login" component={LoginScreen}    options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen}     options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Thông tin tài khoản' }}/>
    </Stack.Navigator>
  </NavigationContainer>
);
}