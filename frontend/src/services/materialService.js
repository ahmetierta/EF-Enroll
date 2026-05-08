import httpClient from "../api/httpClient";

export const materialService = {
  getAll: (params = {}) => httpClient.get("/materials", { params }),
  create: (materialData) => httpClient.post("/materials", materialData),
};
