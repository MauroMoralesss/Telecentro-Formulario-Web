import React from "react";
import { Navigate } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/landing.css";
import "./styles/formulario-detalle.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRedirect from "./components/RoleRedirect.jsx";
import { Toaster } from "react-hot-toast";

import { LandingPage } from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminFormularioDetalle from "./pages/AdminFormularioDetalle.jsx";
import AdminTecnicos from "./pages/AdminTecnicos.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FormularioDetalle from "./pages/FormularioDetalle";
import CrearFormulario from "./pages/CrearFormulario";
import TecnicoPerfil from "./pages/TecnicoPerfil";
import TecnicosAdmin from "./pages/TecnicosAdmin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Landing page pública */}
          <Route path="/" element={<LandingPage />} />
          {/* Ruta de login */}
          <Route path="/login" element={<Login />} />
          {/* todas estas rutas quedan "dentro" de ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<RoleRedirect />} />  
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/formulario/:id" element={<FormularioDetalle />} />
            <Route path="/crear-formulario" element={<CrearFormulario />} />
            <Route path="/tecnico/:id" element={<TecnicoPerfil />} />
            <Route path="/tecnicos" element={<TecnicosAdmin />} />
            {/* dashboard de admin también protegido */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tecnicos" element={<AdminTecnicos />} />
            <Route path="/admin/formulario/:id" element={<AdminFormularioDetalle />} />
          </Route>
          {/* cualquiera que no matchee va a la landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
