import httpClient from "../api/httpClient";

export const adminService = {
  getDashboardSummary: () => httpClient.get("/admin/dashboard-summary"),
  getPendingProfessors: () => httpClient.get("/admin/pending-professors"),
  approveProfessor: (userId) => httpClient.put(`/admin/users/${userId}/approve`),
  rejectProfessor: (userId) => httpClient.put(`/admin/users/${userId}/reject`),
};
