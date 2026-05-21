import httpClient from "../api/httpClient";

export const materialService = {
  getAll: (params = {}) => httpClient.get("/materials", { params }),
  create: (materialData) => httpClient.post("/materials", materialData),
  update: (materialId, materialData) =>
    httpClient.put(`/materials/${materialId}`, materialData),
  remove: (materialId) => httpClient.delete(`/materials/${materialId}`),
};
