import { useState, useEffect } from "react";
import api from "../api/axios";

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = async (filtros = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.tipo_producto)
        params.append("tipo_producto", filtros.tipo_producto);
      if (filtros.tag) params.append("tag", filtros.tag);
      if (filtros.precio_min) params.append("precio_min", filtros.precio_min);
      if (filtros.precio_max) params.append("precio_max", filtros.precio_max);
      if (filtros.disponible) params.append("disponible", filtros.disponible);

      const response = await api.get(`/productos?${params.toString()}`);
      setProductos(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async (query) => {
    try {
      setLoading(true);
      const response = await api.get(`/productos/buscar?q=${query}`);
      setProductos(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return { productos, loading, error, fetchProductos, buscarProductos };
};
