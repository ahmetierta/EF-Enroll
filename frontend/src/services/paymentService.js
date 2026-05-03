import httpClient from "../api/httpClient";

export const paymentService = {
  create: (enrollmentId) =>
    httpClient.post("/payments", { enrollment_id: enrollmentId }),
  getMine: () => httpClient.get("/payments/mine"),
  getAll: () => httpClient.get("/payments"),
};
