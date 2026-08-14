import { useState, useEffect } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, productos }) {
  const [query, setQuery] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const queryLower = query.toLowerCase();
    
    const resultados = productos
      .filter(p => 
        p.nombre.toLowerCase().includes(queryLower) ||
        p.categoria.toLowerCase().includes(queryLower) ||
        p.tags?.some(t => t.toLowerCase().includes(queryLower))
      )
      .slice(0, 8);

    setSugerencias(resultados);
    setMostrarSugerencias(true);
  }, [query, productos]);

  const handleSelect = (producto) => {
    setQuery(producto.nombre);
    setMostrarSugerencias(false);
    onSearch(producto.nombre);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
    setMostrarSugerencias(false);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setMostrarSugerencias(true)}
          placeholder="Buscar pasteles, ingredientes, sabores..."
          className="search-input"
        />
        <button type="submit" className="search-btn">
          🔍
        </button>
      </form>

      {mostrarSugerencias && sugerencias.length > 0 && (
        <div className="sugerencias-panel">
          {sugerencias.map((producto) => (
            <div
              key={producto._id}
              className="sugerencia-item"
              onClick={() => handleSelect(producto)}
            >
              <div className="sugerencia-icon">🍰</div>
              <div className="sugerencia-info">
                <div className="sugerencia-nombre">{producto.nombre}</div>
                <div className="sugerencia-categoria">{producto.categoria}</div>
              </div>
              <div className="sugerencia-precio">
                ${producto.precio.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
