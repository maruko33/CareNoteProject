import { api } from "./client";

export async function getTrialBalance({ asOf = null } = {}) {
  const params = {};
  if (asOf) params.as_of = asOf; // ISO string
  const res = await api.get("/api/v1/reports/trial-balance", { params });
  return res.data; // { as_of, lines: [...] }
}
