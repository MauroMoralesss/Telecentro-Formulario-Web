// /src/pages/SeleccionarContratista.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import axios from "../api/axios";

export default function SeleccionarContratista() {
  const [contratistaNombre, setContratistaNombre] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  const validarNombre = (nombre) => {
    // Solo permite letras, números y guiones
    const regex = /^[a-zA-Z0-9-]+$/;
    return regex.test(nombre);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsValidating(true);

    // Validar que no esté vacío
    if (!contratistaNombre.trim()) {
      setError("Por favor, ingresá el nombre de la contratista.");
      setIsValidating(false);
      return;
    }

    // Validar caracteres
    if (!validarNombre(contratistaNombre.trim())) {
      setError("El nombre ingresado contiene caracteres inválidos.");
      setIsValidating(false);
      return;
    }

    try {
      // Crear slug y validar si existe
      const slug = contratistaNombre.trim().toLowerCase();
      
      const response = await axios.get(`/contratistas/validar/${slug}`);
      
      if (response.data.existe) {
        // Si existe, redirigir
        navigate(`/${slug}/login`);
      } else {
        setError("Contratista no encontrada. Verificá el nombre e intentá nuevamente.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Contratista no encontrada. Verificá el nombre e intentá nuevamente.");
      } else if (err.response?.status === 400) {
        setError("Esta contratista está inactiva. Contactá al administrador.");
      } else {
        setError("Error al validar la contratista. Intentá nuevamente.");
      }
      console.error("Error validando contratista:", err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    let valor = e.target.value;
    
    // Reemplazar espacios internos por guiones
    valor = valor.replace(/\s+/g, '-');
    
    setContratistaNombre(valor);
    
    // Limpiar error si el usuario está escribiendo
    if (error) {
      setError("");
    }
  };

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
        <h1>Magoo Solutions</h1>
        <p>Ingresá el nombre de tu empresa para continuar</p>
      </div>
      
      <form onSubmit={handleSubmit} className="contratista-form">
        <div className="input-group">
          <label htmlFor="contratista-nombre">Nombre de la empresa</label>
          <input
            id="contratista-nombre"
            type="text"
            value={contratistaNombre}
            onChange={handleInputChange}
            placeholder="Ej: Empresa-ABC"
            className={error ? "form-error" : ""}
            disabled={isValidating}
          />
          {error && <div className="form-error-message">{error}</div>}
        </div>
        
        <button 
          type="submit" 
          className="ingresar-btn"
          disabled={isValidating}
        >
          {isValidating ? "Validando..." : "Ingresar"}
          {!isValidating && <FiArrowRight />}
        </button>
      </form>

      <div className="autorizado-text">
        <p>Solo personal autorizado</p>
      </div>
    </div>
  );
}
