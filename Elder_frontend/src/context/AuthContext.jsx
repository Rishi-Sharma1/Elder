import { createContext, useEffect, useState } from "react";
import api from "../api";
import { getToken, setToken, removeToken } from "../utils/storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await api.get("/auth/me");
      if (res.data) {
        setUser(res.data);
      } else {
        await removeToken();
        setUser(null);
      }
    } catch (err) {
      console.log("AUTH ERROR:", err.response?.status === 404 ? "User missing from DB" : err.message);
      await removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data?.token) {
      await setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || "Login failed");
  };

  const register = async ({ name, email, password, role }) => {
    const res = await api.post("/auth/register", { name, email, password, role });
    if (res.data?.token) {
      await setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || "Registration failed");
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}
