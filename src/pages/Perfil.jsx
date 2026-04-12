import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../Api/axios";
import "./Perfil.css";
import {
  IconHome,
  IconUser,
  IconEdit,
  IconTrash,
  IconPlus,
  IconStar,
  IconLogout,
  IconSave,
  IconOrders,
} from "../utils/perfilUtils";

export default function PerfilMigaCo() {
  const { logout, user: authUser, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("direcciones");
  const [direcciones, setDirecciones] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    etiqueta: "Hogar",
    calle: "",
    ciudad: "",
    codigo_postal: "",
    referencias: "",
    es_principal: false,
  });
  const [profileForm, setProfileForm] = useState({ nombre: "", email: "" });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    if (authUser) {
      setProfileForm({
        nombre: authUser.nombre || "",
        email: authUser.email || "",
      });
      if (authUser.perfil?.direcciones)
        setDirecciones(authUser.perfil.direcciones);
      cargarPedidos();
      setLoading(false);
    } else if (!authLoading) {
      window.location.href = "/login";
    }
  }, [authUser, authLoading]);

  const cargarPedidos = async () => {
    try {
      setLoadingPedidos(true);
      const response = await api.get("/pedidos/mis-pedidos");
      setPedidos(response.data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      showToast("Error al cargar tus pedidos");
    } finally {
      setLoadingPedidos(false);
    }
  };

  // ── Helpers de estado ──────────────────────────────────────────────────
  // El backend devuelve pedido.estado en la raíz (no en logistica)
  const getEstadoPedido = (pedido) =>
    pedido.estado || pedido.logistica?.estado || "pendiente";

  const getEstadoEnEspanol = (estado) =>
    ({
      pendiente: "Pendiente",
      confirmado: "Confirmado",
      preparando: "Preparando",
      enviado: "Enviado",
      entregado: "Entregado",
      cancelado: "Cancelado",
    })[estado] || estado;

  const getEstadoColor = (estado) =>
    ({
      pendiente: "#f39c12",
      confirmado: "#3498db",
      preparando: "#9b59b6",
      enviado: "#1abc9c",
      entregado: "#27ae60",
      cancelado: "#e74c3c",
    })[estado] || "#95a5a6";

  // ── Dirección de entrega del pedido ───────────────────────────────────
  // El backend la devuelve en pedido.direccion_envio (raíz)
  const getDireccionPedido = (pedido) => {
    const d = pedido.direccion_envio || pedido.logistica?.direccion_entrega;
    return d?.calle ? d : null;
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // ── Operaciones de dirección ───────────────────────────────────────────
  const cargarDirecciones = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuarios/perfil");
      if (response.data.perfil?.direcciones)
        setDirecciones(response.data.perfil.direcciones);
    } catch (error) {
      showToast("Error al cargar las direcciones");
    } finally {
      setLoading(false);
    }
  };

  const agregarDireccion = async (direccionData) => {
    try {
      const response = await api.post("/usuarios/direcciones", direccionData);
      const dirs =
        response.data.usuario?.perfil?.direcciones ||
        response.data.perfil?.direcciones ||
        null;
      if (dirs) {
        setDirecciones(dirs);
      } else if (response.data.direccion) {
        setDirecciones((prev) => [...prev, response.data.direccion]);
      } else if (response.data._id) {
        setDirecciones((prev) => [...prev, response.data]);
      } else return false;
      showToast("✦ Dirección agregada exitosamente");
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Error al agregar dirección");
      return false;
    }
  };

  const actualizarDireccion = async (direccionId, direccionData) => {
    try {
      const response = await api.put(
        `/usuarios/direcciones/${direccionId}`,
        direccionData,
      );
      const dirs =
        response.data.usuario?.perfil?.direcciones ||
        response.data.perfil?.direcciones ||
        null;
      if (dirs) {
        setDirecciones(dirs);
      } else if (response.data.direccion) {
        setDirecciones((prev) =>
          prev.map((d) =>
            d._id === direccionId ? response.data.direccion : d,
          ),
        );
      } else if (response.data._id) {
        setDirecciones((prev) =>
          prev.map((d) => (d._id === direccionId ? response.data : d)),
        );
      } else return false;
      showToast("✦ Dirección actualizada exitosamente");
      return true;
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error al actualizar dirección",
      );
      return false;
    }
  };

  const eliminarDireccion = async (direccionId) => {
    try {
      const response = await api.delete(`/usuarios/direcciones/${direccionId}`);
      const dirs = response.data.usuario?.perfil?.direcciones || null;
      if (dirs) setDirecciones(dirs);
      else setDirecciones((prev) => prev.filter((d) => d._id !== direccionId));
      showToast("✦ Dirección eliminada exitosamente");
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Error al eliminar dirección");
      return false;
    }
  };

  const actualizarPerfil = async (datos) => {
    try {
      await api.put("/usuarios/perfil", datos);
      showToast("✦ Perfil actualizado exitosamente");
      setTimeout(() => window.location.reload(), 1000);
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Error al actualizar perfil");
      return false;
    }
  };

  // ── Modal handlers ─────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({
      etiqueta: "Hogar",
      calle: "",
      ciudad: "",
      codigo_postal: "",
      referencias: "",
      es_principal: false,
    });
    setModal({ type: "add" });
  };
  const openEdit = (addr) => {
    setForm({ ...addr });
    setModal({ type: "edit", data: addr });
  };
  const openDelete = (addr) => setModal({ type: "delete", data: addr });
  const openEditProfile = () => {
    setProfileForm({
      nombre: authUser?.nombre || "",
      email: authUser?.email || "",
    });
    setModal({ type: "editProfile" });
  };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    // Validaciones de dirección
    if (!form.etiqueta || form.etiqueta.trim() === "") {
      showToast("La etiqueta es obligatoria");
      return;
    }

    if (!form.calle || form.calle.trim() === "") {
      showToast("La calle y número son obligatorios");
      return;
    }

    if (form.calle.trim().length < 5) {
      showToast("La dirección debe tener al menos 5 caracteres");
      return;
    }

    if (!form.ciudad || form.ciudad.trim() === "") {
      showToast("La ciudad es obligatoria");
      return;
    }

    if (!form.codigo_postal || form.codigo_postal.trim() === "") {
      showToast("El código postal es obligatorio");
      return;
    }

    // Validar formato de código postal (5 dígitos)
    const cpRegex = /^\d{5}$/;
    if (!cpRegex.test(form.codigo_postal.trim())) {
      showToast("El código postal debe tener 5 dígitos numéricos");
      return;
    }

    const data = {
      etiqueta: form.etiqueta.trim(),
      calle: form.calle.trim(),
      ciudad: form.ciudad.trim(),
      codigo_postal: form.codigo_postal.trim(),
      referencias: form.referencias?.trim() || "",
      es_principal: form.es_principal,
    };

    const success =
      modal.type === "add"
        ? await agregarDireccion(data)
        : await actualizarDireccion(modal.data._id, data);

    if (success) closeModal();
  };


