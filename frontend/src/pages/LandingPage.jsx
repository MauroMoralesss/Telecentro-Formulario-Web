import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaMobile,
  FaChartLine,
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaPlay,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "../styles/landing.css";

// Hook personalizado para animaciones de scroll
const useScrollAnimation = () => {
  const [animatedElements, setAnimatedElements] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            setAnimatedElements((prev) => new Set([...prev, entry.target]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const LandingPage = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);

  useScrollAnimation();

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqData = [
    {
      question: "¿Cómo accedo a la plataforma?",
      answer:
        "Puedes acceder a Magoo Solutions desde cualquier navegador web. Solo necesitas tus credenciales de acceso proporcionadas por tu empresa.",
    },
    {
      question: "¿La app funciona en cualquier dispositivo?",
      answer:
        "Sí, Magoo Solutions es completamente responsive y funciona en smartphones, tablets, laptops y computadoras de escritorio, tanto en iOS como Android.",
    },
    {
      question: "¿Qué tipo de archivos puedo adjuntar?",
      answer:
        "Puedes adjuntar cualquier tipo de video. Todos los archivos se almacenan de forma segura en la nube.",
    },
    {
      question: "¿Cómo es el proceso de alta para una empresa/contratista?",
      answer:
        "El proceso es simple: contacta con nuestro equipo comercial, definimos tus necesidades, configuramos tu cuenta y capacitamos a tu equipo de trabajo.",
    },
  ];

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="header-landing">
        <nav className="nav">
          <div className="nav-brand">
            <svg
              className="logo-svg"
              width="40"
              height="40"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                transform="translate(0,1024) scale(0.1,-0.1)"
                fill="currentColor"
              >
                <path d="M4283 7566 c-60 -19 -106 -50 -155 -105 -117 -131 -283 -536 -373 -911 -20 -85 -40 -161 -44 -169 -4 -9 -60 -25 -147 -43 -223 -45 -538 -144 -661 -206 -52 -27 -83 -66 -83 -104 0 -63 138 -161 345 -245 302 -123 829 -215 1462 -254 221 -13 894 -7 1098 11 497 43 837 104 1140 205 206 69 345 156 360 225 26 117 -196 214 -759 333 l-109 23 -24 90 c-132 499 -201 715 -265 834 -116 218 -225 290 -442 290 -85 0 -124 -6 -241 -37 -131 -34 -150 -37 -290 -37 -158 -1 -179 3 -550 88 -121 28 -198 32 -262 12z m-267 -1096 c220 -61 576 -128 789 -150 184 -18 211 -20 475 -35 320 -19 513 -19 754 0 105 8 191 13 192 12 1 -1 9 -55 17 -121 l14 -119 -44 -19 c-172 -76 -589 -122 -1113 -122 -479 0 -786 39 -1152 145 l-107 31 6 32 c3 17 21 105 39 194 19 90 34 166 34 168 0 8 26 4 96 -16z" />
                <path d="M1585 5500 c-4 -6 -29 -201 -56 -433 -27 -232 -58 -501 -69 -597 -55 -473 -70 -613 -64 -621 7 -12 314 -12 333 0 11 7 27 138 67 533 29 287 53 534 54 547 0 51 -7 67 260 -579 67 -162 127 -301 132 -307 7 -9 45 -13 124 -13 107 0 114 1 128 23 11 16 297 680 378 877 6 14 12 21 14 15 2 -5 24 -246 49 -535 25 -289 50 -535 55 -548 10 -22 11 -22 177 -20 l168 3 2 50 c2 28 -37 401 -85 830 l-88 780 -174 -3 c-96 -1 -179 -7 -184 -12 -5 -5 -105 -233 -222 -507 l-213 -498 -14 35 c-8 19 -101 244 -207 500 -105 256 -195 468 -198 471 -4 4 -86 10 -183 14 -130 5 -179 4 -184 -5z" />
                <path d="M6923 5190 c-184 -20 -353 -117 -458 -265 -97 -136 -130 -260 -122 -459 6 -140 21 -207 71 -307 116 -231 357 -371 611 -355 194 12 342 73 447 185 75 79 117 155 154 276 24 80 27 107 28 240 1 170 -12 232 -71 350 -48 96 -97 159 -168 212 -131 100 -303 143 -492 123z m227 -322 c239 -110 297 -491 105 -683 -54 -54 -107 -82 -178 -93 -185 -29 -353 80 -417 269 -31 90 -25 227 14 313 49 109 122 177 229 212 65 21 181 13 247 -18z" />
                <path d="M7032 4629 c-68 -20 -132 -111 -132 -189 0 -75 54 -160 117 -186 42 -18 125 -18 166 0 39 17 82 61 97 101 17 44 14 139 -6 180 -40 84 -140 123 -242 94z" />
                <path d="M3968 5179 c-122 -18 -311 -82 -338 -114 -18 -21 79 -288 100 -279 142 63 197 77 311 82 177 7 260 -24 300 -112 19 -41 26 -136 11 -136 -5 0 -53 7 -108 15 -192 29 -329 13 -469 -55 -113 -55 -176 -114 -222 -208 -36 -73 -38 -80 -37 -171 1 -127 26 -195 100 -269 96 -95 231 -140 388 -128 128 11 257 66 325 140 14 14 28 26 32 26 5 0 9 -28 11 -62 l3 -63 169 -3 c93 -1 173 1 176 5 4 5 4 224 0 488 -6 451 -8 484 -28 544 -43 132 -130 218 -268 266 -117 41 -312 55 -456 34z m335 -775 l67 -6 0 -52 c0 -109 -39 -171 -142 -226 -53 -29 -76 -35 -145 -38 -70 -4 -88 -1 -128 18 -60 29 -95 80 -95 140 0 64 29 106 94 136 90 41 155 46 349 28z" />
                <path d="M5360 5174 c-300 -64 -487 -354 -467 -722 13 -247 123 -435 316 -536 98 -51 184 -69 306 -63 124 6 185 27 283 102 l72 55 0 -72 c0 -89 -13 -140 -51 -194 -61 -88 -176 -134 -339 -134 -137 0 -270 40 -358 106 -18 14 -35 24 -38 22 -2 -2 -31 -62 -65 -133 -44 -94 -59 -134 -52 -145 17 -27 173 -98 267 -121 132 -33 383 -33 505 -1 208 55 350 163 427 327 70 147 68 122 72 832 l3 642 -23 6 c-13 3 -88 4 -168 3 l-145 -3 -3 -63 -3 -63 -47 42 c-125 110 -310 153 -492 113z m302 -294 c57 -16 130 -70 166 -124 79 -118 95 -301 37 -419 -34 -68 -107 -140 -172 -169 -66 -29 -191 -29 -258 1 -165 72 -244 294 -178 496 36 112 116 191 218 216 45 11 145 10 187 -1z" />
                <path d="M8225 5164 c-316 -70 -502 -350 -482 -727 16 -303 154 -520 380 -596 96 -33 234 -46 333 -32 347 49 557 291 581 671 20 322 -172 596 -472 676 -88 23 -255 27 -340 8z m270 -298 c192 -88 280 -331 201 -555 -50 -139 -189 -231 -351 -231 -201 0 -327 131 -342 355 -12 179 58 344 177 418 85 53 216 58 315 13z" />
                <path d="M8206 4626 c-49 -19 -102 -70 -117 -114 -6 -19 -9 -62 -7 -97 3 -50 10 -70 32 -100 76 -99 237 -98 312 1 25 32 29 48 32 113 3 70 1 80 -26 122 -47 73 -143 105 -226 75z" />
              </g>
            </svg>
            <span className="brand-text">Magoo Solutions</span>
          </div>
          <div
            className={`nav-links ${mobileMenuOpen ? "nav-links-open" : ""}`}
          >
            <a href="#caracteristicas">Características</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#faq">FAQ</a>
            <a href="#demo">Demo</a>
            <Link to="/contratistas" className="btn-primary">
              Iniciar Sesión
            </Link>
          </div>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="hero-content">
          <div className="hero-text animate-on-scroll">
            <h1>Digitaliza y Optimiza la Gestión de Informes Técnicos</h1>
            <p>
              Magoo Solutions transforma la manera en que gestionas informes
              técnicos, videos y seguimiento de instalaciones. Accede desde
              cualquier dispositivo y mejora la eficiencia de tu equipo.
            </p>

            <div className="hero-stats animate-on-scroll">
              {[
                { number: "2+", label: "Empresas Activas" },
                { number: "30+", label: "Técnicos Registrados" },
                { number: "10000+", label: "Informes Procesados" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="stat animate-counter"
                  style={{ animationDelay: `${0.5 + index * 0.2}s` }}
                >
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-cta">
              <Link to="/contratistas" className="btn-primary btn-large">
                Comenzar Ahora
              </Link>
              <button className="btn-secondary btn-large">
                Ver Demo: Próximamente...
              </button>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-mockup">
              <div className="hero-logo-container">
                <svg
                  className="hero-logo-svg"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    transform="translate(0,1024) scale(0.1,-0.1)"
                    fill="currentColor"
                  >
                    {/* Sombrero animado - primer path */}
                    <path
                      className="logo-hat-animated"
                      d="M4283 7566 c-60 -19 -106 -50 -155 -105 -117 -131 -283 -536 -373 -911 -20 -85 -40 -161 -44 -169 -4 -9 -60 -25 -147 -43 -223 -45 -538 -144 -661 -206 -52 -27 -83 -66 -83 -104 0 -63 138 -161 345 -245 302 -123 829 -215 1462 -254 221 -13 894 -7 1098 11 497 43 837 104 1140 205 206 69 345 156 360 225 26 117 -196 214 -759 333 l-109 23 -24 90 c-132 499 -201 715 -265 834 -116 218 -225 290 -442 290 -85 0 -124 -6 -241 -37 -131 -34 -150 -37 -290 -37 -158 -1 -179 3 -550 88 -121 28 -198 32 -262 12z m-267 -1096 c220 -61 576 -128 789 -150 184 -18 211 -20 475 -35 320 -19 513 -19 754 0 105 8 191 13 192 12 1 -1 9 -55 17 -121 l14 -119 -44 -19 c-172 -76 -589 -122 -1113 -122 -479 0 -786 39 -1152 145 l-107 31 6 32 c3 17 21 105 39 194 19 90 34 166 34 168 0 8 26 4 96 -16z"
                    />

                    {/* Resto del logo estático */}
                    <g className="logo-static">
                      <path d="M1585 5500 c-4 -6 -29 -201 -56 -433 -27 -232 -58 -501 -69 -597 -55 -473 -70 -613 -64 -621 7 -12 314 -12 333 0 11 7 27 138 67 533 29 287 53 534 54 547 0 51 -7 67 260 -579 67 -162 127 -301 132 -307 7 -9 45 -13 124 -13 107 0 114 1 128 23 11 16 297 680 378 877 6 14 12 21 14 15 2 -5 24 -246 49 -535 25 -289 50 -535 55 -548 10 -22 11 -22 177 -20 l168 3 2 50 c2 28 -37 401 -85 830 l-88 780 -174 -3 c-96 -1 -179 -7 -184 -12 -5 -5 -105 -233 -222 -507 l-213 -498 -14 35 c-8 19 -101 244 -207 500 -105 256 -195 468 -198 471 -4 4 -86 10 -183 14 -130 5 -179 4 -184 -5z" />
                      <path d="M6923 5190 c-184 -20 -353 -117 -458 -265 -97 -136 -130 -260 -122 -459 6 -140 21 -207 71 -307 116 -231 357 -371 611 -355 194 12 342 73 447 185 75 79 117 155 154 276 24 80 27 107 28 240 1 170 -12 232 -71 350 -48 96 -97 159 -168 212 -131 100 -303 143 -492 123z m227 -322 c239 -110 297 -491 105 -683 -54 -54 -107 -82 -178 -93 -185 -29 -353 80 -417 269 -31 90 -25 227 14 313 49 109 122 177 229 212 65 21 181 13 247 -18z" />
                      <path d="M7032 4629 c-68 -20 -132 -111 -132 -189 0 -75 54 -160 117 -186 42 -18 125 -18 166 0 39 17 82 61 97 101 17 44 14 139 -6 180 -40 84 -140 123 -242 94z" />
                      <path d="M3968 5179 c-122 -18 -311 -82 -338 -114 -18 -21 79 -288 100 -279 142 63 197 77 311 82 177 7 260 -24 300 -112 19 -41 26 -136 11 -136 -5 0 -53 7 -108 15 -192 29 -329 13 -469 -55 -113 -55 -176 -114 -222 -208 -36 -73 -38 -80 -37 -171 1 -127 26 -195 100 -269 96 -95 231 -140 388 -128 128 11 257 66 325 140 14 14 28 26 32 26 5 0 9 -28 11 -62 l3 -63 169 -3 c93 -1 173 1 176 5 4 5 4 224 0 488 -6 451 -8 484 -28 544 -43 132 -130 218 -268 266 -117 41 -312 55 -456 34z m335 -775 l67 -6 0 -52 c0 -109 -39 -171 -142 -226 -53 -29 -76 -35 -145 -38 -70 -4 -88 -1 -128 18 -60 29 -95 80 -95 140 0 64 29 106 94 136 90 41 155 46 349 28z" />
                      <path d="M5360 5174 c-300 -64 -487 -354 -467 -722 13 -247 123 -435 316 -536 98 -51 184 -69 306 -63 124 6 185 27 283 102 l72 55 0 -72 c0 -89 -13 -140 -51 -194 -61 -88 -176 -134 -339 -134 -137 0 -270 40 -358 106 -18 14 -35 24 -38 22 -2 -2 -31 -62 -65 -133 -44 -94 -59 -134 -52 -145 17 -27 173 -98 267 -121 132 -33 383 -33 505 -1 208 55 350 163 427 327 70 147 68 122 72 832 l3 642 -23 6 c-13 3 -88 4 -168 3 l-145 -3 -3 -63 -3 -63 -47 42 c-125 110 -310 153 -492 113z m302 -294 c57 -16 130 -70 166 -124 79 -118 95 -301 37 -419 -34 -68 -107 -140 -172 -169 -66 -29 -191 -29 -258 1 -165 72 -244 294 -178 496 36 112 116 191 218 216 45 11 145 10 187 -1z" />
                      <path d="M8225 5164 c-316 -70 -502 -350 -482 -727 16 -303 154 -520 380 -596 96 -33 234 -46 333 -32 347 49 557 291 581 671 20 322 -172 596 -472 676 -88 23 -255 27 -340 8z m270 -298 c192 -88 280 -331 201 -555 -50 -139 -189 -231 -351 -231 -201 0 -327 131 -342 355 -12 179 58 344 177 418 85 53 216 58 315 13z" />
                      <path d="M8206 4626 c-49 -19 -102 -70 -117 -114 -6 -19 -9 -62 -7 -97 3 -50 10 -70 32 -100 76 -99 237 -98 312 1 25 32 29 48 32 113 3 70 1 80 -26 122 -47 73 -143 105 -226 75z" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section id="caracteristicas" className="features animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <h2>Características Principales</h2>
            <p>Todo lo que necesitas para optimizar tu trabajo técnico</p>
          </div>

          <div className="features-grid">
            <div
              className="feature-card animate-on-scroll"
              style={{ animationDelay: `0s` }}
            >
              <div className="feature-icon">
                <FaFileAlt />
              </div>
              <h3>Informes Digitales</h3>
              <p>
                Elimina el papel y digitaliza todo el proceso. Crea informes
                profesionales con plantillas personalizables.
              </p>
            </div>

            <div
              className="feature-card animate-on-scroll"
              style={{ animationDelay: `0.1s` }}
            >
              <div className="feature-icon">
                <FaMobile />
              </div>
              <h3>Acceso Móvil</h3>
              <p>
                Trabaja desde cualquier dispositivo, en cualquier momento.
                Aplicación web con sincronización en tiempo real.
              </p>
            </div>

            <div
              className="feature-card animate-on-scroll"
              style={{ animationDelay: `0.2s` }}
            >
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Estadísticas en Tiempo Real</h3>
              <p>
                Monitorea el progreso y rendimiento de tu equipo con dashboards
                interactivos y reportes automáticos.
              </p>
            </div>

            <div
              className="feature-card animate-on-scroll"
              style={{ animationDelay: `0.30000000000000004s` }}
            >
              <div className="feature-icon">
                <FaCamera />
              </div>
              <h3>Registro Multimedia</h3>
              <p>
                Captura videos durante las instalaciones. Almacenamiento seguro
                en la nube con geolocalización automática.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="benefits animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <h2>¿Por qué elegir Magoo Solutions?</h2>
            <p>Beneficios comprobados que transformarán tu negocio</p>
          </div>

          <div className="benefits-grid">
            <div
              className="benefit-card animate-on-scroll"
              style={{ animationDelay: `0s` }}
            >
              <div className="benefit-icon">
                <FaCheckCircle />
              </div>
              <h3>Eficiencia Mejorada</h3>
              <p>
                Reduce el tiempo de procesamiento y elimina errores manuales con
                automatización inteligente.
              </p>
            </div>

            <div
              className="benefit-card animate-on-scroll"
              style={{ animationDelay: `0.15s` }}
            >
              <div className="benefit-icon">
                <FaClock />
              </div>
              <h3>Seguimiento en Tiempo Real</h3>
              <p>
                Mantén un registro detallado de todas las ordenes de trabajo con
                notificaciones automáticas y alertas personalizadas.
              </p>
            </div>

            <div
              className="benefit-card animate-on-scroll"
              style={{ animationDelay: `0.3s` }}
            >
              <div className="benefit-icon">
                <FaUsers />
              </div>
              <h3>Satisfacción del Cliente</h3>
              <p>
                Mejora la experiencia del cliente con un servicio más
                profesional, transparente y comunicación constante.
              </p>
            </div>
          </div>

          <div className="benefits-highlight">
            <div className="highlight-content">
              <h3>Soporte 24/7 y Satisfacción Garantizada</h3>
              <p>
                Nuestro equipo de expertos está disponible las 24 horas para
                ayudarte. Más del 95% de nuestros clientes recomiendan Magoo
                Solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <h2>Preguntas Frecuentes</h2>
            <p>Resolvemos las dudas más comunes de empresas y técnicos</p>
          </div>

          <div className="faq-container">
            {faqData.map((item, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{item.question}</span>
                  {activeAccordion === index ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </button>
                <div
                  className={`faq-answer ${
                    activeAccordion === index ? "faq-answer-open" : ""
                  }`}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="demo animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <h2>Ve Magoo Solutions en Acción</h2>
            <p>Descubre cómo nuestra plataforma puede transformar tu trabajo</p>
          </div>

          <div className="demo-content">
            <div className="demo-video">
              <div className="video-placeholder">
                <div className="video-overlay">
                  <FaPlay className="play-icon" />
                  <h3>Video Demo Próximamente</h3>
                  <p>
                    Estamos preparando un video completo que muestra todas las
                    funcionalidades de la plataforma
                  </p>
                </div>
                <img
                  src="https://res.cloudinary.com/dfe8vpoxs/image/upload/v1748550164/magoo.png?height=300&width=500"
                  alt="Preview del Dashboard"
                  className="demo-image"
                />
              </div>
            </div>

            <div className="demo-info">
              <h3>¿Quieres ver una demo personalizada?</h3>
              <p>
                Agenda una demostración gratuita con nuestro equipo y descubre
                cómo Magoo Solutions puede adaptarse a las necesidades
                específicas de tu empresa.
              </p>
              <button className="btn-primary">Solicitar Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Magoo Solutions</h3>
              <p>
                Digitalizamos y optimizamos la gestión de informes técnicos para
                empresas y técnicos profesionales.
              </p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <FaFacebook />
                </a>
                <a href="#" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href="#" aria-label="Instagram">
                  <FaInstagram />
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h3>Contacto</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <FaEnvelope />
                  <span>info@magoo.com</span>
                </div>
                <div className="contact-item">
                  <FaPhone />
                  <span>(+54) 11 3234-1273</span>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt />
                  <span>Buenos Aires, Argentina</span>
                </div>
              </div>
            </div>

            <div className="footer-section">
              <h3>Enlaces Útiles</h3>
              <ul className="footer-links">
                <li>
                  <a href="#caracteristicas">Características</a>
                </li>
                <li>
                  <a href="#beneficios">Beneficios</a>
                </li>
                <li>
                  <a href="#faq">Preguntas Frecuentes</a>
                </li>
                <li>
                  <a href="#demo">Demo</a>
                </li>
                <li>
                  <a href="#">Soporte Técnico</a>
                </li>
                <li>
                  <a href="#">Términos y Condiciones</a>
                </li>
              </ul>
            </div>
            {/* 
            <div className="footer-section">
              <h3>Para Empresas</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Iniciar Sesión</a>
                </li>
                <li>
                  <a href="#">Registro de Empresa</a>
                </li>
                <li>
                  <a href="#">Capacitación</a>
                </li>
                <li>
                  <a href="#">Centro de Ayuda</a>
                </li>
              </ul>
            </div> */}
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Magoo Solutions. Todos los derechos reservados.</p>
            {/* <div className="footer-bottom-links">
              <a href="#">Política de Privacidad</a>
              <a href="#">Términos de Servicio</a>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
