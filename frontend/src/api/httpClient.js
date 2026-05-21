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

let refreshPromise = null;

httpClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    config.withCredentials = false;
    delete config.skipAuth;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/refresh");

    if (shouldRefresh) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post("/auth/refresh")
            .finally(() => {
              refreshPromise = null;
            });
        }

        const res = await refreshPromise;

        saveAuth(res.data.user);
        return httpClient(originalRequest);
      } catch {
        clearAuth();
      }
    } else if (error.response?.status === 401) {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

export default httpClient;
