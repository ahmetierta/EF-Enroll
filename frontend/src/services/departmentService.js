import httpClient from "../api/httpClient";

export const departmentService = {
  getAll: () => httpClient.get("/departments"),
  create: (departmentData) =>
    httpClient.post("/departments", departmentData),
  update: (departmentId, departmentData) =>
    httpClient.put(`/departments/${departmentId}`, departmentData),
  remove: (departmentId) =>
    httpClient.delete(`/departments/${departmentId}`),
};
