import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";

// Context = “全局共享状态的容器”
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 初始 token 从 localStorage 里取（刷新页面不丢）
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // token 变化时：同步到 axios header + localStorage
  useEffect(() => {
    setAuthToken(token);
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

async function login(email, password) {
  // 后端要的是 form-urlencoded，不是 JSON
  const form = new URLSearchParams();
  form.append("grant_type", "password"); // Swagger 里 pattern: ^password$，加上最稳
  form.append("username", email);        // 你这里用 email 当 username
  form.append("password", password);

  const res = await api.post("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const t = res.data.access_token; // Swagger 明确就是 access_token
  setToken(t);
}

  function logout() {
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, me}}>
      {children}
    </AuthContext.Provider>
  );
}

async function me() {
  const res = await api.get("/auth/me");
  return res.data;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
