import { useState } from "react";
import "./AdvancedFilter.css";

export default function AdvancedFilter({ onFiltersChange, productos }) {
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [disponibleSolo, setDisponibleSolo] = useState(false);
  const [tagsSeleccionados, setTagsSeleccionados] = useState([]);

  // Obtener tags únicos de todos los productos
  const tagsUnicos = [...new Set(productos.flatMap((p) => p.tags || []))];

  const handlePrecioChange = (nextMin = precioMin, nextMax = precioMax) => {
    onFiltersChange({
      precioMin: nextMin,
      precioMax: nextMax,
      disponible: disponibleSolo,
      tags: tagsSeleccionados,
    });
  };

  const handleToggleTag = (tag) => {
    const nuevosTags = tagsSeleccionados.includes(tag)
      ? tagsSeleccionados.filter((t) => t !== tag)
      : [...tagsSeleccionados, tag];
    setTagsSeleccionados(nuevosTags);
    onFiltersChange({
      precioMin,
      precioMax,
      disponible: disponibleSolo,
      tags: nuevosTags,
    });
  };

  const handleLimpiar = () => {
    setPrecioMin("");
    setPrecioMax("");
    setDisponibleSolo(false);
    setTagsSeleccionados([]);
    onFiltersChange({
      precioMin: "",
      precioMax: "",
      disponible: false,
      tags: [],
    });
  };

  return (
    <div className="advanced-filter">
      <div className="filter-header">
        <h3>Filtros Avanzados</h3>
        <button className="btn-limpiar" onClick={handleLimpiar}>
          ✕ Limpiar
        </button>
      </div>

      {/* Filtro de Precio */}
      <div className="filter-section">
        <h4>Rango de Precio</h4>
        <div className="price-inputs">
          <div className="input-group">
            <label>Min</label>
            <input
              type="number"
              value={precioMin}
              onChange={(e) => {
                const nextMin = e.target.value;
                setPrecioMin(nextMin);
                handlePrecioChange(nextMin, precioMax);
              }}
              placeholder="$0"
              min="0"
            />
          </div>
          <span className="separator">—</span>
          <div className="input-group">
            <label>Max</label>
            <input
              type="number"
              value={precioMax}
              onChange={(e) => {
                const nextMax = e.target.value;
                setPrecioMax(nextMax);
                handlePrecioChange(precioMin, nextMax);
              }}
              placeholder="$5000"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Filtro de Disponibilidad */}
      <div className="filter-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={disponibleSolo}
            onChange={(e) => {
              setDisponibleSolo(e.target.checked);
              onFiltersChange({
                precioMin,
                precioMax,
                disponible: e.target.checked,
                tags: tagsSeleccionados,
              });
            }}
          />
          <span>Solo disponibles (stock &gt; 0)</span>
        </label>
      </div>

      {/* Filtro de Tags */}
      {tagsUnicos.length > 0 && (
        <div className="filter-section">
          <h4>Sabores y Características</h4>
          <div className="tags-filter">
            {tagsUnicos.map((tag) => (
              <button
                key={tag}
                className={`tag-btn ${tagsSeleccionados.includes(tag) ? "active" : ""}`}
                onClick={() => handleToggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
