import httpClient from "../api/httpClient";

export const professorService = {
  getAll: () => httpClient.get("/professors"),
  create: (professorData) => httpClient.post("/professors", professorData),
  update: (professorId, professorData) =>
    httpClient.put(`/professors/${professorId}`, professorData),
  remove: (professorId) => httpClient.delete(`/professors/${professorId}`),
};
