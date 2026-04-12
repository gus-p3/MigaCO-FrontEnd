import { useState, useMemo } from "react";
import { useProductos } from "../hooks/useProductos";
import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import AdvancedFilters from "./AdvancedFilters";
import ProductCard from "./ProductCard";
import Breadcrumb from "./Breadcrumb"; // ← Importar Breadcrumb
import "./Catalog.css";

export default function Catalog() {
  const { productos, loading, error } = useProductos();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    precioMin: 0,
    precioMax: 500,
    tipo: "",
    disponibleSolo: false,
  });

  // Detectar categoría de la URL
  useMemo(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [location.search]);

  // Obtener nombre legible de la categoría para el breadcrumb
  const getCategoryName = (categoryId) => {
    const categoryNames = {
      'todos': 'Todos los Productos',
      'pasteles': 'Pasteles Personalizados',
      'bodas': 'Pasteles de Boda',
      'infantiles': 'Pasteles Infantiles',
      'temporada': 'Especiales de Temporada',
      'cupcakes': 'Cupcakes',
      'postres': 'Postres Individuales',
      'galletas': 'Galletas Decoradas',
      'eventos': 'Para Eventos',
    };
    return categoryNames[categoryId] || categoryId;
  };

  const filteredProducts = useMemo(() => {
    let result = productos;

    // Filtrar por categoría
    if (selectedCategory !== "todos") {
      result = result.filter((p) => p.categoria === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query)) ||
          p.categoria.toLowerCase().includes(query) ||
          p.descripcion?.toLowerCase().includes(query),
      );
    }

    // Filtrar por precio
    result = result.filter(
      (p) => p.precio >= filters.precioMin && p.precio <= filters.precioMax,
    );

    // Filtrar por tipo
    if (filters.tipo) {
      result = result.filter((p) => p.tipo_producto === filters.tipo);
    }

    // Filtrar por disponibilidad
    if (filters.disponibleSolo) {
      result = result.filter(
        (p) =>
          (p.stock?.sucursal_centro || 0) > 0 ||
          (p.stock?.sucursal_norte || 0) > 0,
      );
    }

    return result;
  }, [productos, selectedCategory, searchQuery, filters]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Determinar el título de la categoría actual para el breadcrumb
  const currentCategoryName = selectedCategory !== "todos" 
    ? getCategoryName(selectedCategory) 
    : null;

  return (
    <div className="catalog-container">
      {/* Breadcrumb - Orientación jerárquica */}
      <Breadcrumb 
        categoryName={currentCategoryName}
        customRoutes={{
          'productos': 'Catálogo'
        }}
      />
      
      <SearchBar onSearch={handleSearch} produtosDisponibles={productos} />
      
      <CategoryFilter
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
      />
      
      <AdvancedFilters onFiltersChange={handleFiltersChange} />

      <div className="catalog-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>❌ Error al cargar productos: {error}</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">🔍</p>
            <p className="empty-title">No encontramos productos</p>
            <p className="empty-message">
              Intenta cambiar los filtros o la búsqueda
            </p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <>
            <div className="results-info">
              <p>
                Mostrando <strong>{filteredProducts.length}</strong> de{" "}
                <strong>{productos.length}</strong> productos
                {selectedCategory !== "todos" && (
                  <span className="category-badge">
                    en {getCategoryName(selectedCategory)}
                  </span>
                )}
              </p>
            </div>

            <div className="products-grid">
              {filteredProducts.map((producto) => (
                <ProductCard key={producto._id} producto={producto} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 