import httpClient from "../api/httpClient";

export const announcementService = {
  getAll: () => httpClient.get("/announcements"),
  create: (announcementData) =>
    httpClient.post("/announcements", announcementData),
  update: (announcementId, announcementData) =>
    httpClient.put(`/announcements/${announcementId}`, announcementData),
  remove: (announcementId) =>
    httpClient.delete(`/announcements/${announcementId}`),
};
