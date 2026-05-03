import httpClient from "../api/httpClient";

export const enrollmentService = {
  create: (courseId) => httpClient.post("/enrollments", { course_id: courseId }),
  getMine: () => httpClient.get("/enrollments/mine"),
  getAll: () => httpClient.get("/enrollments"),
};
