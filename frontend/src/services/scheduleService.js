import httpClient from "../api/httpClient";

export const scheduleService = {
  getAll: () => httpClient.get("/schedules"),
  create: (scheduleData) => httpClient.post("/schedules", scheduleData),
  update: (scheduleId, scheduleData) =>
    httpClient.put(`/schedules/${scheduleId}`, scheduleData),
  remove: (scheduleId) => httpClient.delete(`/schedules/${scheduleId}`),
};
