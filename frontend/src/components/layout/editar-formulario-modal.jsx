import { useState, useEffect } from "react";
import axios from "../../api/axios";
import Select from "react-select";
import { IoClose } from "react-icons/io5";
import { LoadingSpinner } from '../LoadingSpinner';

function EditarFormularioModal({ onClose, formulario, onUpdate }) {
  const [tecnicos, setTecnicos] = useState([]);
  const [form, setForm] = useState({
    tecnico_id: "",
    nro_orden: "",
    nro_cliente: "",
    nombre: "",
    domicilio: "",
    telefono: "",
    servicios_instalar: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (formulario) {
      setForm({
        tecnico_id: formulario.tecnico_id,
        nro_orden: formulario.nro_orden,
        nro_cliente: formulario.nro_cliente,
        nombre: formulario.nombre,
        domicilio: formulario.domicilio,
        telefono: formulario.telefono,
        servicios_instalar: formulario.servicios_instalar || "",
      });
    }
  }, [formulario]);

  useEffect(() => {
    const cargarTecnicos = async () => {
      try {
        const res = await axios.get("/tecnicos", { withCredentials: true });
        setTecnicos(res.data.filter((t) => t.rol === "tecnico"));
      } catch (error) {
        console.error("Error al cargar técnicos:", error);
        setErrorMsg("Error al cargar la lista de técnicos");
      }
    };
    cargarTecnicos();
  }, []);

  const opciones = tecnicos.map((t) => ({
    value: t.id_tecnico,
    label: `${t.id_tecnico} - ${t.nombre}`,
  }));

  const validateForm = () => {
    const errors = {};
    
    if (!form.tecnico_id) {
      errors.tecnico_id = "El técnico es obligatorio";
    }
    if (!form.nro_orden) {
      errors.nro_orden = "El número de orden es obligatorio";
    }
    if (!form.nro_cliente) {
      errors.nro_cliente = "El número de cliente es obligatorio";
    }
    if (!form.nombre) {
      errors.nombre = "El nombre es obligatorio";
    }
    if (!form.domicilio) {
      errors.domicilio = "El domicilio es obligatorio";
    }
    if (!form.telefono) {
      errors.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{8,20}$/.test(form.telefono)) {
      errors.telefono = "El teléfono debe contener entre 8 y 20 dígitos";
    }
    if (!form.servicios_instalar) {
      errors.servicios_instalar = "Los servicios a instalar son obligatorios";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Auto-resize para textarea
    if (e.target.tagName.toLowerCase() === 'textarea') {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) {
      setErrorMsg("Por favor, complete todos los campos correctamente");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(
        `/formularios/${formulario.id_formulario}/campos-basicos`,
        form,
        { withCredentials: true }
      );
      
      // API call successful
      setSuccessMsg("Formulario actualizado correctamente");
      
      if (onUpdate) {
        try {
          onUpdate(response.data);
        } catch (updateError) {
          console.error("Error durante la ejecución de onUpdate:", updateError);
          // No se sobrescribe el mensaje de éxito de la API.
          // El error en onUpdate es secundario a la operación principal de guardado.
        }
      }

      setTimeout(() => {
        try {
          onClose();
        } catch (closeError) {
          console.error("Error durante la ejecución de onClose:", closeError);
        }
      }, 2000);

    } catch (apiError) { // Catching errors specifically from the axios.put call
      // API call failed
      setSuccessMsg(""); // Ensure success message is cleared if API call itself failed
      
      let mensaje = "Error del servidor";
      
      if (apiError.response?.data?.message) {
        mensaje = apiError.response.data.message;
      } else if (apiError.response?.status === 403) {
        mensaje = "No se puede editar el formulario en su estado actual";
      } else if (apiError.response?.status === 400) {
        mensaje = "Datos inválidos. Por favor, verifique la información";
      }
      
      setErrorMsg(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {isLoading && (
          <div className="modal-loading">
            <LoadingSpinner message="Guardando cambios..." size="small" />
          </div>
        )}
        <div className="modal-header">
          <h2>Editar Formulario</h2>
          <button onClick={onClose} className="close-button">
            <IoClose />
          </button>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="select-container">
            <label>Técnico:</label>
            <Select
              options={opciones}
              value={opciones.find(opt => opt.value === form.tecnico_id)}
              onChange={(opcion) => {
                setForm(prev => ({ ...prev, tecnico_id: opcion.value }));
                if (formErrors.tecnico_id) {
                  setFormErrors(prev => ({ ...prev, tecnico_id: "" }));
                }
              }}
              placeholder="Seleccionar técnico..."
              isSearchable
              styles={{ menu: (base) => ({ ...base, zIndex: 999 }) }}
              className={formErrors.tecnico_id ? "input-error" : ""}
            />
            {formErrors.tecnico_id && (
              <span className="error-message">{formErrors.tecnico_id}</span>
            )}
          </div>

          <div className="input-group">
            <label>Nro Orden:</label>
            <input 
              name="nro_orden" 
              value={form.nro_orden}
              onChange={handleChange} 
              required 
              className={formErrors.nro_orden ? "input-error" : ""}
            />
            {formErrors.nro_orden && (
              <span className="error-message">{formErrors.nro_orden}</span>
            )}
          </div>

          <div className="input-group">
            <label>Nro Cliente:</label>
            <input 
              name="nro_cliente" 
              value={form.nro_cliente}
              onChange={handleChange} 
              required 
              className={formErrors.nro_cliente ? "input-error" : ""}
            />
            {formErrors.nro_cliente && (
              <span className="error-message">{formErrors.nro_cliente}</span>
            )}
          </div>

          <div className="input-group">
            <label>Nombre:</label>
            <input 
              name="nombre" 
              value={form.nombre}
              onChange={handleChange} 
              required 
              className={formErrors.nombre ? "input-error" : ""}
            />
            {formErrors.nombre && (
              <span className="error-message">{formErrors.nombre}</span>
            )}
          </div>

          <div className="input-group">
            <label>Domicilio:</label>
            <input 
              name="domicilio" 
              value={form.domicilio}
              onChange={handleChange} 
              required 
              className={formErrors.domicilio ? "input-error" : ""}
            />
            {formErrors.domicilio && (
              <span className="error-message">{formErrors.domicilio}</span>
            )}
          </div>

          <div className="input-group">
            <label>Teléfono:</label>
            <input
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              required
              pattern="[0-9]{8,20}"
              title="Solo números entre 8 y 20 dígitos"
              className={formErrors.telefono ? "input-error" : ""}
            />
            {formErrors.telefono && (
              <span className="error-message">{formErrors.telefono}</span>
            )}
          </div>

          <div className="textarea-container">
            <label>Servicios a Instalar:</label>
            <textarea
              name="servicios_instalar"
              value={form.servicios_instalar}
              onChange={handleChange}
              placeholder="Ej: ABONO TELEFONIA 75388999 (COMUN SITIO WEB)"
              rows={1}
              className={formErrors.servicios_instalar ? "input-error" : ""}
            />
            {formErrors.servicios_instalar && (
              <span className="error-message">{formErrors.servicios_instalar}</span>
            )}
          </div>

          <div className="modal-actions">
            {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
            {successMsg && <div className="alert-success">✅ {successMsg}</div>}
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                'Guardar cambios'
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarFormularioModal; 