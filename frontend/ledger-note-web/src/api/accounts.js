import { api } from "./client";

export async function listAccounts({ limit = 50, offset = 0 } = {}) {
  const res = await api.get("/api/v1/accounts/", { params: { limit, offset } });
  return res.data; //return array
}

export async function createAccount(payload) {
  const res = await api.post("/api/v1/accounts/", payload);
  return res.data;
}

export async function updateAccount(id, payload) {
  const res = await api.patch(`/api/v1/accounts/${id}`, payload);
  return res.data;
}