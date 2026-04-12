import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sitemap.css';

export default function Sitemap() {
  const { user } = useAuth();
  const esAdministrador = user?.rol === 'admin' || user?.role === 'admin';

  return (
    <div className="sitemap-page">
      <div className="sitemap-container">
        <h1 className="sitemap-title">Mapa del Sitio</h1>
        <p className="sitemap-subtitle">Encuentra fácilmente todas las secciones de Miga-Co</p>
        
        <div className="sitemap-grid">
          <div className="sitemap-section">
            <h2>Principal</h2>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/productos">Catálogo de Productos</Link></li>
              <li><a href="#nosotros">Sobre Nosotros</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>
          
          <div className="sitemap-section">
            <h2>Mi Cuenta</h2>
            <ul>
              {user ? (
                <>
                  <li><Link to="/perfil">Mi Perfil</Link></li>
                  <li><Link to="/carrito">Carrito de Compras</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Iniciar Sesión</Link></li>
                  <li><Link to="/login">Crear Cuenta</Link></li>
                </>
              )}
            </ul>
          </div>
          
          {esAdministrador && (
            <div className="sitemap-section admin">
              <h2>Administración</h2>
              <ul>
                <li><Link to="/perfil">Dashboard</Link></li>
                <li><Link to="/admin/productos">Gestionar Productos</Link></li>
                <li><Link to="/admin/pedidos">Gestionar Pedidos</Link></li>
              </ul>
            </div>
          )}
          
          

          <div className="sitemap-section">
            <h2>Contacto</h2>
            <ul>
              <li>Av. Hidalgo 120, Centro</li>
              <li>Dolores Hidalgo, Guanajuato</li>
              <li>Tel: +52 (468) 688 0000</li>
              <li>Email: migaco@migaco.mx</li>
            </ul>
          </div>
        </div>

        
      </div>
    </div>
  );
}