import httpClient from "../api/httpClient";

export const waitingListService = {
  getAll: () => httpClient.get("/waiting-list"),
  create: (courseId, details = {}) =>
    httpClient.post("/waiting-list", { course_id: courseId, ...details }),
  update: (waitingListId, waitingListData) =>
    httpClient.patch(`/waiting-list/${waitingListId}`, waitingListData),
  promote: (waitingListId) =>
    httpClient.post(`/waiting-list/${waitingListId}/promote`),
  remove: (waitingListId) => httpClient.delete(`/waiting-list/${waitingListId}`),
};
