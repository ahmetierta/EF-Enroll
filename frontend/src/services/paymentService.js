import httpClient from "../api/httpClient";

export const paymentService = {
  create: (enrollmentId, paymentData = {}) =>
    httpClient.post("/payments", { enrollment_id: enrollmentId, ...paymentData }),
  getMine: () => httpClient.get("/payments/mine"),
  getAll: () => httpClient.get("/payments"),
  getRevenueSummary: () => httpClient.get("/payments/revenue/summary"),
  refund: (paymentId, notes = "") =>
    httpClient.put(`/payments/${paymentId}/refund`, { notes }),
};
