import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  Navigate, 
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/features/auth/Login';
import Register from './components/features/auth/Register';
import ProtectedRoute from './components/features/auth/ProtectedRoute';
import MesasList from './components/features/mesas/MesasList';
import ProductosList from './components/features/productos/ProductosList';
import CrearOrden from './components/features/ordenes/CrearOrden';
import OrdenesList from './components/features/ordenes/OrdenesList';
import Dashboard from './components/features/Dashboard';
import OrdenDetalles from './components/features/ordenes/OrdenDetalles';
import OrdenesAdmin from './components/features/ordenes/OrdenesAdmin';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation(); // Obtiene la ruta actual
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => pathname === path ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Taquería App</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/mesas"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/mesas')}`}
                >
                  Mesas
                </Link>
                <Link
                  to="/productos"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/productos')}`}
                >
                  Productos
                </Link>
                {user?.rol === 'admin' ? (
                  <Link
                    to="/admin/ordenes"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/admin/ordenes')}`}
                  >
                    Administrar Órdenes
                  </Link>
                ) : (
                  <Link
                    to="/ordenes"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/ordenes')}`}
                  >
                    Órdenes
                  </Link>
                )}
                {user?.rol === 'admin' && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/admin')}`}
                  >
                    Administración
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <span className="text-gray-700 mr-4">{user?.nombre}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router
        future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/mesas"
            element={
              <ProtectedRoute>
                <Layout>
                  <MesasList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductosList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordenes"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdenesList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordenes/nueva"
            element={
              <ProtectedRoute>
                <Layout>
                  <CrearOrden />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordenes/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdenDetalles />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ordenes"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <OrdenesAdmin />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <div>Panel de Administración (Próximamente)</div>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
