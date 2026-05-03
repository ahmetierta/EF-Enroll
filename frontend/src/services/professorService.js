import httpClient from "../api/httpClient";

export const professorService = {
  getAll: () => httpClient.get("/professors"),
  update: (professorId, professorData) =>
    httpClient.put(`/professors/${professorId}`, professorData),
  remove: (professorId) => httpClient.delete(`/professors/${professorId}`),
};
