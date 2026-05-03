import httpClient from "../api/httpClient";

export const announcementService = {
  getAll: () => httpClient.get("/announcements"),
  create: (announcementData) =>
    httpClient.post("/announcements", announcementData),
};
