import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import api from "../api/axios";
import "./Carrito.css";

// ── Métodos de pago simulados ──────────────────────────────────────────────
const METODOS_PAGO = [
  { id: "tarjeta", label: "Tarjeta de crédito / débito", icon: "💳" },
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "oxxo", label: "OXXO Pay", icon: "🏪" },
];

const detectarBrand = (numero) => {
  const n = numero.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  return "Tarjeta";
};

const formatNumero = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatFecha = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function Carrito() {
  const {
    carrito,
    loading,
    error,
    actualizarCantidad,
    eliminarItem,
    vaciarCarrito,
  } = useCarrito();
  const [validando, setValidando] = useState(false);
  const [validacion, setValidacion] = useState(null);
  const [creandoPedido, setCreandoPedido] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(null);
  const navigate = useNavigate();

  // ── Estados de pago ────────────────────────────────────────────────────
  const [modalPago, setModalPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [pasoModal, setPasoModal] = useState("direccion"); // 'direccion' | 'metodo' | 'form' | 'procesando'

  // ── Form tarjeta ───────────────────────────────────────────────────────
  const [cardForm, setCardForm] = useState({
    numero: "",
    nombre: "",
    fecha: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});

  // ── Dirección de envío ─────────────────────────────────────────────────
  const [direccionEnvio, setDireccionEnvio] = useState(null);
  const [loadingDireccion, setLoadingDireccion] = useState(false);
  // ───────────────────────────────────────────────────────────────────────

  const items = carrito?.items || [];
  const subtotal = carrito?.subtotal || 0;

  const handleValidar = async () => {
    try {
      setValidando(true);
      setValidacion(null);
      const res = await api.get("/carrito/validar");
      setValidacion(res.data);
    } catch (err) {
      setValidacion({
        valido: false,
        error: err.response?.data?.message || "Error al validar",
      });
    } finally {
      setValidando(false);
    }
  };

  // ── Abrir modal: primero carga la dirección principal ──────────────────
  const handleAbrirPago = async () => {
    setCardForm({ numero: "", nombre: "", fecha: "", cvv: "" });
    setCardErrors({});
    setPasoModal("direccion");
    setModalPago(true);

    try {
      setLoadingDireccion(true);
      const res = await api.get("/usuarios/perfil");
      const dirs = res.data?.perfil?.direcciones || [];
      const principal = dirs.find((d) => d.es_principal) || dirs[0] || null;
      setDireccionEnvio(principal);
    } catch (err) {
      setDireccionEnvio(null);
    } finally {
      setLoadingDireccion(false);
    }
  };

  const validarCard = () => {
    const errs = {};

    // Validar número (sin espacios)
    const num = cardForm.numero.replace(/\s/g, "");
    if (num.length < 16) errs.numero = "Número incompleto (16 dígitos)";

    if (!cardForm.nombre.trim()) errs.nombre = "Ingresa el nombre del titular";

    // Validar fecha (formato MMAA)
    const fecha = cardForm.fecha;
    if (fecha.length < 4) {
      errs.fecha = "Fecha incompleta (MMAA)";
    } else {
      const mm = parseInt(fecha.slice(0, 2));
      const aa = parseInt(fecha.slice(2, 4));
      const now = new Date();
      const currentYY = now.getFullYear() % 100;
      const currentMM = now.getMonth() + 1;

      if (mm < 1 || mm > 12) {
        errs.fecha = "Mes inválido (01-12)";
      } else if (aa < currentYY || (aa === currentYY && mm < currentMM)) {
        errs.fecha = "Tarjeta vencida";
      }
    }

    if (cardForm.cvv.length < 3) errs.cvv = "CVV incompleto (3-4 dígitos)";

    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleProcesarPago = async (pagarAhora) => {
    if (metodoPago === "tarjeta" && !validarCard()) return;

    try {
      setGuardandoPago(true);
      setPasoModal("procesando");

      await new Promise((r) => setTimeout(r, 2200));

      const num = cardForm.numero.replace(/\s/g, "");
      const last4 = metodoPago === "tarjeta" ? num.slice(-4) : null;
      const brand = metodoPago === "tarjeta" ? detectarBrand(num) : metodoPago;

      await api.put("/usuarios/perfil", {
        metodo_pago: {
          tipo: metodoPago === "tarjeta" ? "tarjeta" : "paypal",
          last4,
          brand,
          token_pasarela: `sim_${Date.now()}`,
        },
      });

      await handleCrearPedido(pagarAhora);
    } catch (err) {
      setValidacion({
        valido: false,
        error: err.response?.data?.message || "Error al procesar el pago",
      });
      setModalPago(false);
    } finally {
      setGuardandoPago(false);
    }
  };

  const handleCrearPedido = async (pagarAhora = false) => {
    try {
      setCreandoPedido(true);
      const itemsParaPedido = items.map((item) => ({
        producto_id: item.producto_id._id,
        cantidad: item.cantidad,
        precio_unitario:
          item.personalizacion_id?.costos?.total ?? item.precio_unitario,
        personalizacion: item.personalizacion_id
          ? {
              mensaje: item.personalizacion_id.opciones?.mensaje || "",
              relleno:
                item.personalizacion_id.opciones?.rellenos?.join(", ") || "",
            }
          : {},
      }));

      const res = await api.post("/pedidos", {
        items: itemsParaPedido,
        logistica: {
          metodo_envio: "domicilio",
          // enviar la dirección seleccionada si existe
          ...(direccionEnvio && {
            direccion_entrega: {
              calle: direccionEnvio.calle,
              ciudad: direccionEnvio.ciudad,
              codigo_postal: direccionEnvio.codigo_postal,
              referencias: direccionEnvio.referencias,
            },
          }),
        },
        pago: {
          metodo: metodoPago,
          estado: pagarAhora ? "pagado" : "pendiente",
        },
      });

      await vaciarCarrito();
      setModalPago(false);
      setPedidoExitoso(res.data);
    } catch (err) {
      setValidacion({
        valido: false,
        error: err.response?.data?.message || "Error al crear el pedido",
      });
    } finally {
      setCreandoPedido(false);
    }
  };

  // ── MODAL ─────────────────────────────────────────────────────────────
  const ModalPago = () => (
    <div
      className="pago-overlay"
      onClick={() => !guardandoPago && setModalPago(false)}
    >
      <div className="pago-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Indicador de pasos ── */}
        {pasoModal !== "procesando" && (
          <div className="pago-steps">
            {["direccion", "metodo", "form"].map((step, i) => (
              <div key={step} className="pago-step-row">
                <div
                  className={`pago-step-dot ${pasoModal === step ? "active" : ["metodo", "form"].indexOf(pasoModal) > ["metodo", "form"].indexOf(step) || (pasoModal === "form" && step === "metodo") || (pasoModal === "form" && step === "direccion") || (pasoModal === "metodo" && step === "direccion") ? "done" : ""}`}
                >
                  {(pasoModal === "metodo" && step === "direccion") ||
                  (pasoModal === "form" &&
                    (step === "direccion" || step === "metodo"))
                    ? "✓"
                    : i + 1}
                </div>
                {i < 2 && <div className="pago-step-line" />}
              </div>
            ))}
          </div>
        )}

        {/* ── PASO 1: dirección ── */}
        {pasoModal === "direccion" && (
          <>
            <div className="pago-modal-head">
              <h3 className="pago-modal-title">
                Dirección de <em>envío</em>
              </h3>
              <button
                className="pago-modal-close"
                onClick={() => setModalPago(false)}
              >
                ✕
              </button>
            </div>

            {loadingDireccion ? (
              <div className="pago-dir-loading">
                <div className="pago-spinner-sm" />
                <span>Cargando dirección...</span>
              </div>
            ) : direccionEnvio ? (
              <div className="pago-dir-card">
                <div className="pago-dir-icon">
                  {direccionEnvio.etiqueta === "Hogar"
                    ? "🏠"
                    : direccionEnvio.etiqueta === "Trabajo"
                      ? "💼"
                      : "📍"}
                </div>
                <div className="pago-dir-info">
                  <div className="pago-dir-badge">
                    {direccionEnvio.etiqueta}
                    {direccionEnvio.es_principal && (
                      <span className="pago-dir-principal">✦ Principal</span>
                    )}
                  </div>
                  <div className="pago-dir-calle">{direccionEnvio.calle}</div>
                  <div className="pago-dir-ciudad">
                    {direccionEnvio.ciudad}, CP {direccionEnvio.codigo_postal}
                  </div>
                  {direccionEnvio.referencias && (
                    <div className="pago-dir-ref">
                      📌 {direccionEnvio.referencias}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pago-dir-empty">
                <span>📭</span>
                <p>No tienes una dirección guardada.</p>
                <button
                  className="pago-dir-link"
                  onClick={() => navigate("/perfil")}
                >
                  Agregar dirección en tu perfil →
                </button>
              </div>
            )}

            <div className="pago-resumen" style={{ marginTop: "1.25rem" }}>
              <span>Total a pagar</span>
              <strong>${subtotal.toLocaleString()}</strong>
            </div>

            <button
              className="btn-pagar-ahora"
              onClick={() => setPasoModal("metodo")}
              disabled={!direccionEnvio || loadingDireccion}
            >
              Continuar →
            </button>
            {!direccionEnvio && !loadingDireccion && (
              <p className="pago-nota">
                Agrega una dirección en tu perfil para continuar
              </p>
            )}
          </>
        )}

        {/* ── PASO 2: elegir método ── */}
        {pasoModal === "metodo" && (
          <>
            <div className="pago-modal-head">
              <button
                className="pago-back-btn"
                onClick={() => setPasoModal("direccion")}
              >
                ← Volver
              </button>
              <h3 className="pago-modal-title">
                Método de <em>pago</em>
              </h3>
              <button
                className="pago-modal-close"
                onClick={() => setModalPago(false)}
              >
                ✕
              </button>
            </div>
            <p className="pago-subtitle">Selecciona cómo deseas pagar</p>
            <div className="pago-metodos">
              {METODOS_PAGO.map((m) => (
                <label
                  key={m.id}
                  className={`pago-metodo-item ${metodoPago === m.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="metodo"
                    value={m.id}
                    checked={metodoPago === m.id}
                    onChange={() => setMetodoPago(m.id)}
                  />
                  <span className="pago-metodo-icon">{m.icon}</span>
                  <span className="pago-metodo-label">{m.label}</span>
                  {metodoPago === m.id && <span className="pago-check">✦</span>}
                </label>
              ))}
            </div>
            <div className="pago-resumen">
              <span>Total a pagar</span>
              <strong>${subtotal.toLocaleString()}</strong>
            </div>
            <button
              className="btn-pagar-ahora"
              onClick={() => setPasoModal("form")}
            >
              Continuar →
            </button>
          </>
        )}

        {/* ── PASO 3: formulario ── */}
        {pasoModal === "form" && (
          <>
            <div className="pago-modal-head">
              <button
                className="pago-back-btn"
                onClick={() => setPasoModal("metodo")}
              >
                ← Volver
              </button>
              <button
                className="pago-modal-close"
                onClick={() => setModalPago(false)}
              >
                ✕
              </button>
            </div>

            {metodoPago === "tarjeta" && (
              <>
                <h3
                  className="pago-modal-title"
                  style={{ marginBottom: "1.2rem" }}
                >
                  Datos de <em>tarjeta</em>
                </h3>
                <form autoComplete="on">
                  <div className="card-preview">
                    <div className="card-chip">▬▬</div>
                    <div className="card-brand-label">
                      {detectarBrand(cardForm.numero)}
                    </div>
                    <div className="card-numero-preview">
                      {cardForm.numero.replace(/(.{4})/g, "$1 ").trim() ||
                        "•••• •••• •••• ••••"}
                    </div>
                    <div className="card-bottom-row">
                      <div>
                        <div className="card-field-label">TITULAR</div>
                        <div className="card-field-val">
                          {cardForm.nombre || "NOMBRE APELLIDO"}
                        </div>
                      </div>
                      <div>
                        <div className="card-field-label">VENCE</div>
                        <div className="card-field-val">
                          {cardForm.fecha.length === 4
                            ? `${cardForm.fecha.slice(0, 2)}/${cardForm.fecha.slice(2)}`
                            : "MM/AA"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-fields">
                    <div className="card-field-group full">
                      <label>Número de tarjeta</label>
                      <input
                        className={cardErrors.numero ? "field-error" : ""}
                        placeholder="1234 5678 9012 3456"
                        value={cardForm.numero}
                        inputMode="numeric"
                        maxLength={16}
                        autoComplete="cc-number" // ← Esto ayuda
                        name="cc-number" // ← Agregar name
                        id="cc-number" // ← Agregar id
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);
                          setCardForm({ ...cardForm, numero: value });
                        }}
                      />
                      {cardErrors.numero && (
                        <span className="field-err-msg">
                          {cardErrors.numero}
                        </span>
                      )}
                    </div>

                    <div className="card-field-group full">
                      <label>Nombre del titular</label>
                      <input
                        className={cardErrors.nombre ? "field-error" : ""}
                        placeholder="Como aparece en la tarjeta"
                        value={cardForm.nombre}
                        autoComplete="cc-name" // ← Esto ayuda
                        name="cc-name" // ← Agregar name
                        id="cc-name" // ← Agregar id
                        onChange={(e) =>
                          setCardForm({
                            ...cardForm,
                            nombre: e.target.value,
                          })
                        }
                      />
                      {cardErrors.nombre && (
                        <span className="field-err-msg">
                          {cardErrors.nombre}
                        </span>
                      )}
                    </div>

                    <div className="card-field-group half">
                      <label>Vencimiento (MMAA)</label>
                      <input
                        className={cardErrors.fecha ? "field-error" : ""}
                        placeholder="MMAA"
                        value={cardForm.fecha}
                        inputMode="numeric"
                        maxLength={4}
                        autoComplete="cc-exp" // ← Esto ayuda
                        name="cc-exp" // ← Agregar name
                        id="cc-exp" // ← Agregar id
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setCardForm({ ...cardForm, fecha: value });
                        }}
                      />
                      {cardErrors.fecha && (
                        <span className="field-err-msg">
                          {cardErrors.fecha}
                        </span>
                      )}
                    </div>

                    <div className="card-field-group half">
                      <label>CVV</label>
                      <input
                        className={cardErrors.cvv ? "field-error" : ""}
                        placeholder="123"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        autoComplete="cc-csc" // ← Esto ayuda
                        name="cc-csc" // ← Agregar name
                        id="cc-csc" // ← Agregar id
                        value={cardForm.cvv}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setCardForm({ ...cardForm, cvv: value });
                        }}
                      />
                      {cardErrors.cvv && (
                        <span className="field-err-msg">{cardErrors.cvv}</span>
                      )}
                    </div>
                  </div>
                </form>
              </>
            )}

            {metodoPago !== "tarjeta" && (
              <div className="pago-otro-info">
                <div className="pago-otro-icon">
                  {METODOS_PAGO.find((m) => m.id === metodoPago)?.icon}
                </div>
                <h3 className="pago-modal-title" style={{ margin: "0.5rem 0" }}>
                  {METODOS_PAGO.find((m) => m.id === metodoPago)?.label}
                </h3>
                <p className="pago-subtitle">
                  {metodoPago === "paypal"
                    ? "Se simulará el pago con tu cuenta PayPal registrada."
                    : "Se generará una referencia de pago para realizar en tienda OXXO."}
                </p>
              </div>
            )}

            <div className="pago-resumen" style={{ marginTop: "1.25rem" }}>
              <span>Total a pagar</span>
              <strong>${subtotal.toLocaleString()}</strong>
            </div>

            <p className="pago-pregunta">¿Cuándo deseas realizar el pago?</p>
            <div className="pago-acciones">
              <button
                className="btn-pagar-ahora"
                onClick={() => handleProcesarPago(true)}
                disabled={guardandoPago || creandoPedido}
              >
                ✦ Pagar ahora
              </button>
              <button
                className="btn-pagar-despues"
                onClick={() => handleProcesarPago(false)}
                disabled={guardandoPago || creandoPedido}
              >
                Pagar más tarde
              </button>
            </div>
            <p className="pago-nota">
              * Pago simulado — ningún cargo real será realizado.
            </p>
          </>
        )}

        {/* ── PASO 4: procesando ── */}
        {pasoModal === "procesando" && (
          <div className="pago-procesando">
            <div className="pago-spinner" />
            <h3 className="pago-modal-title">
              Procesando <em>pago</em>
            </h3>
            <p className="pago-subtitle">
              Verificando con{" "}
              {METODOS_PAGO.find((m) => m.id === metodoPago)?.label}…
            </p>
            <div className="pago-progress">
              <div className="pago-progress-bar" />
            </div>
            <p className="pago-nota">Por favor no cierres esta ventana</p>
          </div>
        )}
      </div>
    </div>
  );

  if (pedidoExitoso) {
    return (
      <div className="carrito-container">
        <div className="pedido-exitoso">
          <div className="pedido-icono">✅</div>
          <h2>¡Pedido creado con éxito!</h2>
          <p>Tu pedido ha sido registrado y está en proceso.</p>
          <p className="pedido-id">ID: {pedidoExitoso._id}</p>
          <div className="pedido-exitoso-actions">
            <button
              className="btn-ver-perfil"
              onClick={() => navigate("/perfil")}
            >
              Ver mis pedidos
            </button>
            <button
              className="btn-seguir"
              onClick={() => navigate("/productos")}
            >
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !carrito) {
    return (
      <div className="carrito-container">
        <div className="carrito-loading">Cargando carrito...</div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h1 className="carrito-titulo">Mi Carrito</h1>

      {error && <div className="carrito-error">{error}</div>}

      {items.length === 0 ? (
        <div className="carrito-vacio">
          <div className="carrito-vacio-icono">🛒</div>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos desde el catálogo para comenzar.</p>
          <button
            className="btn-ir-catalogo"
            onClick={() => navigate("/productos")}
          >
            Ir al catálogo
          </button>
        </div>
      ) : (
        <div className="carrito-contenido">
          <div className="carrito-items">
            {items.map((item) => {
              const producto = item.producto_id;
              const pers = item.personalizacion_id;
              const precioItem = pers?.costos?.total ?? item.precio_unitario;

              return (
                <div key={item._id} className="carrito-item">
                  <img
                    src={
                      producto?.multimedia?.fotos_exterior?.[0] ||
                      "https://via.placeholder.com/80?text=Producto"
                    }
                    alt={producto?.nombre}
                    className="item-imagen"
                  />
                  <div className="item-info">
                    <h4 className="item-nombre">{producto?.nombre}</h4>
                    <p className="item-precio-unit">
                      ${item.precio_unitario?.toLocaleString()} c/u
                    </p>
                    {pers && (
                      <div className="item-personalizacion">
                        {pers.opciones?.rellenos?.length > 0 && (
                          <span>
                            Relleno: {pers.opciones.rellenos.join(", ")}
                          </span>
                        )}
                        {pers.opciones?.coberturas?.length > 0 && (
                          <span>
                            Cobertura: {pers.opciones.coberturas.join(", ")}
                          </span>
                        )}
                        {pers.opciones?.mensaje && (
                          <span>Mensaje: "{pers.opciones.mensaje}"</span>
                        )}
                        <span className="item-extra">
                          +$
                          {(
                            precioItem - item.precio_unitario
                          ).toLocaleString()}{" "}
                          extras
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="item-controles">
                    <div className="cantidad-controles">
                      <button
                        className="btn-cantidad"
                        onClick={() =>
                          actualizarCantidad(item._id, item.cantidad - 1)
                        }
                        disabled={item.cantidad <= 1}
                      >
                        −
                      </button>
                      <span className="cantidad-valor">{item.cantidad}</span>
                      <button
                        className="btn-cantidad"
                        onClick={() =>
                          actualizarCantidad(item._id, item.cantidad + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="item-subtotal">
                      ${(precioItem * item.cantidad).toLocaleString()}
                    </p>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarItem(item._id)}
                      title="Eliminar producto"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="carrito-resumen">
            <h3>Resumen del pedido</h3>
            <div className="resumen-linea">
              <span>
                Productos ({items.reduce((a, i) => a + i.cantidad, 0)})
              </span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="resumen-linea resumen-total">
              <strong>Total</strong>
              <strong>${subtotal.toLocaleString()}</strong>
            </div>

            {validacion && (
              <div
                className={`validacion-resultado ${validacion.valido ? "ok" : "error"}`}
              >
                {validacion.valido ? (
                  <p>✅ Todos los productos están disponibles</p>
                ) : (
                  <>
                    <p>⚠️ Algunos productos no tienen stock suficiente:</p>
                    {validacion.items
                      ?.filter((i) => !i.disponible)
                      .map((i) => (
                        <p key={i.item_id} className="validacion-item-error">
                          {i.nombre}: pediste {i.cantidad_pedida}, disponible{" "}
                          {i.stock_disponible}
                        </p>
                      ))}
                    {validacion.error && <p>{validacion.error}</p>}
                  </>
                )}
              </div>
            )}

            <div className="resumen-acciones">
              <button
                className="btn-validar"
                onClick={handleValidar}
                disabled={validando}
              >
                {validando ? "Validando..." : "Verificar disponibilidad"}
              </button>
              <button
                className="btn-pedir"
                onClick={handleAbrirPago}
                disabled={creandoPedido || (validacion && !validacion.valido)}
              >
                {creandoPedido ? "Procesando..." : "Realizar pedido"}
              </button>
              <button className="btn-vaciar" onClick={vaciarCarrito}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {modalPago && <ModalPago />}
    </div>
  );
}
