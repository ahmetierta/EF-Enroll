import httpClient from "../api/httpClient";

export const studentService = {
  getAll: (params = {}) => httpClient.get("/students", { params }),
  create: (studentData) => httpClient.post("/students", studentData),
  update: (studentId, studentData) =>
    httpClient.put(`/students/${studentId}`, studentData),
  remove: (studentId) => httpClient.delete(`/students/${studentId}`),
};
