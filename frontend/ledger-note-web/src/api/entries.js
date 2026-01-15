import { api } from "./client";

export async function listEntries({ limit = 50, offset = 0 } = {}) {
  const res = await api.get("/api/v1/journal_entry/", { params: { limit, offset } });
  return res.data; // 返回数组
}

export async function createEntry(payload) {
  const res = await api.post("/api/v1/journal_entry/", payload);
  return res.data;
}
