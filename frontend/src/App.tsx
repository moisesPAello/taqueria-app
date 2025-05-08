import React from 'react';
import { 
  BrowserRouter, 
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
import Dashboard from './components/features/Dashboard';
import OrdenesAdmin from './components/features/ordenes/OrdenesAdmin';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
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
                <span className="text-xl font-bold text-indigo-600">Taco Macaco</span>
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
                    Órdenes
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
                <span className="text-black font-bold mr-4">{user?.nombre}</span>  {/* CSS del tipo de usuario con el que entraste Administrador, Mesero1, Mesero2  */}
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium mr-4 ">
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
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="dashboard" />} />
          <Route path="mesas" element={
            <ProtectedRoute>
              <Layout>
                <MesasList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="productos" element={
            <ProtectedRoute>
              <Layout>
                <ProductosList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="ordenes" element={
            <ProtectedRoute>
              <Layout>
                <OrdenesAdmin />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="ordenes/nueva" element={
            <ProtectedRoute>
              <Layout>
                <CrearOrden />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="ordenes/:id" element={
            <ProtectedRoute>
              <Layout>
                <OrdenesAdmin />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="admin/ordenes" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <OrdenesAdmin />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <div>Panel de Administración (Próximamente)</div>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
