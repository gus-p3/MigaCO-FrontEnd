import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const STATS = [
  { num: '+200', label: 'Diseños únicos' },
  { num: '5★',   label: 'Calificación promedio' },
  { num: '8+',   label: 'Años endulzando vidas' },
];

const ABOUT_ITEMS = [
  {
    icon: '✦',
    title: 'Repostería artesanal',
    desc: 'Cada pieza es elaborada a mano con ingredientes frescos y de temporada, sin conservadores artificiales.',
  },
  {
    icon: '✦',
    title: 'Personalización total',
    desc: 'Diseña tu pastel desde cero: sabor, relleno, cobertura y decoración adaptados a tu celebración.',
  },
  {
    icon: '✦',
    title: 'Envío a domicilio',
    desc: 'Entregamos en Dolores Hidalgo C.I.N y zona norte de Guanajuato con empaque especial para transporte.',
  },
];

const CONTACT_ITEMS = [
  {
    icon: '📍',
    label: 'Sucursal Centro',
    value: 'Av. Hidalgo 120, Col. Centro\nDolores Hidalgo C.I.N, Gto.',
    link: null,
  },
  {
    icon: '📞',
    label: 'Teléfono',
    value: '+52 (468) 688 0000',
    link: 'tel:+524686880000',
  },
  {
    icon: '✉️',
    label: 'Email',
    value: 'migaco@migaco.mx',
    link: 'mailto:migaco@migaco.mx',
  },
  {
    icon: '⏰',
    label: 'Horario',
    value: 'Lun – Sáb: 9:00 – 20:00\nDom: 10:00 – 16:00',
    link: null,
  },
];

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/migaco'},
  { label: 'Facebook', href: 'https://facebook.com/migaco'},
  { label: 'WhatsApp', href: 'https://wa.me/524686880000'},
];

// Stats para administradores
const ADMIN_STATS = [
  { num: '24', label: 'Pedidos este mes', trend: '+12%' },
  { num: '156', label: 'Clientes activos', trend: '+8%' },
  { num: '$45.2k', label: 'Ingresos mensuales', trend: '+15%' },
  { num: '8', label: 'Pedidos pendientes', trend: 'urgente' },
];



