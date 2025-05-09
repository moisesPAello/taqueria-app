import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import UserManagement from './UserManagement';
import AuditLogs from './AuditLogs';
import SystemConfig from './SystemConfig';
import MenuManagement from './MenuManagement';
import MaintenanceTools from './MaintenanceTools';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('users');
  const { user } = useAuth();

  const navigationItems = [
    { id: 'users', label: 'Usuarios', icon: '👥' },
    { id: 'audit', label: 'Registros de Actividad', icon: '📋' },
    { id: 'config', label: 'Configuración', icon: '⚙️' },
    { id: 'menu', label: 'Gestión de Menú', icon: '🍽️' },
    { id: 'maintenance', label: 'Mantenimiento', icon: '🔧' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-2 text-gray-600">Bienvenido, {user?.nombre}</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <nav className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full px-4 py-3 flex items-center space-x-3 text-left ${
                  activeSection === item.id
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg shadow p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;