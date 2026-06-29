import { useState } from "react";
import "./PersonalizarModal.css";
import api from "../../api/axios";

export default function PersonalizarModal({ product, onClose }) {
  const { personalizable = {} } = product;
  const {
    permite_mensaje = false,
    rellenos_disponibles = [],
    coberturas_disponibles = [],
  } = personalizable;

  const [rellenosSel, setRellenosSel] = useState([]);
  const [coberturasSel, setCoberturasSel] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");

  const COSTO_EXTRA = 35;
  const extras = (rellenosSel.length + coberturasSel.length) * COSTO_EXTRA;
  const total = Number(product.precio || 0) + extras;

  const getSessionId = () => {
    const key = "miga_session_id";
    const actual = localStorage.getItem(key);
    if (actual) return actual;

    const generado =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    localStorage.setItem(key, generado);
    return generado;
  };

  const toggleEnArreglo = (arr, valor) =>
    arr.includes(valor) ? arr.filter((v) => v !== valor) : [...arr, valor];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="pers-overlay" onClick={handleOverlayClick}>
      <div className="pers-card">
        <button className="pers-close" onClick={onClose}>
          ✕
        </button>

        <div className="pers-header">
          <span className="pers-icon">🎨</span>
          <div>
            <h3 className="pers-title">Personalizar pedido</h3>
            <p className="pers-subtitle">{product.nombre}</p>
          </div>
        </div>

        {rellenos_disponibles.length > 0 && (
          <div className="pers-section">
            <h4 className="pers-section-title">Elige tu relleno</h4>
            <div className="pers-chips">
              {rellenos_disponibles.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`pers-chip ${rellenosSel.includes(r) ? "active" : ""}`}
                  onClick={() =>
                    setRellenosSel((prev) => toggleEnArreglo(prev, r))
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {coberturas_disponibles.length > 0 && (
          <div className="pers-section">
            <h4 className="pers-section-title">Elige tu cobertura</h4>
            <div className="pers-chips">
              {coberturas_disponibles.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pers-chip ${coberturasSel.includes(c) ? "active" : ""}`}
                  onClick={() =>
                    setCoberturasSel((prev) => toggleEnArreglo(prev, c))
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {permite_mensaje && (
          <div className="pers-section">
            <h4 className="pers-section-title">Mensaje personalizado</h4>
            <textarea
              className="pers-textarea"
              placeholder="Ej: ¡Feliz cumpleaños Karen! 🎉"
              maxLength={120}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            <span className="pers-char-count">{mensaje.length}/120</span>
          </div>
        )}

        <div className="pers-resumen">
          {rellenosSel.length > 0 && (
            <p>
              🍓 <strong>Rellenos:</strong> {rellenosSel.join(", ")}
            </p>
          )}
          {coberturasSel.length > 0 && (
            <p>
              🍫 <strong>Coberturas:</strong> {coberturasSel.join(", ")}
            </p>
          )}
          {mensaje && (
            <p>
              💬 <strong>Mensaje:</strong> {mensaje}
            </p>
          )}
          <p>
            💸 <strong>Extras:</strong> ${extras.toLocaleString()} ({" "}
            {rellenosSel.length + coberturasSel.length} seleccion(es) x $35)
          </p>
          <p>
            🧾 <strong>Total estimado:</strong> ${total.toLocaleString()}
          </p>
          {errorGuardado && <p className="pers-error">{errorGuardado}</p>}
        </div>

        <div className="pers-actions">
          <button className="pers-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="pers-btn-confirmar"
            disabled={guardando}
            onClick={async () => {
              try {
                setErrorGuardado("");
                setGuardando(true);

                const payload = {
                  productoId: product._id,
                  productoNombre: product.nombre,
                  sessionId: getSessionId(),
                  rellenos: rellenosSel,
                  coberturas: coberturasSel,
                  mensaje: mensaje || "",
                };

                const response = await api.post("/personalizaciones", payload);
                localStorage.setItem(
                  "miga_ultima_personalizacion_id",
                  response.data?._id || "",
                );

                setGuardado(true);
                setTimeout(() => {
                  setGuardado(false);
                  onClose();
                }, 1200);
              } catch (error) {
                setErrorGuardado(
                  error?.response?.data?.message ||
                    "No se pudo guardar la personalización",
                );
              } finally {
                setGuardando(false);
              }
            }}
          >
            {guardando
              ? "Guardando..."
              : guardado
                ? "✅ ¡Guardado en BD!"
                : "Confirmar personalización"}
          </button>
        </div>
      </div>
    </div>
  );
}
