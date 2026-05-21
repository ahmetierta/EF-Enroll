import httpClient from "../api/httpClient";

export const courseService = {
  getAll: () => httpClient.get("/courses"),
  getPublicAll: () => httpClient.get("/courses", { skipAuth: true }),
  getPublicById: (courseId) =>
    httpClient.get(`/courses/${courseId}`, { skipAuth: true }),
  getById: (courseId) => httpClient.get(`/courses/${courseId}`),
  create: (courseData) => httpClient.post("/courses", courseData),
  update: (courseId, courseData) =>
    httpClient.put(`/courses/${courseId}`, courseData),
  remove: (courseId) => httpClient.delete(`/courses/${courseId}`),
};
