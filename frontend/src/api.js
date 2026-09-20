import axios from "axios";

// Set VITE_API_URL at build/deploy time (see .env.example).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
