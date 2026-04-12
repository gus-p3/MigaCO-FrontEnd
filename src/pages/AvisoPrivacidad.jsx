import React from 'react';
import { Link } from 'react-router-dom';
import './AvisoPrivacidad.css';

export default function AvisoPrivacidad() {
  const fechaActualizacion = "11 de abril de 2026";
  const nombreEmpresa = "Miga-Co";
  const emailPrivacidad = "privacidad@migaco.mx";

  return (
    <div className="legal-page">
      <div className="legal-container">
        
        {/* Breadcrumb */}
        <div className="legal-breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="separator">/</span>
          <span className="current">Aviso de Privacidad</span>
        </div>

        {/* Header */}
        <header className="legal-header">
          <h1 className="legal-title">
            Aviso de <em>Privacidad</em>
          </h1>
          <p className="legal-subtitle">
            En Miga-Co, tu privacidad es tan importante como la calidad de nuestros pasteles
          </p>
          <div className="legal-meta">
            <span className="legal-date">Última actualización: {fechaActualizacion}</span>
            <span className="legal-version">Versión 2.0</span>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="legal-content">
          
          <section className="legal-section">
            <h2>1. Identidad y Domicilio del Responsable</h2>
            <p>
              <strong>{nombreEmpresa}</strong> (en adelante "Miga-Co"), con domicilio en 
              Av. Hidalgo 120, Colonia Centro, C.P. 37800, Dolores Hidalgo Cuna de la 
              Independencia Nacional, Guanajuato, México, es el responsable del tratamiento 
              de los datos personales que nos proporcione, los cuales serán protegidos 
              conforme a lo dispuesto por la Ley Federal de Protección de Datos Personales 
              en Posesión de los Particulares.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Datos Personales que Recabamos</h2>
            <p>Para llevar a cabo las finalidades descritas en el presente Aviso de Privacidad, podemos recabar los siguientes datos personales:</p>
            
            <div className="legal-categories">
              <div className="category-card">
                <h3>Datos de Identificación</h3>
                <ul>
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Número telefónico</li>
                </ul>
              </div>
              
              <div className="category-card">
                <h3>Datos de Ubicación</h3>
                <ul>
                  <li>Dirección de entrega</li>
                  <li>Código postal</li>
                  <li>Ciudad y estado</li>
                  <li>Referencias de ubicación</li>
                </ul>
              </div>
              
              <div className="category-card">
                <h3>Datos de Pago</h3>
                <ul>
                  <li>Información de facturación</li>
                  <li>Historial de compras</li>
                  <li>Preferencias de productos</li>
                </ul>
                <p className="note">* No almacenamos datos completos de tarjetas bancarias</p>
              </div>
            </div>
            
            <p className="legal-highlight">
              Le informamos que no recabamos datos personales sensibles.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Finalidades del Tratamiento de Datos</h2>
            
            <h3 className="subsection-title">Finalidades Primarias (Necesarias)</h3>
            <ul className="legal-list">
              <li>Procesar y entregar sus pedidos de productos de repostería</li>
              <li>Contactarle para confirmar detalles de su pedido o entrega</li>
              <li>Gestionar su registro como cliente en nuestra plataforma</li>
              <li>Proporcionar servicio al cliente y atención a quejas</li>
              <li>Facturación y comprobantes fiscales</li>
              <li>Verificar su identidad cuando sea necesario</li>
            </ul>

            <h3 className="subsection-title">Finalidades Secundarias</h3>
            <ul className="legal-list">
              <li>Enviar promociones, descuentos y novedades sobre nuestros productos</li>
              <li>Realizar encuestas de satisfacción y calidad</li>
              <li>Personalizar su experiencia de compra según sus preferencias</li>
              <li>Enviarle felicitaciones en fechas especiales</li>
              <li>Análisis estadístico y de mercado para mejorar nuestros servicios</li>
            </ul>
            
            <div className="legal-note">
              <p>
                <strong>Importante:</strong> En caso de que no desee que sus datos personales 
                sean tratados para las finalidades secundarias, puede manifestar su negativa 
                enviando un correo a <a href={`mailto:${emailPrivacidad}`}>{emailPrivacidad}</a>
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Transferencia de Datos Personales</h2>
            <p>
              Miga-Co se compromete a no transferir sus datos personales a terceros sin su 
              consentimiento, salvo las excepciones previstas en el artículo 37 de la Ley 
              Federal de Protección de Datos Personales en Posesión de los Particulares, 
              así como a realizar esta transferencia en los términos que fija esa ley.
            </p>
            
            <p>Las únicas transferencias que realizamos son:</p>
            <ul className="legal-list">
              <li>
                <strong>Servicios de mensajería y paquetería:</strong> Compartimos su nombre, 
                dirección y teléfono para la entrega de sus pedidos
              </li>
              <li>
                <strong>Procesadores de pago:</strong> Utilizamos servicios seguros de terceros 
                para procesar pagos (Stripe, PayPal, Mercado Pago)
              </li>
              <li>
                <strong>Autoridades competentes:</strong> Cuando sea requerido por ley
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Medios para Ejercer Derechos ARCO</h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué 
              los utilizamos y las condiciones del uso que les damos (<strong>Acceso</strong>). 
              Asimismo, es su derecho solicitar la corrección de su información personal en 
              caso de que esté desactualizada, sea inexacta o incompleta (<strong>Rectificación</strong>); 
              que la eliminemos de nuestros registros o bases de datos cuando considere que 
              la misma no está siendo utilizada adecuadamente (<strong>Cancelación</strong>); 
              así como oponerse al uso de sus datos personales para fines específicos 
              (<strong>Oposición</strong>). Estos derechos se conocen como derechos ARCO.
            </p>
            
            <div className="legal-contact-box">
              <h3>Para ejercer sus derechos ARCO:</h3>
              <p>Envíe un correo electrónico a: <a href={`mailto:${emailPrivacidad}`}>{emailPrivacidad}</a></p>
              <p>O escriba a: Av. Hidalgo 120, Col. Centro, C.P. 37800, Dolores Hidalgo, Gto.</p>
              <p>Horario de atención: Lunes a Viernes de 9:00 a 18:00 hrs.</p>
              <p className="legal-small">
                Su solicitud deberá contener: Nombre completo, correo electrónico registrado, 
                descripción clara de los datos sobre los que busca ejercer sus derechos ARCO, 
                y cualquier documento que acredite su identidad.
              </p>
            </div>
            
            <p>
              El tiempo de respuesta a su solicitud será de máximo 20 días hábiles contados 
              a partir de la fecha en que recibamos su solicitud completa.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Mecanismos para Revocar el Consentimiento</h2>
            <p>
              Usted puede revocar el consentimiento que, en su caso, nos haya otorgado para 
              el tratamiento de sus datos personales. Sin embargo, es importante que tenga 
              en cuenta que no en todos los casos podremos atender su solicitud o concluir 
              el uso de forma inmediata, ya que es posible que por alguna obligación legal 
              requiramos seguir tratando sus datos personales.
            </p>
            <p>
              Para revocar su consentimiento, envíe un correo a {emailPrivacidad} con el 
              asunto "Revocación de Consentimiento".
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Uso de Cookies y Tecnologías Similares</h2>
            <p>
              Nuestro sitio web utiliza cookies y tecnologías similares para mejorar su 
              experiencia de navegación. Las cookies son pequeños archivos de texto que 
              se almacenan en su dispositivo.
            </p>
            
            <div className="cookies-table">
              <div className="cookie-row header">
                <div>Tipo de Cookie</div>
                <div>Propósito</div>
                <div>Duración</div>
              </div>
              <div className="cookie-row">
                <div>Cookies Esenciales</div>
                <div>Mantener su sesión iniciada y recordar productos en carrito</div>
                <div>Sesión</div>
              </div>
              <div className="cookie-row">
                <div>Cookies de Preferencias</div>
                <div>Recordar sus preferencias de visualización</div>
                <div>1 año</div>
              </div>
              <div className="cookie-row">
                <div>Cookies Analíticas</div>
                <div>Analizar el tráfico y comportamiento en el sitio</div>
                <div>2 años</div>
              </div>
            </div>
            
            <p className="legal-small" style={{ marginTop: '1rem' }}>
              Puede configurar su navegador para rechazar todas las cookies o para que le 
              avise cuando se envía una cookie. Sin embargo, es posible que algunas 
              funciones del sitio no funcionen correctamente sin cookies.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Seguridad de los Datos</h2>
            <p>
              Miga-Co ha implementado medidas de seguridad técnicas, administrativas y 
              físicas para proteger sus datos personales contra daño, pérdida, alteración, 
              destrucción o el uso, acceso o tratamiento no autorizado.
            </p>
            <ul className="legal-list">
              <li>Cifrado SSL/TLS en todas las transmisiones de datos</li>
              <li>Acceso restringido a datos personales solo a personal autorizado</li>
              <li>Monitoreo continuo de nuestros sistemas</li>
              <li>Actualizaciones regulares de seguridad</li>
              <li>Respaldo periódico de la información</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Modificaciones al Aviso de Privacidad</h2>
            <p>
              Nos reservamos el derecho de efectuar en cualquier momento modificaciones o 
              actualizaciones al presente Aviso de Privacidad, para la atención de novedades 
              legislativas, políticas internas o nuevos requerimientos para la prestación u 
              ofrecimiento de nuestros servicios o productos.
            </p>
            <p>
              Estas modificaciones estarán disponibles al público a través de nuestra página 
              web <Link to="/privacidad">www.migaco.mx/privacidad</Link>
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Aceptación de los Términos</h2>
            <p>
              Al utilizar nuestros servicios y proporcionarnos sus datos personales, usted 
              declara haber leído, entendido y aceptado los términos expuestos en este 
              Aviso de Privacidad.
            </p>
            <p>
              Si usted no está de acuerdo con este Aviso de Privacidad, por favor no 
              proporcione información personal a través de nuestro sitio web y absténgase 
              de utilizar nuestros servicios.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contacto</h2>
            <div className="contact-info-grid">
              <div className="contact-info-item">
               
                <div>
                  <h4>Email de Privacidad</h4>
                  <a href={`mailto:${emailPrivacidad}`}>{emailPrivacidad}</a>
                </div>
              </div>
              <div className="contact-info-item">
               
                <div>
                  <h4>Teléfono</h4>
                  <a href="tel:+524686880000">+52 (468) 688 0000</a>
                </div>
              </div>
              <div className="contact-info-item">
               
                <div>
                  <h4>Domicilio</h4>
                  <p>Av. Hidalgo 120, Col. Centro<br />Dolores Hidalgo, Gto. C.P. 37800</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer del documento */}
        <footer className="legal-footer">
          <p>
            © {new Date().getFullYear()} {nombreEmpresa}. Todos los derechos reservados.
          </p>
          <p className="legal-footer-note">
            Este Aviso de Privacidad cumple con la Ley Federal de Protección de Datos 
            Personales en Posesión de los Particulares y su Reglamento.
          </p>
        </footer>

      </div>
    </div>
  );
}