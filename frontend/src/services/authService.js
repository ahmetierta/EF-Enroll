import httpClient from "../api/httpClient";

export const authService = {
  login: (credentials) => httpClient.post("/auth/login", credentials),
  registerStudent: (studentData) =>
    httpClient.post("/auth/register/student", studentData),
  registerProfessor: (professorData) =>
    httpClient.post("/auth/register/professor", professorData),
  me: () => httpClient.get("/auth/me"),
};
