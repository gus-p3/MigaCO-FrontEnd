/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../Api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get("/usuarios/perfil");
      
      const usuarioData = response.data;
      const userData = {
        _id: usuarioData._id,
        nombre: usuarioData.nombre,
        email: usuarioData.email,
        fecha_registro: usuarioData.fecha_registro,
        role: usuarioData.role || "user", // Agregar rol
        perfil: usuarioData.perfil || { direcciones: [], metodos_pago: [] }
      };
      
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error("Error loading user:", err);
      localStorage.removeItem("token");
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      
      const { token, usuario } = response.data;
      
      if (!token || !usuario) {
        throw new Error("Respuesta inválida del servidor");
      }
      
      const userData = {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        fecha_registro: usuario.fecha_registro,
        role: usuario.role || "user",
        perfil: usuario.perfil || { direcciones: [], metodos_pago: [] }
      };
      
      localStorage.setItem("token", token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setError(null);
      setLoading(false);
      
      return { success: true, user: userData };
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.response?.data?.message || "Error al iniciar sesión");
      setLoading(false);
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/registro", userData);
      
      const { token, usuario } = response.data;
      
      if (!token || !usuario) {
        throw new Error("Respuesta inválida del servidor");
      }
      
      const newUserData = {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        fecha_registro: usuario.fecha_registro,
        role: usuario.role || "user",
        perfil: usuario.perfil || { direcciones: [], metodos_pago: [] }
      };
      
      localStorage.setItem("token", token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(newUserData);
      setError(null);
      setLoading(false);
      
      return { success: true, user: newUserData };
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.response?.data?.message || "Error al registrar usuario");
      setLoading(false);
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  }, []);
  const loginWithToken = useCallback(async (token) => {
  localStorage.setItem("token", token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  await loadUser(); // ya tienes esta función, reutilízala
}, [loadUser]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
     loginWithToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
   
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
