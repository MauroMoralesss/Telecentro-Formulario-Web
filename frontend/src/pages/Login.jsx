import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios.js";       
import { useAuth } from "../context/AuthContext.jsx";
import { useFetch } from '../hooks/useFetch';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FiUser, FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

function Login() {
  const [id_tecnico, setIdTecnico] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contratista, setContratista] = useState(null);
  const [isLoadingContratista, setIsLoadingContratista] = useState(true);
  const navigate = useNavigate();
  const { slug } = useParams();
  const { login } = useAuth();   

  useEffect(() => {
    const cargarContratista = async () => {
      try {
        setIsLoadingContratista(true);
        const res = await axios.get(`/contratistas/${slug}`);
        setContratista(res.data);
      } catch (err) {
        console.error("Error al cargar información del contratista:", err);
      } finally {
        setIsLoadingContratista(false);
      }
    };

    if (slug) {
      cargarContratista();
    }
  }, [slug]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!slug) {
      setError("No se ha especificado el contratista");
      setIsLoading(false);
      return;
    }

    try {
      const usuario = await login({
        id_tecnico: parseInt(id_tecnico),
        password,
        slug_contratista: slug
      });

      if (usuario.rol === "admin") {
        navigate(`/${slug}/admin/dashboard`);
      } else {
        navigate(`/${slug}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingContratista) {
    return (
      <div className="login-container">
        <LoadingSpinner message="Cargando información..." size="large" />
      </div>
    );
  }

  return (
    <div 
      className="login-container"
      style={{
        '--primary-color': contratista?.colores_tema?.primary || '#007bff',
        '--secondary-color': contratista?.colores_tema?.secondary || '#6c757d',
        '--background-color': contratista?.colores_tema?.background || '#f4f4f4'
      }}
    >
      <button 
        className="back-button"
        onClick={() => navigate('/contratistas')}
      >
        <FiArrowLeft />
        Volver
      </button>

      <div className="login-box">
        <div className="login-header">
          {contratista?.logo_url && (
            <div className="logo-container">
              <img 
                src={contratista.logo_url && contratista.logo_url.trim() !== "" ? contratista.logo_url : "/user-svgrepo-com.svg"}
                alt={contratista.nombre} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/user-svgrepo-com.svg';
                }}
              />
            </div>
          )}
          <h1>{(contratista?.nombre || slug).replace(/-/g, ' ').toUpperCase()}</h1>
          <h2>¡Bienvenido a Magoo Solutions!</h2>
          <p className="welcome-message">
            Ingresa tus credenciales para continuar.
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-card-content">
          <div className="input-group">
            <label>
              <FiUser className="input-icon" />
              ID Técnico
            </label>
            <input
              type="number"
              placeholder="Ingresa tu número de identificación"
              value={id_tecnico}
              onChange={(e) => setIdTecnico(e.target.value)}
              required
              disabled={isLoading}
            />
            <small className="input-help">
              Ingresa el número de ID que te proporcionó tu empresa
            </small>
          </div>
          <div className="input-group">
            <label>
              <FiLock className="input-icon" />
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <small className="input-help">
              La contraseña que usas para acceder a tu cuenta
            </small>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (
              <LoadingSpinner message="Iniciando sesión..." size="small" />
            ) : (
              <>
                Ingresar
                <FiArrowRight className="button-icon" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Necesitas ayuda? Contacta a tu supervisor</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