export default function Hero() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  
  const esAdministrador = user?.rol === 'admin' || user?.role === 'admin';
  const nombreUsuario = user?.nombre?.split(' ')[0] || '';

  // Determinar qué CTA mostrar
  const getHeroCTA = () => {
    if (esAdministrador) {
      return {
        text: 'Ir al Panel de Administración',
        link: '/admin/productos'
      };
    }
    return {
      text: 'Explorar pasteles',
      link: '/productos',
      icon: '→'
    };
  };

  const cta = getHeroCTA();

  return (
    <>
      {/* ── SECCIÓN 1: HERO ── */}
      <section className="hero-section">
        <div className="deco-circle" style={{ width: 300, height: 300, top: '10%', left: '35%', opacity: 0.4 }} />
        <div className="deco-circle" style={{ width: 180, height: 180, top: '60%', left: '42%', opacity: 0.25 }} />

        <div className="hero-left">
          {/* Badge de administrador si corresponde */}
          {esAdministrador && (
            <div className="hero-admin-badge">
              <span className="admin-icon"> </span>
              <span>Panel de Administración</span>
            </div>
          )}
          
          <p className="hero-eyebrow">
            {esAdministrador 
              ? `¡Bienvenido de vuelta${nombreUsuario ? `, ${nombreUsuario}` : ''}!` 
              : 'Repostería Miga-Co'
            }
          </p>

          <h1 className="hero-title fade-in-delay">
            {esAdministrador ? (
              <>
                Panel de<br />
                <em>Control</em>
                <span className="outlined">Admin</span>
              </>
            ) : (
              <>
                Aquí,<br />
                <em>el amor</em>
                <span className="outlined">nunca</span>
                sobra
              </>
            )}
          </h1>

          <p className="hero-desc fade-in-delay2">
            {esAdministrador 
              ? 'Gestiona productos, pedidos y usuarios desde un solo lugar.'
              : <>Queremos ser el invitado especial<br />de todas tus celebraciones.</>
            }
          </p>

          <a href={cta.link} className="hero-cta fade-in-delay2">
            {cta.text} {cta.icon}
          </a>

          {/* Stats dinámicos según rol */}
          <div className="hero-stats">
            {esAdministrador ? (
              // Stats para administrador
              ADMIN_STATS.slice(0, 3).map(s => (
                <div className="hero-stat admin-stat" key={s.label}>
                  <div className="stat-header">
                    <span className="stat-icon">{s.icon}</span>
                    <strong>{s.num}</strong>
                  </div>
                  <span className="stat-label">{s.label}</span>
                  {s.trend && (
                    <span className={`stat-trend ${s.trend === 'urgente' ? 'urgent' : 'positive'}`}>
                      {s.trend}
                    </span>
                  )}
                </div>
              ))
            ) : (
              // Stats para cliente
              STATS.map(s => (
                <div className="hero-stat" key={s.label}>
                  <strong>{s.num}</strong>
                  <span>{s.label}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hero-right">
          <div className="scene">
            <div className="cake-3d">
              <div className="orbit orb1">
                <div className="dot" /><div className="dot" />
              </div>
              <div className="orbit orb2">
                <div className="dot" /><div className="dot" />
              </div>
              <div className="img-frame">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80"
                  alt={esAdministrador ? "Panel de Administración Miga-Co" : "Pastel de Miga-Co"}
                />
              </div>
              <div className="shadow-ground" />
            </div>
            <div className="petal" /><div className="petal" /><div className="petal" />
          </div>
          <div className="hero-img-badge">
            <strong>{esAdministrador ? 'Admin' : '+200'}</strong>
            <span>{esAdministrador ? 'Panel de Control' : 'Diseños únicos'}</span>
          </div>
        </div>
      </section>

      

      {/* ── SECCIÓN 2: SOBRE NOSOTROS ── */}
      <section className="about-section" id="nosotros">
        <div className="about-inner">
          <div className="about-header">
            <p className="section-eyebrow">
              {esAdministrador ? 'Panel de Control' : 'Nuestra historia'}
            </p>
            <h2 className="section-title">
              {esAdministrador ? (
                <>Gestión <em>centralizada</em></>
              ) : (
                <>Más que pasteles,<br /><em>memorias dulces</em></>
              )}
            </h2>
            <p className="section-lead">
              {esAdministrador ? (
                'Administra todos los aspectos de Miga-Co desde un solo lugar. ' +
                'Gestiona el catálogo de productos, supervisa pedidos en tiempo real ' +
                'y mantén el control total de tu negocio de repostería.'
              ) : (
                'Fundada en Dolores Hidalgo C.I.N, Miga-Co nació de la pasión de una familia ' +
                'guanajuatense por el arte de la repostería. Cada pieza que creamos lleva ' +
                'consigo la calidez de nuestra cocina y el cariño de quienes nos eligieron.'
              )}
            </p>
          </div>

          <div className="about-cards">
            {esAdministrador ? (
              // Tarjetas de funcionalidades admin
              [
                {
                  icon: '📊',
                  title: 'Dashboard Analytics',
                  desc: 'Visualiza métricas clave, tendencias de ventas y comportamiento de clientes en tiempo real.',
                },
                {
                  icon: '🎂',
                  title: 'Gestor de Productos',
                  desc: 'Añade, edita o elimina productos del catálogo. Gestiona precios, descripciones e imágenes.',
                },
                {
                  icon: '📦',
                  title: 'Control de Pedidos',
                  desc: 'Monitorea todos los pedidos, actualiza estados y coordina entregas de manera eficiente.',
                },
              ].map(item => (
                <div className="about-card admin-card" key={item.title}>
                  <div className="about-card-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))
            ) : (
              // Tarjetas normales para clientes
              ABOUT_ITEMS.map(item => (
                <div className="about-card" key={item.title}>
                  <div className="about-card-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))
            )}
          </div>

          <div className="about-visual">
            <div className="about-img-wrap">
              <img
                src={esAdministrador 
                  ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80"
                  : "https://aprende.com/wp-content/uploads/2021/10/test.jpg"
                }
                alt={esAdministrador ? "Dashboard Miga-Co" : "Cocina Miga-Co"}
              />
              <div className="about-img-tag">
                <span>{esAdministrador ? '✦' : '✦'}</span> 
                {esAdministrador ? 'Control total de tu negocio' : 'Hecho con amor desde 2016'}
              </div>
            </div>
            <div className="about-quote">
              <blockquote>
                {esAdministrador 
                  ? '"El panel de administración te permite gestionar cada aspecto de Miga-Co de manera intuitiva y eficiente. Todo lo que necesitas en un solo lugar."'
                  : '"Creemos que cada celebración merece un pastel que sea tan especial como el momento que lo rodea. Por eso no usamos moldes predefinidos — cada pedido es una obra nueva."'
                }
              </blockquote>
              <cite>
                {esAdministrador 
                  ? '— Panel de Administración v1.0'
                  : '— Familia ------, fundadores de Miga-Co'
                }
              </cite>

              <div className="about-badges">
                {esAdministrador ? (
                  <>
                    <div className="about-badge admin-badge">
                      <strong>24/7</strong>
                      <span>Acceso garantizado</span>
                    </div>
                    <div className="about-badge admin-badge">
                      <strong>100%</strong>
                      <span>Seguro</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="about-badge">
                      <strong>100%</strong>
                      <span>Ingredientes naturales</span>
                    </div>
                    <div className="about-badge">
                      <strong>48h</strong>
                      <span>Tiempo de entrega</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: CONTACTO ── */}
      <section className="contact-section" id="contacto">
        <div className="contact-inner">
          <div className="contact-header">
            <p className="section-eyebrow">
              {esAdministrador ? 'Soporte Técnico' : 'Encuéntranos'}
            </p>
            <h2 className="section-title">
              {esAdministrador ? (
                <>¿Necesitas <em>ayuda</em>?</>
              ) : (
                <>Siempre listos<br /><em>para ti</em></>
              )}
            </h2>
          </div>

          <div className="contact-info-only">
            {esAdministrador ? (
              // Información de contacto para admin
              [
                {
                  icon: '📧',
                  label: 'Soporte Técnico',
                  value: 'soporte@migaco.mx',
                  link: 'mailto:soporte@migaco.mx'
                },
                
                {
                  icon: '🔄',
                  label: 'Estado del Sistema',
                  value: 'Todos los servicios operativos',
                  link: null
                },
                {
                  icon: '📞',
                  label: 'Emergencias',
                  value: '+52 (468) 688 0001',
                  link: 'tel:+524686880001'
                },
              ].map(c => (
                <div className="contact-item" key={c.label}>
                  <div className="contact-item-icon">{c.icon}</div>
                  <div>
                    <p className="contact-item-label">{c.label}</p>
                    {c.link
                      ? <a className="contact-item-val link" href={c.link}>{c.value}</a>
                      : <p className="contact-item-val">{c.value}</p>
                    }
                  </div>
                </div>
              ))
            ) : (
              // Información de contacto normal
              CONTACT_ITEMS.map(c => (
                <div className="contact-item" key={c.label}>
                  <div className="contact-item-icon">{c.icon}</div>
                  <div>
                    <p className="contact-item-label">{c.label}</p>
                    {c.link
                      ? <a className="contact-item-val link" href={c.link}>{c.value}</a>
                      : <p className="contact-item-val" style={{ whiteSpace: 'pre-line' }}>{c.value}</p>
                    }
                  </div>
                </div>
              ))
            )}

            <div className="contact-social">
              
              <div className="social-row">
                {esAdministrador ? (
                  // Recursos para admin
                  <>
                    
                    
                  </>
                ) : (
                  // Redes sociales normales
                  SOCIAL.map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                      className="social-btn" aria-label={s.label}>
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}