import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "./ProductDetail.css";
import Resenas from "../components/reviews/Resenas";

export default function ProductDetail() {
  const { id } = useParams();
  const [prod, setProd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/productos/${id}`)
      .then((r) => setProd(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Cargando producto...</p>;
  if (!prod) return <p className="not-found">Producto no encontrado</p>;

  const disponible =
    (prod.stock?.sucursal_centro || 0) + (prod.stock?.sucursal_norte || 0) > 0;

  const dulzor = prod.ficha_sensorial?.dulzor || 0;
  const textura = prod.ficha_sensorial?.textura || 0;
  const intensidad = prod.ficha_sensorial?.intensidad || 0;

  return (
    <div className="detail-container">
      <Link to="/productos" className="back-link">
        Volver al catálogo
      </Link>

      <div className="detail-header">
        <img
          src={
            prod.multimedia?.fotos_exterior?.[0] ||
            "https://via.placeholder.com/400?text=Sin+imagen"
          }
          alt={prod.nombre}
          className="detail-image"
        />

        <div className="detail-info">
          <h2>{prod.nombre}</h2>
          <p className="detail-categoria">
            {prod.categoria} / {prod.subcategoria}
          </p>
          <p className={`detail-stock ${disponible ? "in" : "out"}`}>
            {disponible ? "En stock" : "Agotado"}
          </p>
          <p className="detail-precio">${prod.precio.toLocaleString()}</p>
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
          </div>
          <div className="bar-group">
            <span>Textura</span>
            <div className="bar">
              <div style={{ width: `${textura * 20}%` }} />
            </div>
          </div>
          <div className="bar-group">
            <span>Intensidad</span>
            <div className="bar">
              <div style={{ width: `${intensidad * 20}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Ingredientes y alérgenos */}
      <section className="ingredients-section">
        <h3>Ingredientes</h3>
        <ul>
          {(prod.ingredientes || []).map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>

        <h3>Alérgenos</h3>
        <p className="allergens">
          {(prod.ficha_sensorial?.alergenos || []).length > 0
            ? (prod.ficha_sensorial?.alergenos || []).join(", ")
            : "Ninguno"}
        </p>
        {(prod.ficha_sensorial?.alergenos || []).length > 0 && (
          <p className="warning">Contiene alérgenos - consultar con personal</p>
        )}
      </section>

      {/* Información adicional */}
      <section className="extra-info">
        <h3>Informacion adicional</h3>
        {prod.porcion && (
          <p>
            <strong>Porcion:</strong> {prod.porcion}
          </p>
        )}
        {prod.conservacion && (
          <p>
            <strong>Conservacion:</strong> {prod.conservacion}
          </p>
        )}
      </section>

      {/* Reseñas */}
      <Resenas productoId={id} />
    </div>
  );
}
