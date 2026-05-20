import httpClient from "../api/httpClient";

export const waitingListService = {
  getAll: () => httpClient.get("/waiting-list"),
  create: (courseId) => httpClient.post("/waiting-list", { course_id: courseId }),
  promote: (waitingListId) =>
    httpClient.post(`/waiting-list/${waitingListId}/promote`),
  remove: (waitingListId) => httpClient.delete(`/waiting-list/${waitingListId}`),
};
