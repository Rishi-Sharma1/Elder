import axios from "axios";
import { BASE_URL } from "../config/network";
import { getToken } from "../utils/storage";

const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("TOKEN FETCH FAILED:", e.message);
  }
  console.log(`📡 [${config.method?.toUpperCase()}] -> ${config.baseURL}${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
