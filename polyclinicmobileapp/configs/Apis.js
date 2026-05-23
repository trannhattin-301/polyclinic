import axios from "axios";

// Nếu chạy Expo Go trên điện thoại thì dùng IP laptop, không dùng 127.0.0.1
const BASE_URL = "http://192.168.123.65:8000/";

export const endpoints = {
  'register': '/users/',
  'login': '/o/token/',
  'current-user': '/users/current-user/',

  'specialties': '/specialties/',
  'services': '/services/',
  'staff': '/staff/',
  'work-schedules': '/work-schedules/',
  'time-slots': '/time-slots/',
  'appointments': '/appointments/',
  'medicine-categories': '/medicine-categories/',
  'medicines': '/medicines/',
  'inventory-transactions': '/inventory-transactions/',
};

export const authApis = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export default axios.create({
  baseURL: BASE_URL
});