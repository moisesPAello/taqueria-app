import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenesService } from '../../../services/api';
import type { OrdenResponse } from '../../../types';
import { formatearHora } from '../../../utils/dateUtils';

const OrdenesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenResponse[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);

      const data = await ordenesService.getAll(params);
      setOrdenes(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, [filtroEstado, fechaInicio, fechaFin]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'cerrada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetodoPagoLabel = (metodo?: string) => {
    switch (metodo) {
      case 'efectivo':
        return 'Efectivo';
      case 'tarjeta':
        return 'Tarjeta';
      case 'transferencia':
        return 'Transferencia';
      default:
        return 'No pagado';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Órdenes</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              <option value="activa">Activas</option>
              <option value="cerrada">Cerradas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Cierre
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No hay órdenes que mostrar
                  </td>
                </tr>
              ) : (
                ordenes.map((orden) => (
                  <tr
                    key={orden.id}
                    onClick={() => navigate(`/ordenes/${orden.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{orden.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.mesa.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                        {orden.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${orden.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.mesero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getMetodoPagoLabel(orden.metodo_pago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.hora}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.fecha_cierre || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdenesAdmin;