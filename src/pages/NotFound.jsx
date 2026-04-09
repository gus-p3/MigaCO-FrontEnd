import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <section className="notfound-page">
      <div className="notfound-glow" aria-hidden="true" />

      <div className="notfound-card">
        <p className="notfound-eyebrow">Miga-Co</p>
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">La pagina que buscas no existe</h2>
        <p className="notfound-text">
          Parece que esta ruta se perdio entre sabores. Regresa al inicio para
          seguir explorando productos.
        </p>

        <Link to="/" className="notfound-button">
          Volver al inicio
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </section>
  );
}
