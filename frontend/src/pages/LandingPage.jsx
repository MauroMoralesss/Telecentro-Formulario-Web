import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

export const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="landing-logo">
            {/* <img 
              src="https://res.cloudinary.com/dfe8vpoxs/image/upload/v1748550164/magoo.png" 
              alt="Magoo Solutions Logo" 
              className="logo-image"
            /> */}
            <h1>Magoo Solutions</h1>
          </div>
          <div className="landing-nav-links">
            <Link to="/contratistas" className="landing-button">Iniciar Sesión</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Gestión de Informes Técnicos</h1>
          <p>Simplifica el proceso de instalación y mantenimiento con nuestra plataforma especializada</p>
          <Link to="/contratistas" className="cta-button">Comenzar Ahora</Link>
        </div>
        <div className="hero-image">
          <img 
            src="https://res.cloudinary.com/dfe8vpoxs/image/upload/v1748550164/magoo.png" 
            alt="Magoo Solutions" 
            className="hero-logo"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Características Principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Informes Digitales</h3>
            <p>Elimina el papel y digitaliza todo el proceso de instalación</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Acceso Móvil</h3>
            <p>Trabaja desde cualquier dispositivo, en cualquier momento</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Estadísticas en Tiempo Real</h3>
            <p>Monitorea el progreso y rendimiento de tu equipo</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3>Registro Multimedia</h3>
            <p>Captura fotos y videos durante las instalaciones</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>¿Por qué elegirnos?</h2>
        <div className="benefits-container">
          <div className="benefit-item">
            <h3>Eficiencia Mejorada</h3>
            <p>Reduce el tiempo de procesamiento y elimina errores manuales</p>
          </div>
          <div className="benefit-item">
            <h3>Seguimiento en Tiempo Real</h3>
            <p>Mantén un registro detallado de todas las instalaciones</p>
          </div>
          <div className="benefit-item">
            <h3>Satisfacción del Cliente</h3>
            <p>Mejora la experiencia del cliente con un servicio más profesional</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Magoo Solutions</h3>
            <p>Simplificando el trabajo técnico</p>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <p>Email: info@magoo.com</p>
            <p>Tel: (+54) 11 3234-1273</p>
          </div>
          <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <Link to="/login">Iniciar Sesión</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Magoo Solutions. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}; 
