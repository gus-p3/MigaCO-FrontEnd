import "./CategoryFilter.css";

const CATEGORIAS = [
  { id: "todos", label: "Todos", emoji: "🍰" },
  { id: "Pasteles", label: "Pasteles", emoji: "🎂" },
  { id: "Repostería y Galletas", label: "Repostería", emoji: "🍪" },
  { id: "Reposteria Saludable", label: "Reposteria Saludable", emoji: "🌿" },
  { id: "Panadería", label: "Panadería", emoji: "🥐" },
  { id: "Gelatinas", label: "Gelatinas", emoji: "🧁" },
  { id: "Materias Primas", label: "Materias Primas", emoji: "🥫" },
];

export default function CategoryFilter({ categoriaActiva, onCategoriaChange }) {
  return (
    <div className="category-filter">
      <h3 className="filter-title">Categorías</h3>
      <div className="categories-grid">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${categoriaActiva === cat.id ? "active" : ""}`}
            onClick={() => onCategoriaChange(cat.id)}
          >
            <span className="category-emoji">{cat.emoji}</span>
            <span className="category-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
