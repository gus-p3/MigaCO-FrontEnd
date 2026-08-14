/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import "./AdminPedidos.css";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { cargarPedidos(); }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pedidos");
      setPedidos(response.data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      showToast("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
      showToast(`Pedido actualizado a ${nuevoEstado}`);
      cargarPedidos();
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      showToast("Error al actualizar pedido");
    }
  };

  const getEstadoLogistica = (pedido) =>
    pedido.estado || pedido.logistica?.estado || "pendiente";

  const getEstadoPago = (pedido) =>
    pedido.pago?.estado || "pendiente";

  // ── Dirección de entrega ─────────────────────────────────────────────
  // El backend devuelve la dirección en pedido.direccion_envio (raíz)
  const getDireccionEntrega = (pedido) =>
    (pedido.direccion_envio?.calle || pedido.direccion_envio?.ciudad)
      ? pedido.direccion_envio
      : null;

  const getEstadoColor = (estado) => ({
    pendiente:  "#f39c12",
    pagado:     "#27ae60",
    confirmado: "#3498db",
    preparando: "#9b59b6",
    enviado:    "#1abc9c",
    entregado:  "#2ecc71",
    cancelado:  "#e74c3c",
  }[estado] || "#95a5a6");

  const getPagoColor = (estado) =>
    estado === "pagado" ? "#27ae60" : "#f39c12";

  const pedidosFiltrados = (() => {
    if (filter === "todos")  return pedidos;
    if (filter === "pagado") return pedidos.filter(p => getEstadoPago(p) === "pagado");
    return pedidos.filter(p => (p.estado || p.logistica?.estado) === filter);
  })();

  return (
    <div className="admin-pedidos-container">
      <div className="admin-header">
        <h1>Gestión de Pedidos</h1>
      </div>

      <div className="filtros">
        {[
          { key: "todos",      label: "Todos" },
          { key: "pendiente",  label: "Pendientes" },
          { key: "pagado",     label: "Pagados" },
          { key: "confirmado", label: "Confirmados" },
          { key: "preparando", label: "Preparando" },
          { key: "enviado",    label: "Enviados" },
          { key: "entregado",  label: "Entregados" },
          { key: "cancelado",  label: "Cancelados" },
        ].map(({ key, label }) => (
          <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">Cargando pedidos...</div>
      ) : (
        <div className="pedidos-list">
          {pedidosFiltrados.length === 0 ? (
            <div className="empty-state">No hay pedidos en esta categoría</div>
          ) : (
            pedidosFiltrados.map((pedido) => {
              const estadoLogistica = getEstadoLogistica(pedido);
              const estadoPago      = getEstadoPago(pedido);
              const direccion       = getDireccionEntrega(pedido);

              return (
                <motion.div
                  key={pedido._id}
                  className="pedido-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* ── Header ── */}
                  <div className="pedido-header">
                    <div>
                      <h3>Pedido #{pedido._id.slice(-6)}</h3>
                      <p className="fecha">
                        {new Date(pedido.fecha || pedido.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="estado-badges">
                      <div className="estado" style={{ backgroundColor: getEstadoColor(estadoLogistica) }}>
                        {estadoLogistica.toUpperCase()}
                      </div>
                      <div className="estado estado-pago" style={{ backgroundColor: getPagoColor(estadoPago) }}>
                        💳 {estadoPago.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* ── Info cliente ── */}
                  <div className="pedido-info">
                    <p><strong>Cliente:</strong> {pedido.cliente?.nombre || "Cliente"}</p>
                    <p><strong>Email:</strong>   {pedido.cliente?.email  || "N/A"}</p>
                    <p><strong>Total:</strong>   ${pedido.total?.toLocaleString() || pedido.precio_total?.toLocaleString() || 0}</p>
                  </div>

                  {/* ── Dirección de entrega ── */}
                  <div className={`pedido-direccion ${!direccion ? 'pedido-direccion-empty' : ''}`}>
                    <div className="pedido-direccion-head">
                      <span>📍</span>
                      <strong>Dirección de entrega</strong>
                    </div>
                    {direccion ? (
                      <div className="pedido-dir-body">
                        {direccion.etiqueta && (
                          <span className="pedido-dir-etiqueta">{direccion.etiqueta}</span>
                        )}
                        <p className="pedido-dir-calle">{direccion.calle}</p>
                        <p className="pedido-dir-ciudad">
                          {direccion.ciudad}{direccion.codigo_postal ? `, CP ${direccion.codigo_postal}` : ''}
                        </p>
                        {direccion.referencias && (
                          <p className="pedido-dir-ref">📌 {direccion.referencias}</p>
                        )}
                      </div>
                    ) : (
                      <p className="pedido-dir-na">Sin dirección de entrega registrada</p>
                    )}
                  </div>

                  {/* ── Productos ── */}
                  <div className="pedido-productos">
                    <strong>Productos:</strong>
                    {(pedido.productos || pedido.items)?.map((item, idx) => (
                      <div key={idx} className="producto-item">
                        {item.cantidad}x {item.nombre || item.producto?.nombre || item.producto_id?.nombre || "Producto"}
                      </div>
                    ))}
                  </div>

                  {/* ── Cambiar estado ── */}
                  <div className="pedido-actions">
                    <select
                      value={estadoLogistica}
                      onChange={(e) => actualizarEstado(pedido._id, e.target.value)}
                      className="estado-select"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="preparando">Preparando</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}