const handleSaveProfile = async () => {
  // Validaciones de perfil
  if (!profileForm.nombre || profileForm.nombre.trim() === "") {
    showToast("El nombre no puede estar vacío");
    return;
  }

  if (profileForm.nombre.trim().length < 3) {
    showToast("El nombre debe tener al menos 3 caracteres");
    return;
  }

  if (!profileForm.email || profileForm.email.trim() === "") {
    showToast("El email no puede estar vacío");
    return;
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profileForm.email.trim())) {
    showToast("Ingresa un email válido (ejemplo@dominio.com)");
    return;
  }

  // Si el email fue modificado, mostrar notificación informativa
  const emailModificado = authUser?.email && profileForm.email.trim() !== authUser.email;
  
  const success = await actualizarPerfil({
    nombre: profileForm.nombre.trim(),
    email: profileForm.email.trim(),
  });

  if (success) {
    if (emailModificado) {
      showToast("✨ Perfil actualizado.");
    } else {
      showToast("✨ Perfil actualizado exitosamente");
    }
    closeModal();
  }
};
  const handleDelete = async () => {
    const success = await eliminarDireccion(modal.data._id);
    if (success) closeModal();
  };

  const handleLogout = () => {
    logout();
    showToast("✦ Sesión cerrada");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  if (authLoading || loading) {
    return (
      <div className="pf-root">
        <div className="loading-container">
          <div className="loading-spinner">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  if (!authUser) return null;

  const nombreCompleto = authUser.nombre || "Usuario";
  const emailUsuario = authUser.email || "";
  const fechaRegistro = authUser.fecha_registro || new Date().toISOString();
  const initials = nombreCompleto
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const fechaFormateada = new Date(fechaRegistro).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pf-root">
      <div className="pf-layout">
        {/* ── SIDEBAR ── */}
        <aside className="pf-sidebar">
          <div className="pf-card">
            <div className="pf-avatar-wrap">
              <div className="pf-avatar">{initials}</div>
              <div className="pf-sidebar-name">{nombreCompleto}</div>
              <div className="pf-sidebar-email">{emailUsuario}</div>
              <div className="pf-sidebar-since">
                Miembro desde {fechaFormateada}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <button
                className={`pf-nav-item ${activeTab === "perfil" ? "active" : ""}`}
                onClick={() => setActiveTab("perfil")}
              >
                <IconUser /> Mis datos
              </button>
              <button
                className={`pf-nav-item ${activeTab === "direcciones" ? "active" : ""}`}
                onClick={() => setActiveTab("direcciones")}
              >
                <IconHome /> Direcciones ({direcciones.length})
              </button>
              <button
                className={`pf-nav-item ${activeTab === "pedidos" ? "active" : ""}`}
                onClick={() => setActiveTab("pedidos")}
              >
                <IconOrders /> Mis pedidos ({pedidos.length})
              </button>
              <button
                className="pf-nav-item pf-logout-btn"
                onClick={handleLogout}
              >
                <IconLogout /> Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="pf-main">
          <AnimatePresence mode="wait">
            {/* ── TAB DIRECCIONES ── */}
            {activeTab === "direcciones" && (
              <motion.div
                key="dir"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div className="pf-header-section">
                  <div>
                    <h2 className="pf-section-title">
                      Mis <em>direcciones</em>
                    </h2>
                    <p className="pf-section-sub">
                      Gestiona tus domicilios de entrega
                    </p>
                  </div>
                  <button className="pf-add-btn-mobile" onClick={openAdd}>
                    <IconPlus /> Agregar
                  </button>
                </div>

                <div className="pf-addr-grid">
                  {direcciones.length === 0 ? (
                    <div className="pf-empty-state">
                      <p>No tienes direcciones guardadas</p>
                      <button onClick={openAdd} className="pf-empty-btn">
                        Agregar tu primera dirección
                      </button>
                    </div>
                  ) : (
                    direcciones.map((addr) => (
                      <motion.div
                        key={addr._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`pf-addr-card ${addr.es_principal ? "principal" : ""}`}
                      >
                        <div className="pf-addr-icon-col">
                          {addr.etiqueta === "Hogar"
                            ? "🏠"
                            : addr.etiqueta === "Trabajo"
                              ? "💼"
                              : "📍"}
                        </div>
                        <div className="pf-addr-body">
                          <div className="pf-addr-top-row">
                            <span className="pf-addr-badge">
                              {addr.etiqueta}
                            </span>
                            {addr.es_principal && (
                              <span className="pf-addr-badge main-badge">
                                <IconStar /> Principal
                              </span>
                            )}
                          </div>
                          <div className="pf-addr-label">{addr.calle}</div>
                          <div className="pf-addr-text">
                            {addr.ciudad}, CP {addr.codigo_postal}
                          </div>
                          {addr.referencias && (
                            <div className="pf-addr-ref">
                              📌 {addr.referencias}
                            </div>
                          )}
                        </div>
                        <div className="pf-addr-actions">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="pf-btn-icon pf-btn-edit"
                            onClick={() => openEdit(addr)}
                          >
                            <IconEdit /> Editar
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="pf-btn-icon pf-btn-delete"
                            onClick={() => openDelete(addr)}
                          >
                            <IconTrash /> Eliminar
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pf-addr-add"
                    onClick={openAdd}
                  >
                    <IconPlus />
                    <span>Nueva dirección</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── TAB PERFIL ── */}
            {activeTab === "perfil" && (
              <motion.div
                key="per"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <h2 className="pf-section-title">
                    Mis <em>datos</em>
                  </h2>
                  <p className="pf-section-sub">Información de tu cuenta</p>
                </div>
                <div className="pf-card pf-profile-card">
                  <div className="pf-info-grid">
                    {[
                      { label: "Nombre completo", val: nombreCompleto },
                      { label: "Email", val: emailUsuario },
                      { label: "Miembro desde", val: fechaFormateada },
                      {
                        label: "Direcciones guardadas",
                        val: direcciones.length,
                      },
                    ].map((f) => (
                      <div className="pf-info-field" key={f.label}>
                        <label>{f.label}</label>
                        <div className="val">{f.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pf-profile-actions">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="pf-edit-profile-btn"
                      onClick={openEditProfile}
                    >
                      <IconEdit /> Editar información
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB PEDIDOS ── */}
            {activeTab === "pedidos" && (
              <motion.div
                key="ped"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <h2 className="pf-section-title">
                    Mis <em>pedidos</em>
                  </h2>
                  <p className="pf-section-sub">Historial de tus compras</p>
                </div>

                {loadingPedidos ? (
                  <div className="loading-container">
                    <div className="loading-spinner">Cargando pedidos...</div>
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className="pf-empty-state">
                    <div className="empty-icon">🛒</div>
                    <p>No tienes pedidos aún</p>
                    <button
                      className="pf-empty-btn"
                      onClick={() => (window.location.href = "/productos")}
                    >
                      Explorar productos
                    </button>
                  </div>
                ) : (
                  <div className="pf-pedidos-grid">
                    {pedidos.map((pedido) => {
                      const estadoPedido = getEstadoPedido(pedido);
                      // Backend devuelve productos en pedido.productos con nombre ya poblado
                      const productos = pedido.productos || pedido.items || [];
                      const dir = getDireccionPedido(pedido);

                      return (
                        <motion.div
                          key={pedido._id}
                          className="pf-pedido-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Header */}
                          <div className="pf-pedido-header">
                            <div>
                              <span className="pf-pedido-numero">
                                Pedido #{pedido._id.slice(-6)}
                              </span>
                              <span className="pf-pedido-fecha">
                                {formatearFecha(pedido.fecha)}
                              </span>
                            </div>
                            <div
                              className="pf-pedido-estado"
                              style={{
                                backgroundColor: getEstadoColor(estadoPedido),
                              }}
                            >
                              {getEstadoEnEspanol(estadoPedido)}
                            </div>
                          </div>

                          {/* Productos */}
                          <div className="pf-pedido-items">
                            {productos.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="pf-pedido-item">
                                <span className="pf-pedido-item-cantidad">
                                  {item.cantidad}x
                                </span>
                                <span className="pf-pedido-item-nombre">
                                  {item.nombre ||
                                    item.producto_id?.nombre ||
                                    "Producto"}
                                </span>
                                <span className="pf-pedido-item-precio">
                                  $
                                  {(
                                    (item.precio_unitario || item.precio || 0) *
                                    item.cantidad
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {productos.length > 3 && (
                              <div className="pf-pedido-mas">
                                + {productos.length - 3} producto(s) más
                              </div>
                            )}
                          </div>

                          {/* Dirección de entrega */}
                          <div className="pf-pedido-direccion">
                            <div className="pf-pedido-dir-head">
                              <span>📍</span>
                              <strong>Dirección de entrega</strong>
                            </div>
                            {dir ? (
                              <div className="pf-pedido-dir-body">
                                <p className="pf-pedido-dir-calle">
                                  {dir.calle}
                                </p>
                                <p className="pf-pedido-dir-ciudad">
                                  {dir.ciudad}
                                  {dir.codigo_postal
                                    ? `, CP ${dir.codigo_postal}`
                                    : ""}
                                </p>
                                {dir.referencias && (
                                  <p className="pf-pedido-dir-ref">
                                    📌 {dir.referencias}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="pf-pedido-dir-na">
                                Sin dirección registrada
                              </p>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="pf-pedido-footer">
                            <div className="pf-pedido-total">
                              Total:{" "}
                              <strong>
                                ${(pedido.total || 0).toLocaleString()}
                              </strong>
                            </div>
                            <div
                              className="pf-pedido-pago"
                              style={{
                                color:
                                  pedido.pago?.estado === "pagado"
                                    ? "#27ae60"
                                    : "#f39c12",
                              }}
                            >
                              💳{" "}
                              {pedido.pago?.estado === "pagado"
                                ? "Pagado"
                                : "Pendiente"}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── MODAL: agregar / editar dirección ── */}
      <AnimatePresence>
        {(modal?.type === "add" || modal?.type === "edit") && (
          <motion.div
            className="pf-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="pf-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pf-modal-head">
                <h3 className="pf-modal-title">
                  {modal.type === "add" ? (
                    <>
                      Nueva <em>dirección</em>
                    </>
                  ) : (
                    <>
                      Editar <em>dirección</em>
                    </>
                  )}
                </h3>
                <button className="pf-modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>
              <div className="pf-form-grid">
                <div className="pf-field pf-form-full">
                  <label>Etiqueta</label>
                  <select
                    value={form.etiqueta}
                    onChange={(e) =>
                      setForm({ ...form, etiqueta: e.target.value })
                    }
                  >
                    <option>Hogar</option>
                    <option>Trabajo</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="pf-field pf-form-full">
                  <label>Calle y número</label>
                  <input
                    placeholder="Av. Reforma 100, Col. Centro"
                    value={form.calle}
                    onChange={(e) =>
                      setForm({ ...form, calle: e.target.value })
                    }
                  />
                </div>
                <div className="pf-field">
                  <label>Ciudad</label>
                  <input
                    placeholder="Ciudad de México"
                    value={form.ciudad}
                    onChange={(e) =>
                      setForm({ ...form, ciudad: e.target.value })
                    }
                  />
                </div>
                <div className="pf-field">
                  <label>Código Postal</label>
                  <input
                    placeholder="06600"
                    value={form.codigo_postal}
                    onChange={(e) =>
                      setForm({ ...form, codigo_postal: e.target.value })
                    }
                  />
                </div>
                <div className="pf-field pf-form-full">
                  <label>Referencias</label>
                  <input
                    placeholder="Color de fachada, número de dpto…"
                    value={form.referencias}
                    onChange={(e) =>
                      setForm({ ...form, referencias: e.target.value })
                    }
                  />
                </div>
                <div className="pf-form-full">
                  <label className="pf-checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.es_principal}
                      onChange={(e) =>
                        setForm({ ...form, es_principal: e.target.checked })
                      }
                    />
                    Establecer como dirección principal
                  </label>
                </div>
              </div>
              <div className="pf-modal-footer">
                <button className="pf-btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="pf-btn-save"
                  onClick={handleSave}
                >
                  {modal.type === "add"
                    ? "Agregar dirección"
                    : "Guardar cambios"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: editar perfil ── */}
      <AnimatePresence>
        {modal?.type === "editProfile" && (
          <motion.div
            className="pf-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="pf-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pf-modal-head">
                <h3 className="pf-modal-title">
                  Editar <em>información</em>
                </h3>
                <button className="pf-modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>
              <div className="pf-form-grid">
                <div className="pf-field pf-form-full">
                  <label>Nombre completo</label>
                  <input
                    placeholder="Tu nombre"
                    value={profileForm.nombre}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="pf-field pf-form-full">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={profileForm.email}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      // Evitar que se borre completamente el email
                      if (newEmail.trim() === "" && authUser?.email) {
                        showToast(" No puedes dejar el email vacío");
                        return;
                      }
                      setProfileForm({ ...profileForm, email: newEmail });
                    }}
                    required
                  />
                  {authUser?.email && profileForm.email !== authUser.email && (
                    <small
                      style={{
                        color: "#f39c12",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                        display: "block",
                      }}
                    >
                       Cambiar tu email requerirá verificación
                    </small>
                  )}
                </div>
              </div>
              <div className="pf-modal-footer">
                <button className="pf-btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="pf-btn-save"
                  onClick={handleSaveProfile}
                >
                  <IconSave /> Guardar cambios
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: eliminar dirección ── */}
      <AnimatePresence>
        {modal?.type === "delete" && (
          <motion.div
            className="pf-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="pf-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pf-confirm-body">
                <div className="pf-confirm-icon">🗑️</div>
                <h3>¿Eliminar dirección?</h3>
                <p>
                  Se eliminará <strong>{modal.data.etiqueta}</strong> —{" "}
                  {modal.data.calle}. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="pf-modal-footer">
                <button className="pf-btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="pf-btn-danger"
                  onClick={handleDelete}
                >
                  Sí, eliminar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="pf-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
