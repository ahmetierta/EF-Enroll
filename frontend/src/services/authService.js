import httpClient from "../api/httpClient";

export const authService = {
  login: (credentials) => httpClient.post("/auth/login", credentials),
  registerStudent: (studentData) =>
    httpClient.post("/auth/register/student", studentData),
  registerProfessor: (professorData) =>
    httpClient.post("/auth/register/professor", professorData),
  refresh: () => httpClient.post("/auth/refresh"),
  logout: () => httpClient.post("/auth/logout"),
  me: () => httpClient.get("/auth/me"),
};
