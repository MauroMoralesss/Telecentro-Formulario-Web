import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate(); // ✅ correcto: dentro del componente

  const getProfile = async () => {
    try {
      const res = await axios.get("/profile", {
        withCredentials: true,
      });
      setUsuario(res.data);
    } catch (error) {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  const logout = async () => {
    await axios.post("/signout", {}, { withCredentials: true });
    setUsuario(null);
    navigate("/"); // ✅ redirige después de cerrar sesión
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => useContext(AuthContext);
