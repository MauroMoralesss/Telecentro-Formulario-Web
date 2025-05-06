import { useState, useEffect, useRef } from "react";
import Quagga from "quagga";

export default function DispositivoScanner({ dispositivos, setDispositivos }) {
  const [tipo, setTipo] = useState("MODEM");
  const [mac, setMac] = useState("");
  const [escaneando, setEscaneando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const macInputRef = useRef(null);
  const scannerRef = useRef(null);

  // Inicializar Quagga cuando escaneando es true
  useEffect(() => {
    if (!escaneando) return;

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          constraints: { facingMode: "environment" },
          target: scannerRef.current,
        },
        decoder: { readers: ["code_128_reader", "ean_reader"] },
      },
      (err) => {
        if (err) {
          console.error("Error al iniciar Quagga:", err);
          setErrorMsg("No se pudo acceder a la cámara");
          setEscaneando(false);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((result) => {
      const nueva = result.codeResult.code;
      if (nueva) {
        setMac(nueva.toUpperCase());
        Quagga.stop();
        setEscaneando(false);
      }
    });

    return () => {
      Quagga.stop();
    };
  }, [escaneando]);

  const handleAgregar = () => {
    const nuevaMac = mac.trim().toUpperCase();
    if (!nuevaMac) {
      setErrorMsg("La MAC no puede estar vacía");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }
    if (dispositivos.some((d) => d.mac === nuevaMac)) {
      setErrorMsg("Esa MAC ya está en la lista");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    setDispositivos((prev) => [...prev, { tipo, mac: nuevaMac }]);
    setMac("");
    setSuccessMsg("Dispositivo agregado correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    macInputRef.current?.focus();
  };

  const handleEliminar = (index) => {
    setDispositivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLimpiar = () => {
    if (window.confirm("¿Limpiar toda la lista de dispositivos agregados?")) {
      setDispositivos([]);
      setSuccessMsg("Lista limpiada");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 600,
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ color: "#333",fontSize: "18px", fontWeight: "700" }}> 📦 Inventarios </h3>

      {/* Mensajes de error y éxito */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            marginBottom: 10,
            padding: "8px 12px",
            backgroundColor: "#fdecea",
            color: "#c62828",
            borderRadius: 4,
            border: "1px solid #f5c6cb",
          }}
        >
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div
          role="status"
          style={{
            marginBottom: 10,
            padding: "8px 12px",
            backgroundColor: "#e6f4ea",
            color: "#2e7d32",
            borderRadius: 4,
            border: "1px solid #c3e6cb",
          }}
        >
          {successMsg}
        </div>
      )}

      <label htmlFor="tipo">Tipo de dispositivo:</label>
      <select
        id="tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      >
        <option value="MODEM">MODEM</option>
        <option value="DECO">DECO</option>
      </select>

      <label htmlFor="mac">MAC:</label>
      <input
        id="mac"
        ref={macInputRef}
        type="text"
        value={mac}
        onChange={(e) => setMac(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
        placeholder="Ej: 00:1A:2B:3C:4D:5E"
        style={{
          width: "100%",
          marginBottom: 10,
          padding: 8,
          border: errorMsg ? "1px solid #c62828" : "1px solid #ccc",
          borderRadius: 4,
        }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          className="btn-scan"
          type="button"
          onClick={() => setEscaneando(true)}
          disabled={escaneando}
          style={{
            flex: 1,
            padding: "10px 0",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: escaneando ? "not-allowed" : "pointer",
            transition: "filter 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(0.9)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          aria-label="Iniciar escáner"
        >
          📷 Escanear
        </button>
        <button
          className="btn-add"
          type="button"
          onClick={handleAgregar}
          style={{
            flex: 1,
            padding: "10px 0",
            backgroundColor: "#008080       ",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            transition: "filter 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(0.9)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          aria-label="Agregar dispositivo"
        >
          ➕ Agregar
        </button>
      </div>

      {escaneando && (
        <div
          id="scanner"
          ref={scannerRef}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "9/16", // <— mantiene 16:9
            marginBottom: 20,
            border: "1px solid #ccc",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "100%",
              height: 4,
              backgroundColor: "red",
              transform: "translateY(-2px)",
            }}
          />
        </div>
      )}

      {dispositivos.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>📦 Dispositivos agregados:</h3>
            <button
              onClick={handleLimpiar}
              style={{
                background: "#f57c00",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: 4,
                cursor: "pointer",
                transition: "filter 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(0.9)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
              aria-label="Limpiar lista de dispositivos"
            >
              🧹 Limpiar todo
            </button>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#eeeeee" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>Tipo</th>
                  <th style={{ textAlign: "left", padding: 8 }}>MAC</th>
                  <th style={{ width: 80, padding: 8 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 8 }}>{d.tipo}</td>
                    <td style={{ padding: 8 }}>{d.mac}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>
                      <button
                        onClick={() => handleEliminar(i)}
                        style={{
                          background: "#c62828",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          transition: "filter 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.filter = "brightness(0.9)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.filter = "brightness(1)")
                        }
                        aria-label="Eliminar dispositivo"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
