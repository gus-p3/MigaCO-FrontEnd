import { useState, useEffect } from "react";
import "./ChatButton.css";

const WHATSAPP_NUMBER = "524151775265";
const WHATSAPP_MSG = encodeURIComponent("Hola! Tengo una pregunta sobre un producto de Miga Co.");
const API_URL = "http://localhost:3000/api";

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [mensajes, setMensajes] = useState([
    { de: "bot", texto: "Hola! Soy el asistente de Miga Co. En que te puedo ayudar?" }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/productos`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(() => setProductos([]));
  }, []);

  const buildSystemPrompt = () => {
    const inventario = productos.length > 0
      ? productos.map(p =>
          `- ${p.nombre} | Categoria: ${p.categoria} | Precio: $${p.precio} | Stock centro: ${p.stock?.sucursal_centro ?? 0} | Stock norte: ${p.stock?.sucursal_norte ?? 0} | Tags: ${p.tags?.join(", ")}`
        ).join("\n")
      : "No hay productos disponibles por el momento.";

    return `Eres el asistente virtual de "Miga Co.", una reposteria online mexicana.
Responde siempre en español, de forma amable, breve y profesional.
Si no puedes resolver algo, sugiere hablar con un asesor por WhatsApp.

POLITICAS:
- Reembolsos: dentro de las 24hrs despues de recibir el pedido
- Entregas: 2 a 4 horas dependiendo la zona
- Pagos: tarjeta debito/credito, transferencia y pago contra entrega

INVENTARIO ACTUAL:
${inventario}`;
  };

  const enviar = async () => {
    if (!input.trim() || cargando) return;

    const pregunta = input;
    setInput("");
    setMensajes(prev => [...prev, { de: "user", texto: pregunta }]);
    setCargando(true);

    try {
      const historial = mensajes.map(m => ({
        role: m.de === "user" ? "user" : "assistant",
        content: m.texto
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: buildSystemPrompt(),
          messages: [...historial, { role: "user", content: pregunta }]
        })
      });

      const data = await response.json();
      const respuesta = data.content[0].text;
      setMensajes(prev => [...prev, { de: "bot", texto: respuesta }]);
    } catch (error) {
      setMensajes(prev => [...prev, {
        de: "bot",
        texto: "Hubo un error. Por favor contacta a un asesor por WhatsApp."
      }]);
    } finally {
      setCargando(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") enviar();
  };

  return (
    <>
      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <span>Asistente Miga Co.</span>
            <button onClick={() => setOpen(false)}>X</button>
          </div>
          <div className="chat-mensajes">
            {mensajes.map((m, i) => (
              <div key={i} className={`chat-mensaje ${m.de}`}>
                {m.texto}
              </div>
            ))}
            {cargando && (
              <div className="chat-mensaje bot">Escribiendo...</div>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={cargando}
            />
            <button onClick={enviar} disabled={cargando}>Enviar</button>
          </div>
          <a
            className="chat-whatsapp"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noreferrer"
          >
            Hablar con un asesor en WhatsApp
          </a>
        </div>
      )}

      <button
        className={`chat-btn ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Abrir chat"
      >
        <span className="chat-btn__icon">{open ? "X" : "Chat"}</span>
        <span className="chat-btn__label">{open ? "Cerrar" : "Hablemos"}</span>
      </button>
    </>
  );
}