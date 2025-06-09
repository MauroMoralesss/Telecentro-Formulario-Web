// /src/pages/SeleccionarContratista.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function SeleccionarContratista() {
  const [contratistas, setContratistas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/contratistas/activos");
        setContratistas(res.data);
        setError(null);
      } catch (err) {
        setError("Error al cargar las empresas. Por favor, intenta nuevamente.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  if (isLoading) {
    return (
      <div className="selector-contratista">
        <LoadingSpinner message="Cargando empresas..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="selector-contratista">
        <div className="error-container">
          <h2>¡Ups! Algo salió mal</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="selector-contratista">
      <button 
        className="back-button"
        onClick={() => navigate('/')}
      >
        <FiArrowLeft />
        Volver al inicio
      </button>

      <div className="selector-header">
        <h1>Bienvenido</h1>
        <p>Seleccioná tu empresa para continuar</p>
      </div>
      
      <div className="contratistas-grid">
        {contratistas.map((c) => (
          <div
            key={c.slug}
            className="contratista-card"
            style={{ 
              borderColor: c.colores_tema?.primary,
              '--primary-color': c.colores_tema?.primary || '#007bff'
            }}
          >
            <div className="card-content">
              <div className="logo-container">
                <img 
                  src={c.logo_url && c.logo_url.trim() !== "" ? c.logo_url : "/user-svgrepo-com.svg"}
                  alt={c.nombre} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/user-svgrepo-com.svg';
                  }}
                />
              </div>
              <h3>{c.nombre}</h3>
              <button 
                onClick={() => navigate(`/${c.slug}/login`)}
                className="ingresar-btn"
              >
                Ingresar
                <FiArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
