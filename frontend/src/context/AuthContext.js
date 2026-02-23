"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // hydrate from localStorage
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);

          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            console.warn("Token expired");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          } else {
            // Token is valid, restore user
            const userStr = localStorage.getItem("user");
            const userData = userStr ? JSON.parse(userStr) : decoded;
            setUser(userData);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error("Error restoring auth state:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, user: userData } = res.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(userData);

        // Redirect based on role
        switch (userData.role) {
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
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
