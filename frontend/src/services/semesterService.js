import httpClient from "../api/httpClient";

export const semesterService = {
  getAll: () => httpClient.get("/semesters"),
  create: (semesterData) => httpClient.post("/semesters", semesterData),
  update: (semesterId, semesterData) =>
    httpClient.put(`/semesters/${semesterId}`, semesterData),
  remove: (semesterId) => httpClient.delete(`/semesters/${semesterId}`),
};
