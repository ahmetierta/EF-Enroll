import httpClient from "../api/httpClient";

export const adminService = {
  getPendingProfessors: () => httpClient.get("/admin/pending-professors"),
  approveProfessor: (userId) => httpClient.put(`/admin/users/${userId}/approve`),
  rejectProfessor: (userId) => httpClient.put(`/admin/users/${userId}/reject`),
};
