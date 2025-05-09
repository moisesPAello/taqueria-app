import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import UserManagement from './UserManagement';
import AuditLogs from './AuditLogs';
import SystemConfig from './SystemConfig';
import MenuManagement from './MenuManagement';
import MaintenanceTools from './MaintenanceTools';
import OrdenesAdmin from '../ordenes/OrdenesAdmin';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('users');
  const { user } = useAuth();

  const navigationItems = [
    { id: 'users', label: 'Usuarios', icon: '👥', description: 'Gestionar usuarios y permisos' },
    { id: 'ordenes', label: 'Órdenes', icon: '📋', description: 'Gestionar órdenes y pedidos' },
    { id: 'menu', label: 'Gestión de Menú', icon: '🍽️', description: 'Administrar productos y categorías' },
    { id: 'audit', label: 'Registros', icon: '📊', description: 'Ver historial de actividades' },
    { id: 'config', label: 'Configuración', icon: '⚙️', description: 'Configurar sistema' },
    { id: 'maintenance', label: 'Mantenimiento', icon: '🔧', description: 'Herramientas de mantenimiento' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'ordenes':
        return <OrdenesAdmin />;
      case 'audit':
        return <AuditLogs />;
      case 'config':
        return <SystemConfig />;
      case 'menu':
        return <MenuManagement />;
      case 'maintenance':
        return <MaintenanceTools />;
      default:
        return <UserManagement />;
    }
  };

  const getCurrentSection = () => {
    return navigationItems.find(item => item.id === activeSection);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="mt-2 text-gray-600">
                Bienvenido, <span className="font-semibold">{user?.nombre}</span>
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>Última sesión: {user?.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <nav className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
              </div>
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full p-4 flex items-start space-x-4 text-left transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <span className={`font-medium block ${
                      activeSection === item.id ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCurrentSection()?.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getCurrentSection()?.label}
                  </h2>
                </div>
                <p className="mt-1 text-gray-500">{getCurrentSection()?.description}</p>
              </div>
              <div className="p-6">
                {renderSection()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;