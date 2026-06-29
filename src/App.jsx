import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import CatalogoPage from "./pages/CatalogoPage";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import PerfilMigaCo from "./pages/Perfil";
import AdminProductos from "./pages/AdminProductos";
import AdminPedidos from "./pages/AdminPedidos";
import Carrito from "./pages/Carrito";
import NotFound from "./pages/NotFound";
import Error500 from "./pages/Error500";
import Footer from "./components/common/Footer";
import Sitemap from "./pages/Sitemap";
import AvisoPrivacidad from "./pages/AvisoPrivacidad";
import Breadcrumb from "./components/common/Breadcrumb"; // ← Importar Breadcrumb
import "./App.css";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente Layout para manejar Footer y Breadcrumb condicional
function Layout({ children }) {
  const location = useLocation();
  
  // Rutas donde NO queremos mostrar el Footer
  const hideFooterRoutes = ['/login', '/admin'];
  const shouldHideFooter = hideFooterRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Rutas donde NO queremos mostrar el Breadcrumb
  const hideBreadcrumbRoutes = ['/login', '/', '/500'];
  const shouldHideBreadcrumb = hideBreadcrumbRoutes.some(route => 
    location.pathname === route || 
    (route !== '/' && location.pathname.startsWith(route))
  );

  return (
    <>
      {/* Breadcrumb global - visible en todas las páginas excepto las excluidas */}
      {!shouldHideBreadcrumb && (
        <div className="app-breadcrumb">
          <Breadcrumb />
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="app-content">
        {children}
      </div>
      
      {/* Footer condicional */}
      {!shouldHideFooter && <Footer />}
    </>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/productos" element={<CatalogoPage />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/privacidad" element={<AvisoPrivacidad />} />

        {/* Rutas de usuario normal */}
        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <Carrito />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilMigaCo />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administrador */}
        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminProductos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPedidos />
            </ProtectedRoute>
          }
        />

        {/* Páginas de error */}
        <Route path="/500" element={<Error500 />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <Router>
          <div className="app-wrapper">
            <Navbar />
            <main className="app-main">
              <AppRoutes />
            </main>
          </div>
        </Router>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;