import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Trae el perfil si ya hay cookie guardada
  const getProfile = async () => {
    try {
      const res = await axios.get("/profile"); // ya usa withCredentials
      setUsuario(res.data);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  // Nuevo método de login: hace POST, guarda usuario y devuelve datos
  const login = async ({ id_tecnico, password }) => {
    const res = await axios.post("/signin", { id_tecnico, password });
    setUsuario(res.data);      // <-- actualizo el estado de usuario
    return res.data;
  };

  // Cierra sesión
  const logout = async () => {
    await axios.post("/signout");
    setUsuario(null);
    navigate("/");
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
