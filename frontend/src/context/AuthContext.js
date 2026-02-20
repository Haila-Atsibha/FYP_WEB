"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // hydrate from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setUser(JSON.parse(userStr));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(user);
        // redirect based on role
        switch (user.role) {
          case "customer":
            router.push("/customer");
            break;
          case "provider":
            router.push("/provider");
            break;
          case "admin":
            router.push("/admin");
            break;
          default:
            router.push("/");
        }
      }
    } catch (e) {
      throw e;
    }
  };

  const register = async (formData) => {
    try {
      // formData is expected to be FormData instance
      const res = await api.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
