import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FormularioDetalle from "./pages/FormularioDetalle";
import CrearFormulario from "./pages/CrearFormulario";
import TecnicoPerfil from "./pages/TecnicoPerfil";
import TecnicosAdmin from "./pages/TecnicosAdmin";

import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/formulario/:id" element={<FormularioDetalle />} />
          <Route path="/crear-formulario" element={<CrearFormulario />} />
          <Route path="/tecnico/:id" element={<TecnicoPerfil />} />
          <Route path="/tecnicos" element={<TecnicosAdmin />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
