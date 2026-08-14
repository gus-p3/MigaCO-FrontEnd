import "./ProductCard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";

export default function ProductCard({ product, onSelectProduct }) {
  const [imageError, setImageError] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { agregarItem } = useCarrito();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const esPersonalizable =
    product.personalizable?.permite_mensaje ||
    product.personalizable?.rellenos_disponibles?.length > 0 ||
    product.personalizable?.coberturas_disponibles?.length > 0;

  const primeraFoto =
    product.multimedia?.fotos_exterior?.[0] ||
    "https://via.placeholder.com/300?text=Sin+imagen";
  const stock = product.stock?.sucursal_centro || 0;
  const disponible = stock > 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={
            imageError
              ? "https://via.placeholder.com/300?text=Error"
              : primeraFoto
          }
          alt={product.nombre}
          className="product-image"
          onError={() => setImageError(true)}
        />
        {!disponible && <div className="badge-agotado">Agotado</div>}
        {esPersonalizable && (
          <div className="badge-personalizable">Personalizable</div>
        )}
      </div>

      <div className="product-info">
        <div className="product-categoria">{product.categoria}</div>
        <h3 className="product-nombre">{product.nombre}</h3>

        <p className="product-descripcion">
          {product.descripcion?.substring(0, 80)}...
        </p>

        <div className="product-tags">
          {product.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="product-footer">
          <div className="product-precio">
            ${product.precio.toLocaleString()}
          </div>
          <button
            className="btn-agregar"
            disabled={!disponible || agregando}
            onClick={async () => {
              if (!isAuthenticated) {
                navigate("/login");
                return;
              }
              setAgregando(true);
              setFeedback("");
              const resultado = await agregarItem(product._id, 1);
              if (resultado.success) {
                setFeedback("✅");
                setTimeout(() => setFeedback(""), 1500);
              } else {
                setFeedback("❌");
                setTimeout(() => setFeedback(""), 2000);
              }
              setAgregando(false);
            }}
          >
            {agregando ? "..." : feedback || (disponible ? "Agregar" : "Agotado")}
          </button>
        </div>

        <div className="product-stock">Stock: {stock} unidades</div>

        <button
          className="btn-vermas"
          onClick={() => onSelectProduct && onSelectProduct(product)}
        >
          Ver más
        </button>
      </div>
    </div>
  );
}
