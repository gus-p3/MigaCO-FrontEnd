import { Link } from "react-router-dom";
import "./Error500.css";

export default function Error500() {
  return (
    <section className="error500-page">
      <div className="error500-glow" aria-hidden="true" />

      <div className="error500-card">
        <p className="error500-eyebrow">Miga-Co</p>
        <h1 className="error500-code">500</h1>
        <h2 className="error500-title">Ocurrio un error interno</h2>
        <p className="error500-text">
          Algo fallo en el servidor y no pudimos completar esta accion.
          Puedes volver al inicio e intentarlo de nuevo en unos segundos.
        </p>

        <Link to="/" className="error500-button">
          Ir al inicio
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </section>
  );
}
