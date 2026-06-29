import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

export default function Footer() {
  const { user } = useAuth();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  
  const esAdministrador = user?.rol === 'admin' || user?.role === 'admin';

  // Generar breadcrumb basado en la ruta actual
  const getBreadcrumb = () => {
    const path = location.pathname;
    const paths = path.split('/').filter(p => p);
    
    const breadcrumbItems = [
      { label: 'Inicio', path: '/' }
    ];
    
    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Mapear rutas a nombres legibles
      const routeNames = {
        'productos': 'Productos',
        'producto': 'Detalle de Producto',
        'perfil': 'Mi Perfil',
        'carrito': 'Carrito de Compras',
        'admin': 'Administración',
        'sitemap': 'Mapa del Sitio',
      };
      
      const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // No mostrar IDs en el breadcrumb
      if (!segment.match(/^[0-9a-fA-F]{24}$/)) {
        breadcrumbItems.push({ label, path: currentPath });
      }
    });
    
    return breadcrumbItems;
  };

  const breadcrumb = getBreadcrumb();

  return (
    <footer className="footer">
      <div className="footer-inner">
        
        {/* Sección superior con enlaces jerárquicos */}
        <div className="footer-top">
          
          {/* Columna 1: Navegación Principal */}
          <div className="footer-column">
            <h4 className="footer-title">Navegación</h4>
            <ul className="footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/productos">Productos</Link></li>
              
            </ul>
          </div>

          {/* Columna 2: Mi Cuenta */}
          <div className="footer-column">
            <h4 className="footer-title">Mi Cuenta</h4>
            <ul className="footer-links">
              {user ? (
                <>
                  <li><Link to="/perfil">Mi Perfil</Link></li>
                  <li><Link to="/perfil">Mis Pedidos</Link></li>
                  <li><Link to="/carrito">Mi Carrito</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Iniciar Sesión</Link></li>
                  <li><Link to="/login">Crear Cuenta</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Columna 3: Panel Admin (solo visible para admins) */}
          {esAdministrador && (
            <div className="footer-column">
              <h4 className="footer-title">Panel Admin</h4>
              <ul className="footer-links">
                <li><Link to="/perfil">Dashboard</Link></li>
                <li><Link to="/admin/productos">Gestionar Productos</Link></li>
                <li><Link to="/admin/pedidos">Gestionar Pedidos</Link></li>
              </ul>
            </div>
          )}

          {/* Columna 4: Información */}
          <div className="footer-column">
            <h4 className="footer-title">Información</h4>
            <ul className="footer-links">
              <li><Link to="/sitemap">Mapa del Sitio</Link></li>
              <li><Link to="/privacidad">Aviso de Privacidad</Link></li>
              
            </ul>
          </div>

          {/* Columna 5: Contacto y Redes */}
          <div className="footer-column">
            <h4 className="footer-title">Contacto</h4>
            <ul className="footer-links">
              <li>📍 Dolores Hidalgo, Gto.</li>
              <li> +52 (468) 688 0000</li>
              <li> migaco@migaco.mx</li>
            </ul>
            
            
          </div>
        </div>

        {/* Breadcrumb / Ruta de navegación */}
        <div className="footer-breadcrumb">
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              {breadcrumb.map((item, index) => (
                <li key={index} aria-current={index === breadcrumb.length - 1 ? "page" : undefined}>
                  {index === breadcrumb.length - 1 ? (
                    item.label
                  ) : (
                    <Link to={item.path}>{item.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Sección inferior */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© {currentYear} Miga-Co. Todos los derechos reservados.</p>
            <p className="footer-tagline">Pastelería artesanal en Dolores Hidalgo, Guanajuato</p>
          </div>
          
          <div className="footer-legal">
            <Link to="/privacidad">Privacidad</Link>
            
            <span className="separator">|</span>
            <Link to="/sitemap">Mapa del Sitio</Link>
          </div>
        </div>

        {/* Sitemap jerárquico desplegable */}
        <div className="footer-sitemap-hierarchy">
          <details>
            <summary>Estructura completa del sitio</summary>
            <div className="sitemap-tree">
              <ul>
                <li>
                  <Link to="/">Inicio</Link>
                  <ul>
                    <li><Link to="/productos"> Catálogo de Productos</Link></li>
                    <li>
                      <Link to={user ? "/perfil" : "/login"}> Mi Cuenta</Link>
                      <ul>
                        {user ? (
                          <>
                            <li><Link to="/perfil">Perfil</Link></li>
                            <li><Link to="/carrito">Carrito</Link></li>
                          </>
                        ) : (
                          <li><Link to="/login">Iniciar Sesión</Link></li>
                        )}
                      </ul>
                    </li>
                    {esAdministrador && (
                      <li>
                        <Link to="/admin">Panel Administrativo</Link>
                        <ul>
                          <li><Link to="/admin/productos">Productos</Link></li>
                          <li><Link to="/admin/pedidos">Pedidos</Link></li>
                        </ul>
                      </li>
                    )}
                    <li><Link to="/sitemap">Mapa del Sitio</Link></li>
                  </ul>
                </li>
              </ul>
            </div>
          </details>
        </div>

      </div>
    </footer>
  );
}