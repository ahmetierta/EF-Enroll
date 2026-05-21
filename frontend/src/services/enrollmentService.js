import httpClient from "../api/httpClient";

export const enrollmentService = {
  create: (courseId, durationMonths = 1) =>
    httpClient.post("/enrollments", {
      course_id: courseId,
      duration_months: durationMonths,
    }),
  getMine: () => httpClient.get("/enrollments/mine"),
  getAll: () => httpClient.get("/enrollments"),
};
