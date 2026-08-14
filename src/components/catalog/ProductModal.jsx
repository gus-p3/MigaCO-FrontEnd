import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductModal.css";
import PersonalizarModal from "./PersonalizarModal";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import Resenas from "../reviews/Resenas";


export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  // Estado para controlar la imagen actual en el carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPersonalizar, setShowPersonalizar] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [feedbackAgregar, setFeedbackAgregar] = useState("");

  const { agregarItem } = useCarrito();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const esPersonalizable =
    product.personalizable?.permite_mensaje ||
    product.personalizable?.rellenos_disponibles?.length > 0 ||
    product.personalizable?.coberturas_disponibles?.length > 0;

  const imagenes = product.multimedia?.fotos_exterior || [
    "https://via.placeholder.com/400?text=Sin+imagen",
  ];

  // Función para ir a la imagen anterior
  const handlePrevImage = () => {
    setCurrentImageIndex(
      currentImageIndex === 0 ? imagenes.length - 1 : currentImageIndex - 1,
    );
  };

  // Función para ir a la imagen siguiente
  const handleNextImage = () => {
    setCurrentImageIndex(
      currentImageIndex === imagenes.length - 1 ? 0 : currentImageIndex + 1,
    );
  };

  // Función para ir a una imagen específica (por puntos)
  const handleGoToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const disponible =
    (product.stock?.sucursal_centro || 0) +
      (product.stock?.sucursal_norte || 0) >
    0;

  // Normalizar y asegurar valores numéricos entre 0 y 5
  const parseClamped = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return Math.min(5, Math.max(0, Math.floor(n)));
  };

  const dulzor = parseClamped(product.ficha_sensorial?.dulzor);
  const textura = parseClamped(product.ficha_sensorial?.textura);
  const intensidad = parseClamped(product.ficha_sensorial?.intensidad);

  // Debug temporal: revisar en consola del navegador (JSON para facilitar copia)
  try {
    console.log(
      "[ProductModal] ficha_sensorial:",
      JSON.stringify(product.ficha_sensorial),
      JSON.stringify({ dulzor, textura, intensidad }),
    );
  } catch (e) {
    console.log(
      "[ProductModal] ficha_sensorial (fallback):",
      product.ficha_sensorial,
      { dulzor, textura, intensidad },
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          <div className="modal-header">
            <div className="carousel-container">
              <img
                src={imagenes[currentImageIndex]}
                alt={`${product.nombre} - imagen ${currentImageIndex + 1}`}
                className="modal-image"
              />

              {/* Botones de navegación */}
              {imagenes.length > 1 && (
                <>
                  <button
                    className="carousel-btn carousel-prev"
                    onClick={handlePrevImage}
                  >
                    ‹
                  </button>
                  <button
                    className="carousel-btn carousel-next"
                    onClick={handleNextImage}
                  >
                    ›
                  </button>

                  {/* Puntos indicadores */}
                  <div className="carousel-dots">
                    {imagenes.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${index === currentImageIndex ? "active" : ""}`}
                        onClick={() => handleGoToImage(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-info">
              <h2>{product.nombre}</h2>
              <p className="modal-categoria">
                {product.categoria} / {product.subcategoria}
              </p>
              <p className={`modal-stock ${disponible ? "in" : "out"}`}>
                {disponible ? "En stock" : "Agotado"}
              </p>
              <p className="modal-precio">${product.precio.toLocaleString()}</p>
            </div>
          </div>

          {/* Ficha sensorial */}
          <section className="sensory-section">
            <h3>Ficha técnica sensorial</h3>
            <div className="bars">
              <div className="bar-group">
                <span>Dulzor</span>
                <div className="bar">
                  <div style={{ width: `${dulzor * 20}%` }} />
                </div>
                <div className="dot-row">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < dulzor ? "dot-filled" : "dot-empty"}
                    />
                  ))}
                </div>
              </div>
              <div className="bar-group">
                <span>Textura</span>
                <div className="bar">
                  <div style={{ width: `${textura * 20}%` }} />
                </div>
                <div className="dot-row">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < textura ? "dot-filled" : "dot-empty"}
                    />
                  ))}
                </div>
              </div>
              <div className="bar-group">
                <span>Intensidad</span>
                <div className="bar">
                  <div style={{ width: `${intensidad * 20}%` }} />
                </div>
                <div className="dot-row">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < intensidad ? "dot-filled" : "dot-empty"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Ingredientes */}
          <section className="ingredients-section">
            <h3>Ingredientes</h3>
            <ul>
              {(product.ingredientes || []).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </section>

          {/* Alérgenos */}
          <section className="allergens-section">
            <h3>Alérgenos</h3>
            <p className="allergens">
              {(product.ficha_sensorial?.alergenos || []).length > 0
                ? (product.ficha_sensorial?.alergenos || []).join(", ")
                : "Ninguno"}
            </p>
            {(product.ficha_sensorial?.alergenos || []).length > 0 && (
              <p className="warning">⚠️ Contiene alérgenos</p>
            )}
          </section>

          {/* Información adicional */}
          <section className="extra-info">
            <h3>Información adicional</h3>
            {product.porcion && (
              <p>
                <strong>Porción/presentación:</strong> {product.porcion}
              </p>
            )}
            {product.conservacion && (
              <p>
                <strong>Conservación:</strong> {product.conservacion}
              </p>
            )}
          </section>

          {/* Reseñas */}
          <Resenas productoId={product._id} />

          <div className="modal-actions">
            {esPersonalizable && (
              <button
                className="btn-personalizar-modal"
                onClick={() => setShowPersonalizar(true)}
              >
                🎨 Personalizar
              </button>
            )}
            {feedbackAgregar && (
              <p className={`feedback-agregar ${feedbackAgregar.startsWith("✅") ? "ok" : "error"}`}>
                {feedbackAgregar}
              </p>
            )}
            <button
              className="btn-agregar"
              disabled={!disponible || agregando}
              onClick={async () => {
                if (!isAuthenticated) {
                  onClose();
                  navigate("/login");
                  return;
                }
                setAgregando(true);
                setFeedbackAgregar("");
                const persId = localStorage.getItem("miga_ultima_personalizacion_id") || null;
                const resultado = await agregarItem(product._id, 1, persId);
                if (resultado.success) {
                  localStorage.removeItem("miga_ultima_personalizacion_id");
                  setFeedbackAgregar("✅ ¡Agregado al carrito!");
                  setTimeout(() => { setFeedbackAgregar(""); onClose(); }, 1200);
                } else {
                  setFeedbackAgregar(`❌ ${resultado.error}`);
                }
                setAgregando(false);
              }}
            >
              {agregando ? "Agregando..." : "Agregar al carrito"}
            </button>
            <button className="btn-cerrar" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {showPersonalizar && (
        <PersonalizarModal
          product={product}
          onClose={() => setShowPersonalizar(false)}
        />
      )}
    </>
  );
}
