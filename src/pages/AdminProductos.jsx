/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import ProductCard from "./AdminProduct"; // Importar ProductCard
import "./AdminProductos.css";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: {
      sucursal_centro: 0,
      sucursal_norte: 0
    },
    imagen: "",
    categoria: "",
    subcategoria: "",
    tipo_producto: "",
    tags: "",
    ingredientes: ""
  });
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // Para el modal de edición

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [productos, searchTerm, selectedCategoria]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/productos");
      setProductos(response.data);
      setFilteredProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      showToast("Error al cargar productos", "error");
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await api.get("/productos/categorias");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const filtrarProductos = () => {
    let filtered = [...productos];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategoria) {
      filtered = filtered.filter(p => p.categoria === selectedCategoria);
    }

    setFilteredProductos(filtered);
  };

  const guardarProducto = async () => {
    try {
      const productoData = {
        nombre: form.nombre,
        categoria: form.categoria,
        subcategoria: form.subcategoria,
        tipo_producto: form.tipo_producto,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        stock: {
          sucursal_centro: parseInt(form.stock.sucursal_centro) || 0,
          sucursal_norte: parseInt(form.stock.sucursal_norte) || 0
        },
        fotos_exterior: form.imagen ? [form.imagen] : [],
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        ingredientes: form.ingredientes.split(',').map(ing => ing.trim()).filter(ing => ing)
      };

      if (modal.type === "add") {
        await api.post("/productos", productoData);
        showToast("✨ Producto agregado exitosamente");
      } else {
        await api.put(`/productos/${modal.data._id}`, productoData);
        showToast("✨ Producto actualizado exitosamente");
      }
      cargarProductos();
      setModal(null);
      resetForm();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      showToast(error.response?.data?.message || "Error al guardar producto", "error");
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await api.delete(`/productos/${id}`);
      showToast("🗑️ Producto eliminado exitosamente");
      cargarProductos();
      setModal(null);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      showToast("Error al eliminar producto", "error");
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: { sucursal_centro: 0, sucursal_norte: 0 },
      imagen: "",
      categoria: "",
      subcategoria: "",
      tipo_producto: "",
      tags: "",
      ingredientes: ""
    });
  };

  const openAddModal = () => {
    resetForm();
    setModal({ type: "add" });
  };

  const openEditModal = (producto) => {
    setForm({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      stock: producto.stock || { sucursal_centro: 0, sucursal_norte: 0 },
      imagen: producto.fotos_exterior?.[0] || "",
      categoria: producto.categoria || "",
      subcategoria: producto.subcategoria || "",
      tipo_producto: producto.tipo_producto || "",
      tags: producto.tags?.join(", ") || "",
      ingredientes: producto.ingredientes?.join(", ") || ""
    });
    setModal({ type: "edit", data: producto });
  };

  const openDeleteModal = (producto) => {
    setModal({ type: "delete", data: producto });
  };

  const handleSelectProduct = (product) => {
    // Esto se usa para el modal de edición cuando se hace clic en "Ver más"
    openEditModal(product);
  };

  const formatStock = (stock) => {
    if (typeof stock === 'object') {
      const total = (stock.sucursal_centro || 0) + (stock.sucursal_norte || 0);
      return total;
    }
    return stock || 0;
  };

  return (
    <div className="admin-container">
      {/* Hero Section */}
      <div className="admin-hero">
        <h1>Gestión de <em>Productos</em></h1>
        <p>Administra el catálogo de productos de Miga-Co</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="admin-search">
        <div className="admin-search-row">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar productos por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className={`btn-toggle-filtros ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="filter-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
            Filtros
          </button>
          <button className="btn-add-producto" onClick={openAddModal}>
            + Agregar Producto
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="admin-advanced-panel"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="advanced-filter">
                <div className="filter-group">
                  <label>Categoría</label>
                  <select
                    value={selectedCategoria}
                    onChange={(e) => setSelectedCategoria(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-clear-filters"
                  onClick={() => {
                    setSelectedCategoria("");
                    setSearchTerm("");
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contenido principal */}
      <div className="admin-main">
        <div className="admin-content">
          {/* Resultados info */}
          <div className="results-info">
            <p>
              <strong>{filteredProductos.length}</strong> producto(s) encontrado(s)
              {selectedCategoria && ` en categoría "${selectedCategoria}"`}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Products Grid usando ProductCard */}
              {filteredProductos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No hay productos</h3>
                  <p>Comienza agregando tu primer producto</p>
                  <button className="btn-reset" onClick={openAddModal}>
                    + Agregar producto
                  </button>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProductos.map((producto) => (
                    <div key={producto._id} className="product-card-wrapper">
                      <ProductCard 
                        product={producto} 
                        onSelectProduct={handleSelectProduct}
                      />
                      {/* Botones de admin sobre la tarjeta */}
                      <div className="admin-overlay-buttons">
                        <button 
                          className="admin-btn-edit-mini"
                          onClick={() => openEditModal(producto)}
                          title="Editar producto"
                        >
                          ✏️
                        </button>
                        <button 
                          className="admin-btn-delete-mini"
                          onClick={() => openDeleteModal(producto)}
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modales (mantienen el mismo código) */}
      <AnimatePresence>
        {(modal?.type === "add" || modal?.type === "edit") && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{modal.type === "add" ? "✨ Nuevo Producto" : "✏️ Editar Producto"}</h2>
              <form onSubmit={(e) => { e.preventDefault(); guardarProducto(); }}>
                <input
                  type="text"
                  placeholder="Nombre del producto *"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Descripción *"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  required
                  rows="3"
                />
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Categoría *"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subcategoría"
                    value={form.subcategoria}
                    onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Tipo de producto"
                    value={form.tipo_producto}
                    onChange={(e) => setForm({ ...form, tipo_producto: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Precio *"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Stock Centro *"
                    value={form.stock.sucursal_centro}
                    onChange={(e) => setForm({
                      ...form,
                      stock: { ...form.stock, sucursal_centro: e.target.value }
                    })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock Norte *"
                    value={form.stock.sucursal_norte}
                    onChange={(e) => setForm({
                      ...form,
                      stock: { ...form.stock, sucursal_norte: e.target.value }
                    })}
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="URL de la imagen (opcional)"
                  value={form.imagen}
                  onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Tags (separados por coma) - Ej: chocolate, especial"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Ingredientes (separados por coma)"
                  value={form.ingredientes}
                  onChange={(e) => setForm({ ...form, ingredientes: e.target.value })}
                />
                <div className="modal-buttons">
                  <button type="button" onClick={() => setModal(null)}>Cancelar</button>
                  <button type="submit">Guardar Producto</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Eliminación */}
      <AnimatePresence>
        {modal?.type === "delete" && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="modal-content confirm-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-icon">🗑️</div>
              <h2>Confirmar Eliminación</h2>
              <p>¿Estás seguro de eliminar <strong>"{modal.data.nombre}"</strong>?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
              <div className="modal-buttons">
                <button onClick={() => setModal(null)}>Cancelar</button>
                <button className="btn-danger" onClick={() => eliminarProducto(modal.data._id)}>
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast ${toast.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}