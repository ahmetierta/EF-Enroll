import axios from "axios";
import { clearAuth, getAuthToken } from "../utils/authStorage";

const httpClient = axios.create({
  baseURL: "http://localhost:5000",
});

httpClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config;
  }

  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error.response?.status)) {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

export default httpClient;
