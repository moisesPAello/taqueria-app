import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLog {
  id: number;
  tabla: string;
  accion: string;
  usuario_id: number;
  usuario_nombre: string;
  datos_antiguos: string;
  datos_nuevos: string;
  fecha: string;
}

interface FilterState {
  tabla: string;
  accion: string;
  usuario: string;
  fechaDesde: string;
  fechaHasta: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    tabla: '',
    accion: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const acciones = [
    { id: 'crear', label: 'Crear' },
    { id: 'actualizar', label: 'Actualizar' },
    { id: 'eliminar', label: 'Eliminar' },
    { id: 'estado', label: 'Cambio de Estado' }
  ];

  const tablas = [
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'mesas', label: 'Mesas' },
    { id: 'ordenes', label: 'Órdenes' },
    { id: 'productos', label: 'Productos' },
    { id: 'configuracion', label: 'Configuración' }
  ];

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:3000/api/admin/audit-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), "d 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: es });
  };

  const renderDiff = (oldData: string, newData: string) => {
    try {
      const oldObj = JSON.parse(oldData || '{}');
      const newObj = JSON.parse(newData || '{}');
      
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="font-medium text-gray-700">Datos Anteriores</h4>
            {Object.entries(oldObj).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span>{' '}
                <span className={newObj[key] !== value ? 'bg-red-100 px-1 rounded' : ''}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-gray-700">Datos Nuevos</h4>
            {Object.entries(newObj).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span>{' '}
                <span className={oldObj[key] !== value ? 'bg-green-100 px-1 rounded' : ''}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      return (
        <div className="text-sm text-gray-500">
          Datos no disponibles en formato comparable
        </div>
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registros de Actividad</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tabla
            </label>
            <select
              value={filters.tabla}
              onChange={(e) => handleFilterChange('tabla', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas</option>
              {tablas.map(tabla => (
                <option key={tabla.id} value={tabla.id}>
                  {tabla.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción
            </label>
            <select
              value={filters.accion}
              onChange={(e) => handleFilterChange('accion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todas</option>
              {acciones.map(accion => (
                <option key={accion.id} value={accion.id}>
                  {accion.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={filters.usuario}
              onChange={(e) => handleFilterChange('usuario', e.target.value)}
              placeholder="Nombre del usuario"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Cargando registros...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron registros con los filtros seleccionados
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tabla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cambios
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearFecha(log.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.usuario_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {tablas.find(t => t.id === log.tabla)?.label || log.tabla}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.accion === 'crear' ? 'bg-green-100 text-green-800' :
                      log.accion === 'actualizar' ? 'bg-yellow-100 text-yellow-800' :
                      log.accion === 'eliminar' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {acciones.find(a => a.id === log.accion)?.label || log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {renderDiff(log.datos_antiguos, log.datos_nuevos)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;