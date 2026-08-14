import { useState, useEffect } from "react";
import "./ChatButton.css";

const WHATSAPP_NUMBER = "524151775265";
const WHATSAPP_MSG = encodeURIComponent("Hola! Tengo una pregunta sobre un producto de Miga Co.");
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
      .then(data => setProductos(Array.isArray(data) ? data : data?.productos || []))
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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No se ha configurado la API Key de Gemini");
      }

      // Historial para Gemini: roles 'user' y 'model'
      const historialFiltrado = mensajes
        .filter(m => m.texto && m.texto !== "Hola! Soy el asistente de Miga Co. En que te puedo ayudar?")
        .map(m => ({
          role: m.de === "user" ? "user" : "model",
          parts: [{ text: m.texto }]
        }));

      const contents = [
        ...historialFiltrado,
        {
          role: "user",
          parts: [{ text: pregunta }]
        }
      ];

      const modelos = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-flash-8b"];
      let respuesta = null;
      let ultimoError = null;

      for (const modelo of modelos) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: buildSystemPrompt() }]
                },
                contents: contents,
                generationConfig: {
                  maxOutputTokens: 350,
                  temperature: 0.7
                }
              })
            }
          );

          const data = await response.json();
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            respuesta = data.candidates[0].content.parts[0].text;
            break;
          } else {
            ultimoError = data?.error?.message || "Error al consultar modelo";
          }
        } catch (e) {
          ultimoError = e.message;
        }
      }

      if (!respuesta) {
        throw new Error(ultimoError || "No se pudo obtener respuesta de Gemini");
      }

      setMensajes(prev => [...prev, { de: "bot", texto: respuesta }]);
    } catch (error) {
      console.error("Error en chat:", error);
      setMensajes(prev => [...prev, {
        de: "bot",
        texto: "Hubo un error al procesar tu mensaje. Por favor contacta a un asesor por WhatsApp."
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