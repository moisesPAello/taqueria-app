import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CleanupOptions {
  olderThan: number;
  status: 'cerrada' | 'cancelada' | 'all';
}

const MaintenanceTools: React.FC = () => {
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [cleanupInProgress, setCleanupInProgress] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [cleanupOptions, setCleanupOptions] = useState<CleanupOptions>({
    olderThan: 30,
    status: 'all'
  });

  const handleBackup = async () => {
    try {
      setBackupInProgress(true);
      const response = await fetch('http://localhost:3000/api/admin/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taqueria_backup_${format(new Date(), 'yyyyMMdd_HHmmss')}.db`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('success', 'Respaldo creado exitosamente');
      } else {
        throw new Error('Error al crear respaldo');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showMessage('error', 'Error al crear el respaldo');
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setCleanupInProgress(true);
      const response = await fetch('http://localhost:3000/api/admin/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanupOptions)
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', `Limpieza completada: ${data.deletedCount} registros eliminados`);
      } else {
        throw new Error('Error en la limpieza');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      showMessage('error', 'Error al realizar la limpieza');
    } finally {
      setCleanupInProgress(false);
    }
  };

  const handleExport = async (type: 'users' | 'orders' | 'products') => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('success', 'Datos exportados exitosamente');
      } else {
        throw new Error('Error al exportar datos');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('error', 'Error al exportar los datos');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Herramientas de Mantenimiento</h2>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Backup */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Respaldo de Base de Datos</h3>
          <p className="text-gray-500 mb-4">
            Crea una copia de seguridad completa de la base de datos. El archivo se descargará automáticamente.
          </p>
          <button
            onClick={handleBackup}
            disabled={backupInProgress}
            className={`w-full px-4 py-2 ${
              backupInProgress
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white rounded-lg`}
          >
            {backupInProgress ? 'Creando respaldo...' : 'Crear Respaldo'}
          </button>
        </div>

        {/* Data Cleanup */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Limpieza de Datos</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eliminar órdenes más antiguas que
              </label>
              <select
                value={cleanupOptions.olderThan}
                onChange={(e) => setCleanupOptions({
                  ...cleanupOptions,
                  olderThan: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={30}>30 días</option>
                <option value={60}>60 días</option>
                <option value={90}>90 días</option>
                <option value={180}>6 meses</option>
                <option value={365}>1 año</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de órdenes
              </label>
              <select
                value={cleanupOptions.status}
                onChange={(e) => setCleanupOptions({
                  ...cleanupOptions,
                  status: e.target.value as CleanupOptions['status']
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas</option>
                <option value="cerrada">Solo cerradas</option>
                <option value="cancelada">Solo canceladas</option>
              </select>
            </div>
            <button
              onClick={handleCleanup}
              disabled={cleanupInProgress}
              className={`w-full px-4 py-2 ${
                cleanupInProgress
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white rounded-lg`}
            >
              {cleanupInProgress ? 'Limpiando...' : 'Iniciar Limpieza'}
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar Datos</h3>
          <p className="text-gray-500 mb-4">
            Exporta datos específicos en formato CSV para su análisis o respaldo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleExport('users')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Exportar Usuarios
            </button>
            <button
              onClick={() => handleExport('orders')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Exportar Órdenes
            </button>
            <button
              onClick={() => handleExport('products')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Exportar Productos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTools;