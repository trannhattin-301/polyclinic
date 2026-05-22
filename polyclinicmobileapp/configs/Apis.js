import axios from "axios";

// Nếu chạy Expo Go trên điện thoại thì dùng IP laptop, không dùng 127.0.0.1
const BASE_URL = "http://192.168.0.100:8000/";

export const endpoints = {
  register: "/users/",
  login: "/o/token/",
  currentUser: "/users/current-user/",

  specialties: "/specialties/",
  services: "/services/",
  staff: "/staff/",
  workSchedules: "/work-schedules/",
  timeSlots: "/time-slots/",
};

export const authApis = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});