import axios from "axios";
import { getAccessToken } from "./token";

const axiosCustom = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ Đọc từ biến môi trường
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Nếu backend set cookie (nếu không thì bỏ)
});

// Request interceptor
axiosCustom.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosCustom.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Authentication error");
    }
    return Promise.reject(error);
  }
);

export default axiosCustom;
