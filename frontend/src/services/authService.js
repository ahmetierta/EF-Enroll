import httpClient from "../api/httpClient";

export const authService = {
  login: (credentials) => httpClient.post("/auth/login", credentials),
  registerStudent: (studentData) =>
    httpClient.post("/auth/register/student", studentData),
  registerProfessor: (professorData) =>
    httpClient.post("/auth/register/professor", professorData),
  forgotPassword: (email) => httpClient.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    httpClient.post("/auth/reset-password", { token, password }),
  refresh: () => httpClient.post("/auth/refresh"),
  logout: () => httpClient.post("/auth/logout"),
  logoutAll: () => httpClient.post("/auth/logout-all"),
  me: () => httpClient.get("/auth/me"),
  getSessions: () => httpClient.get("/auth/sessions"),
  revokeSession: (sessionId) => httpClient.delete(`/auth/sessions/${sessionId}`),
  revokeOtherSessions: () => httpClient.delete("/auth/sessions"),
};
