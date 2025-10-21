import axios from "axios";
import useAuthStore from "../store/useAuthStore";

// Priority: VITE_API_URL env > production URL > local dev
const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://careerconnect-v2.onrender.com/api";

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
