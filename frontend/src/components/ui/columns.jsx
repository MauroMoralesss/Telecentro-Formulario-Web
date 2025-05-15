import React from "react";
import { FiEye, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Helper: formatea la fecha al estilo es-AR
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper: construye la clase CSS para el badge según el estado
function badgeClass(estado) {
  return (
    "badge-" +
    estado
      .toLowerCase()
      .replace(/á/g, "a")
      .replace(/í/g, "i")
      .replace(/é/g, "e")
      .replace(/\s+/g, "-")
  );
}

export const columns = [
  {
    accessorKey: "tecnico_nombre",
    header: "Técnico",
  },
  {
    accessorKey: "nro_orden",
    header: "N° Orden",
  },
  {
    accessorKey: "nombre",
    header: "N° Cliente",
    cell: ({ row }) => (
      <div>
        <div>{row.original.nro_cliente}</div>
        {/*         <div style={{ fontSize: "0.8em", color: "#666" }}>
        {row.original.nombre}   
        </div> */}
      </div>
    ),
  },
  {
    accessorKey: "domicilio",
    header: "Domicilio",
    cell: ({ row }) => (
      <div className="address-cell">{row.original.domicilio}</div>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <span className={badgeClass(row.original.estado)}>
        {row.original.estado}
      </span>
    ),
  },
  {
    accessorKey: "fecha_creacion",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.fecha_creacion),
  },
  {
    id: "acciones",
    header: "Acciones",
    // aquí ya podemos llamar useNavigate porque estamos dentro de un renderer de celda
    cell: ({ row }) => {
      const navigate = useNavigate();
      const id = row.original.id_formulario;
      return (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-center" }}>
          <button
            onClick={() => navigate(`/admin/formulario/${id}`)}
            className="btn-icon"
            title="Ver detalles"
          >
            <FiEye />
          </button>
{/*           <button className="btn-icon" title="Más...">
            <FiMoreVertical />
          </button> */}
        </div>
      );
    },
  },
];
