import axios from "axios";
import { clearAuth, saveAuth } from "../utils/authStorage";

const httpClient = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      [401, 403].includes(error.response?.status) &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/refresh");

    if (shouldRefresh) {
      originalRequest._retry = true;

      try {
        const res = await refreshClient.post("/auth/refresh");

        saveAuth(res.data.user);
        return httpClient(originalRequest);
      } catch {
        clearAuth();
      }
    } else if ([401, 403].includes(error.response?.status)) {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

export default httpClient;
