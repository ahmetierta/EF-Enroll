import httpClient from "../api/httpClient";

export const courseService = {
  getAll: () => httpClient.get("/courses"),
  create: (courseData) => httpClient.post("/courses", courseData),
  update: (courseId, courseData) =>
    httpClient.put(`/courses/${courseId}`, courseData),
  remove: (courseId) => httpClient.delete(`/courses/${courseId}`),
};
