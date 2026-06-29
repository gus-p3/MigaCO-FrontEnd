import { useState, useEffect, useRef } from "react";
import "./Resenas.css";

const API_URL = "http://localhost:3000/api";

export default function Resenas({ productoId }) {
  const [resenas, setResenas] = useState([]);
  const [promedio, setPromedio] = useState({ promedio: 0, total: 0 });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    usuario_id: "000000000000000000000001",
    calificacion: 5,
    comentario: "",
    foto: null
  });

  useEffect(() => {
    if (productoId) {
      cargarResenas();
      cargarPromedio();
    }
  }, [productoId]);

  const cargarResenas = async () => {
    try {
      const res = await fetch(`${API_URL}/resenas/producto/${productoId}`);
      const data = await res.json();
      setResenas(data);
    } catch (err) {
      console.error("Error cargando reseñas:", err);
    }
  };

  const cargarPromedio = async () => {
    try {
      const res = await fetch(`${API_URL}/resenas/producto/${productoId}/promedio`);
      const data = await res.json();
      setPromedio(data);
    } catch (err) {
      console.error("Error cargando promedio:", err);
    }
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, foto: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.comentario.trim()) return;
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append("usuario_id", form.usuario_id);
      formData.append("producto_id", productoId);
      formData.append("calificacion", form.calificacion);
      formData.append("comentario", form.comentario);
      if (form.foto) formData.append("foto", form.foto);

      await fetch(`${API_URL}/resenas`, {
        method: "POST",
        body: formData
      });

      setForm({ usuario_id: "000000000000000000000001", calificacion: 5, comentario: "", foto: null });
      setPreview(null);
      setMostrarForm(false);
      cargarResenas();
      cargarPromedio();
    } catch (err) {
      console.error("Error enviando reseña:", err);
    } finally {
      setCargando(false);
    }
  };

  const renderEstrellas = (n, interactivo = false) => {
    return [1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        className={`estrella ${i <= n ? "activa" : ""} ${interactivo ? "interactiva" : ""}`}
        onClick={() => interactivo && setForm(prev => ({ ...prev, calificacion: i }))}
      >
        ★
      </span>
    ));
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  return (
    <div className="resenas-container">
      <div className="resenas-header">
        <div className="resenas-titulo">
          <h3>Reseñas verificadas</h3>
          {promedio.total > 0 && (
            <div className="resenas-promedio">
              <span className="promedio-numero">{promedio.promedio.toFixed(1)}</span>
              <div className="promedio-estrellas">{renderEstrellas(Math.round(promedio.promedio))}</div>
              <span className="promedio-total">({promedio.total} reseñas)</span>
            </div>
          )}
        </div>
        <button className="btn-nueva-resena" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Cancelar" : "+ Escribir reseña"}
        </button>
      </div>

      {mostrarForm && (
        <div className="resena-form">
          <p className="form-label">Tu calificacion</p>
          <div className="form-estrellas">
            {renderEstrellas(form.calificacion, true)}
          </div>
          <textarea
            className="form-comentario"
            placeholder="Cuentanos tu experiencia con este producto..."
            value={form.comentario}
            onChange={e => setForm(prev => ({ ...prev, comentario: e.target.value }))}
            maxLength={500}
            rows={4}
          />

          <div className="form-foto-upload">
            <input
              type="file"
              ref={fileRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFoto}
              style={{ display: "none" }}
            />
            <button className="btn-subir-foto" onClick={() => fileRef.current.click()}>
              {preview ? "Cambiar foto" : "Subir foto de tu pedido"}
            </button>
            {preview && (
              <div className="foto-preview">
                <img src={preview} alt="Preview" />
                <button className="btn-quitar-foto" onClick={() => { setPreview(null); setForm(prev => ({ ...prev, foto: null })); }}>
                  Quitar foto
                </button>
              </div>
            )}
          </div>

          <button
            className="btn-enviar"
            onClick={handleSubmit}
            disabled={cargando || !form.comentario.trim()}
          >
            {cargando ? "Enviando..." : "Publicar reseña"}
          </button>
        </div>
      )}

      <div className="resenas-lista">
        {resenas.length === 0 ? (
          <p className="resenas-vacio">Aun no hay reseñas. Se el primero en opinar.</p>
        ) : (
          resenas.map(r => (
            <div key={r._id} className="resena-card">
              <div className="resena-top">
                <div className="resena-usuario">
                  <div className="usuario-avatar">
                    {r.usuario_id?.nombre?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="usuario-nombre">{r.usuario_id?.nombre || "Cliente"}</p>
                    <p className="resena-fecha">{formatFecha(r.fecha)}</p>
                  </div>
                </div>
                <div className="resena-estrellas">{renderEstrellas(r.calificacion)}</div>
              </div>
              <p className="resena-comentario">{r.comentario}</p>
              {r.foto_url && (
                <img className="resena-foto" src={r.foto_url} alt="Foto del cliente" />
              )}
              {r.verificada && <span className="resena-verificada">Compra verificada</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}