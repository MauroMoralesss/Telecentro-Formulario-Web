# 🛠️ Telecentro Formulario Web

Sistema de gestión de formularios técnicos para Telecentro, diseñado para mejorar la trazabilidad, control y validación de tareas realizadas en campo.

## 🚀 Tecnologías utilizadas

- **Frontend:** React + Vite + Context API
- **Backend:** Node.js + Express + PostgreSQL
- **ORM:** pg (consulta SQL directa)
- **Autenticación:** JWT (Json Web Tokens)
- **Almacenamiento de archivos:** Cloudinary
- **Deploy:** Railway

---

## 👥 Roles y funcionalidades

### 👨‍🔧 Técnico
- Iniciar sesión con ID técnico y contraseña.
- Ver formularios asignados.
- Completar formularios con:
  - Motivo de cierre
  - Checklist
  - Observaciones
  - Video o imagen como archivo adjunto
- Reenviar formularios rechazados por el administrador.

### 👨‍💼 Administrador
- Crear técnicos (con ID manual).
- Activar/desactivar técnicos.
- Crear formularios asignando técnico, cliente y orden.
- Ver formularios en estado “En revisión”.
- Aprobar o rechazar formularios.
- Ver historial y versiones.
- Ver archivos adjuntos.
- Filtros avanzados por estado, fecha, técnico, cliente, etc.

---

## 📦 Instalación local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Producción (opcional)
```bash
cd frontend
npm run build
npm run preview
```

---

## 🗃️ Variables de entorno

### Backend
```
PORT=3000
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=root
PG_DATABASE=formv1
ORIGIN=http://localhost:5173
JWT_SECRET=claveultrasecreta
CLOUDINARY_NAME=...
CLOUDINARY_KEY=...
CLOUDINARY_SECRET=...
```

---

## 📁 Estructura principal

```
├── backend
│   ├── controllers
│   ├── middlewares
│   ├── routes
│   ├── models
│   └── config.js
├── frontend
│   ├── components
│   ├── context
│   ├── pages
│   ├── styles
│   └── App.jsx
```

---

## ✅ Estado actual

- [x] Login técnico y administrador
- [x] Gestión de técnicos y formularios
- [x] Carga de archivos (video/imágenes)
- [x] Flujo de revisión y corrección
- [x] Filtros avanzados y paginación
- [x] Responsive y uso en móvil

---

## 📌 Notas

- Los técnicos pueden subir archivos usando la cámara del móvil (por ejemplo: `<input type="file" accept="video/*" capture />`).
- En Railway, asegurarse de setear correctamente las variables de entorno.

---

## 🧠 Autor

Desarrollado por Morales Mauro.