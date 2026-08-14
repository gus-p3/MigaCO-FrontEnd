import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import AdvancedFilter from "./AdvancedFilter";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { useProductos } from "../../hooks/useProductos";
import "./Catalog.css";

export default function Catalog() {
  const { productos, loading, error, fetchProductos, buscarProductos } =
    useProductos();
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Actualizar productos filtrados cuando cambien los datos o filtros
  useEffect(() => {
    aplicarFiltros();
  }, [productos, categoriaActiva, filtrosActivos]);

  const aplicarFiltros = () => {
    let resultado = productos;

    // Filtro por categoría
    if (categoriaActiva !== "todos") {
      resultado = resultado.filter((p) => p.categoria === categoriaActiva);
    }

    // Filtro por precio
    if (filtrosActivos.precioMin) {
      resultado = resultado.filter(
        (p) => p.precio >= parseFloat(filtrosActivos.precioMin),
      );
    }
    if (filtrosActivos.precioMax) {
      resultado = resultado.filter(
        (p) => p.precio <= parseFloat(filtrosActivos.precioMax),
      );
    }

    // Filtro por disponibilidad
    if (filtrosActivos.disponible) {
      resultado = resultado.filter((p) => (p.stock?.sucursal_centro || 0) > 0);
    }

    // Filtro por tags
    if (filtrosActivos.tags && filtrosActivos.tags.length > 0) {
      resultado = resultado.filter((p) =>
        filtrosActivos.tags.some((tag) => p.tags?.includes(tag)),
      );
    }

    setProductosFiltrados(resultado);
  };

  const handleBusqueda = (query) => {
    if (query.length >= 2) {
      buscarProductos(query);
    } else {
      fetchProductos();
    }
  };

  const handleCategoriaChange = (categoria) => {
    setCategoriaActiva(categoria);
  };

  const handleFiltrosChange = (filtros) => {
    setFiltrosActivos(filtros);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="catalog-container">
      {/* Hero Section */}
      <section className="catalog-hero">
        <h1>Nuestro Catálogo</h1>
        <p>Descubre nuestras deliciosas creaciones artesanales</p>
      </section>

      {/* Buscador */}
      <section className="catalog-search">
        <div className="catalog-search-row">
          <SearchBar onSearch={handleBusqueda} productos={productos} />
          <button
            className={`btn-toggle-filtros ${mostrarFiltros ? "active" : ""}`}
            onClick={() => setMostrarFiltros((prev) => !prev)}
            aria-expanded={mostrarFiltros}
            aria-label="Mostrar filtros avanzados"
          >
            <span className="filter-icon" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span>Filtros avanzados</span>
          </button>
        </div>

        <div
          className={`catalog-advanced-panel ${mostrarFiltros ? "open" : ""}`}
        >
          <AdvancedFilter
            onFiltersChange={handleFiltrosChange}
            productos={productos}
          />
        </div>
      </section>

      {/* Productos */}
      <div className="catalog-main">
        {/* Contenido principal */}
        <main className="catalog-content">
          {/* Categorías */}
          <CategoryFilter
            categoriaActiva={categoriaActiva}
            onCategoriaChange={handleCategoriaChange}
          />

          {/* Estado de carga */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-state">
              <p>⚠️ Error al cargar los productos: {error}</p>
            </div>
          )}

          {/* Resultados */}
          {!loading && !error && (
            <>
              {productosFiltrados.length > 0 ? (
                <>
                  <div className="results-info">
                    <p>
                      Mostrando <strong>{productosFiltrados.length}</strong> de{" "}
                      <strong>{productos.length}</strong> productos
                    </p>
                  </div>
                  <div className="products-grid">
                    {productosFiltrados.map((producto) => (
                      <ProductCard
                        key={producto._id}
                        product={producto}
                        onSelectProduct={handleSelectProduct}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🍰</div>
                  <h3>No hay productos</h3>
                  <p>No encontramos productos que coincidan con tus filtros.</p>
                  <button
                    className="btn-reset"
                    onClick={() => {
                      setCategoriaActiva("todos");
                      setFiltrosActivos({});
                      fetchProductos();
                    }}
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* modal: only render when a product is selected */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}
