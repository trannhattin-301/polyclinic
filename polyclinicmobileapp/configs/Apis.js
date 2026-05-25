import axios from "axios";

// Nếu chạy Expo Go trên điện thoại thì dùng IP laptop, không dùng 127.0.0.1
const BASE_URL = "http://192.168.0.100:8000/";

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

  'medical-records': '/medical-records/',
  'prescriptions': '/prescriptions/',

  'medicine-categories': '/medicine-categories/',
  'medicines': '/medicines/',
  'inventory-transactions': '/inventory-transactions/',

  'appointment-messages': appointmentId => `/appointments/${appointmentId}/messages/`,
};

export const appointmentStatusEndpoints = {
  confirm: id => `/appointments/${id}/confirm/`,
  start: id => `/appointments/${id}/start/`,
  complete: id => `/appointments/${id}/complete/`,
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