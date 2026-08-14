import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import './Breadcrumb.css';

export default function Breadcrumb({ 
  productName = null, 
  categoryName = null,
  customRoutes = {} 
}) {
  const location = useLocation();
  const params = useParams();
  
  // Mapeo de rutas a nombres legibles
  const routeNames = {
    '': 'Inicio',
    'productos': 'Catálogo',
    'producto': 'Detalle de Producto',
    'carrito': 'Carrito de Compras',
    'perfil': 'Mi Perfil',
    'login': 'Iniciar Sesión',
    'admin': 'Administración',
    'pedidos': 'Mis Pedidos',
    'direcciones': 'Mis Direcciones',
    'privacidad': 'Aviso de Privacidad',
    'terminos': 'Términos y Condiciones',
    'sitemap': 'Mapa del Sitio',
  };

  // Categorías de productos
  const categoryNames = {
    'pasteles': 'Pasteles Personalizados',
    'bodas': 'Pasteles de Boda',
    'infantiles': 'Pasteles Infantiles',
    'temporada': 'Especiales de Temporada',
    'cupcakes': 'Cupcakes',
    'postres': 'Postres Individuales',
  };

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    // Siempre comenzar con Inicio
    const breadcrumbs = [
      { 
        label: '🏠 Inicio', 
        path: '/',
        isActive: pathnames.length === 0 
      }
    ];

    // Construir rutas progresivas
    let currentPath = '';
    
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Determinar el label
      let label = '';
      
      // Si es un ID de producto (24 caracteres hexadecimales)
      if (segment.match(/^[0-9a-fA-F]{24}$/)) {
        // Si tenemos nombre de producto personalizado, usarlo
        if (productName && index === pathnames.length - 1) {
          label = productName;
        } else {
          label = 'Producto';
        }
      }
      // Si es una categoría
      else if (categoryNames[segment]) {
        label = categoryNames[segment];
      }
      // Si es una ruta personalizada
      else if (customRoutes[segment]) {
        label = customRoutes[segment];
      }
      // Si está en el mapeo de rutas
      else if (routeNames[segment]) {
        label = routeNames[segment];
      }
      // Si hay nombre de categoría proporcionado
      else if (categoryName && segment === 'productos') {
        label = categoryName;
      }
      // Default: capitalizar
      else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      // No agregar rutas de ID o admin como enlaces navegables
      const isNavigable = !segment.match(/^[0-9a-fA-F]{24}$/) && 
                         !segment.includes('admin');

      breadcrumbs.push({
        label,
        path: isNavigable ? currentPath : null,
        isActive: index === pathnames.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // No mostrar breadcrumb en la página de inicio
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-wrapper">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li 
            key={index} 
            className={`breadcrumb-item ${crumb.isActive ? 'active' : ''}`}
            aria-current={crumb.isActive ? 'page' : undefined}
          >
            {crumb.isActive || !crumb.path ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="breadcrumb-link">
                {crumb.label}
              </Link>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" 
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}