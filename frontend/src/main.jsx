import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
/* import AdminDashboard from "./pages/AdminDashboard.jsx";
 */import Dashboard from "./pages/Dashboard.jsx";
import FormularioDetalle from "./pages/FormularioDetalle";
import CrearFormulario from "./pages/CrearFormulario";
import TecnicoPerfil from "./pages/TecnicoPerfil";
import TecnicosAdmin from "./pages/TecnicosAdmin";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* pública */}
          <Route path="/" element={<Login />} />
          {/* todas estas rutas quedan “dentro” de ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/formulario/:id" element={<FormularioDetalle />} />
            <Route path="/crear-formulario" element={<CrearFormulario />} />
            <Route path="/tecnico/:id" element={<TecnicoPerfil />} />
            <Route path="/tecnicos" element={<TecnicosAdmin />} />
            {/* dashboard de admin también protegido */}
{/*             <Route path="/admin/dashboard" element={<AdminDashboard />} />
 */}          </Route>
          {/* cualquiera que no matchee va al login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
