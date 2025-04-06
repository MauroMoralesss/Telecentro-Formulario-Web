import { useState } from "react";
import axios from "../api/axios.js";

function Login() {
  const [id_tecnico, setIdTecnico] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/signin", { id_tecnico: parseInt(id_tecnico), password }, {
        withCredentials: true,
      });
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar sesión</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>ID Técnico</label>
            <input
              type="number"
              placeholder="Ingresa tu ID"
              value={id_tecnico}
              onChange={(e) => setIdTecnico(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
