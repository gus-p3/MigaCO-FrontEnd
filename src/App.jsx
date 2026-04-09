import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import Navbar from "./pages/Navbar";
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

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/productos" element={<CatalogoPage />} />
      <Route path="/producto/:id" element={<ProductDetail />} />

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
      <Route path="/500" element={<Error500 />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
