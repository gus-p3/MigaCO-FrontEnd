/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

export const CarritoContext = createContext(null);

export const CarritoProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCarrito = useCallback(async () => {
    if (!isAuthenticated) {
      setCarrito(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/carrito');
      setCarrito(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCarrito();
  }, [fetchCarrito]);

  const agregarItem = useCallback(async (producto_id, cantidad = 1, personalizacion_id = null) => {
    try {
      setLoading(true);
      const payload = { producto_id, cantidad };
      if (personalizacion_id) payload.personalizacion_id = personalizacion_id;
      const res = await api.post('/carrito/items', payload);
      setCarrito(res.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al agregar al carrito';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarCantidad = useCallback(async (itemId, cantidad) => {
    try {
      const res = await api.put(`/carrito/items/${itemId}`, { cantidad });
      setCarrito(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar cantidad');
    }
  }, []);

  const eliminarItem = useCallback(async (itemId) => {
    try {
      const res = await api.delete(`/carrito/items/${itemId}`);
      setCarrito(res.data.carrito);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar producto');
    }
  }, []);

  const vaciarCarrito = useCallback(async () => {
    try {
      await api.delete('/carrito');
      setCarrito((prev) => (prev ? { ...prev, items: [], subtotal: 0 } : null));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al vaciar el carrito');
    }
  }, []);

  const limpiarError = useCallback(() => setError(null), []);

  const totalItems = carrito?.items?.reduce((acc, i) => acc + i.cantidad, 0) || 0;

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        loading,
        error,
        totalItems,
        fetchCarrito,
        agregarItem,
        actualizarCantidad,
        eliminarItem,
        vaciarCarrito,
        limpiarError,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
};
