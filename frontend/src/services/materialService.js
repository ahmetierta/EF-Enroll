import httpClient from "../api/httpClient";

export const materialService = {
  getAll: () => httpClient.get("/materials"),
  create: (materialData) => httpClient.post("/materials", materialData),
};
