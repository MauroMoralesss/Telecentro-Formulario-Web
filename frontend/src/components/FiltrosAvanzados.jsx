function FiltrosAvanzados({
    filtroOrden,
    setFiltroOrden,
    filtroCliente,
    setFiltroCliente,
    filtroFecha,
    setFiltroFecha,
    filtroTecnico,
    setFiltroTecnico,
  }) {
    return (
      <div className="card" style={{ marginBottom: 20 }}>
        <label>N° de orden:</label>
        <input
          type="text"
          value={filtroOrden}
          onChange={(e) => setFiltroOrden(e.target.value)}
          placeholder="Buscar por número de orden"
        />
  
        <label>N° de cliente:</label>
        <input
          type="text"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          placeholder="Buscar por cliente"
        />
  
        <label>Fecha (YYYY-MM-DD):</label>
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
  
        {/* Solo mostrar si se pasan las props del filtro técnico */}
        {filtroTecnico !== undefined && setFiltroTecnico && (
          <>
            <label>ID Técnico:</label>
            <input
              type="text"
              value={filtroTecnico}
              onChange={(e) => setFiltroTecnico(e.target.value)}
              placeholder="Buscar por técnico"
            />
          </>
        )}
      </div>
    );
  }
  
  export default FiltrosAvanzados;
  