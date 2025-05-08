import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenesService } from '../../../services/api';
import type { OrdenResponse } from '../../../types';
import { formatearHora } from '../../../utils/dateUtils';

type SortDirection = 'asc' | 'desc';
type SortField = 'id' | 'mesa' | 'estado' | 'total' | 'mesero' | 'metodo_pago' | 'hora' | 'fecha_cierre';

const OrdenesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenResponse[]>([]);
  const [ordenesActivas, setOrdenesActivas] = useState<OrdenResponse[]>([]);
  const [ordenesNoActivas, setOrdenesNoActivas] = useState<OrdenResponse[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [filtroPago, setFiltroPago] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      if (filtroPago) params.append('metodo_pago', filtroPago);

      const data = await ordenesService.getAll(params);
      
      // Aplicar filtro de búsqueda local
      const filteredData = searchTerm
        ? data.filter((orden: OrdenResponse) =>
            orden.id.toString().includes(searchTerm) ||
            orden.mesa.numero.toString().includes(searchTerm) ||
            orden.mesero.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : data;
      
      setOrdenes(filteredData);
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
  }, [filtroEstado, fechaInicio, fechaFin, filtroPago]);

  // Aplicar búsqueda cuando cambie el término
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      cargarOrdenes();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-yellow-100 text-yellow-800';
      case 'pagada':
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortOrdenes = (ordenesToSort: OrdenResponse[]) => {
    return [...ordenesToSort].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'mesa':
          comparison = a.mesa.numero - b.mesa.numero;
          break;
        case 'estado':
          comparison = a.estado.localeCompare(b.estado);
          break;
        case 'total':
          comparison = parseFloat(a.total) - parseFloat(b.total);
          break;
        case 'mesero':
          comparison = a.mesero.localeCompare(b.mesero);
          break;
        case 'metodo_pago':
          comparison = (a.metodo_pago || '').localeCompare(b.metodo_pago || '');
          break;
        case 'hora':
          comparison = new Date(a.hora).getTime() - new Date(b.hora).getTime();
          break;
        case 'fecha_cierre':
          const aTime = a.fecha_cierre ? new Date(a.fecha_cierre).getTime() : 0;
          const bTime = b.fecha_cierre ? new Date(b.fecha_cierre).getTime() : 0;
          comparison = aTime - bTime;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  useEffect(() => {
    if (ordenes.length > 0) {
      const activas = ordenes.filter(orden => orden.estado === 'activa');
      const noActivas = ordenes.filter(orden => orden.estado !== 'activa');
      setOrdenesActivas(sortOrdenes(activas));
      setOrdenesNoActivas(sortOrdenes(noActivas));
    }
  }, [ordenes, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const renderTableHeader = (field: SortField, label: string) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <span className="text-gray-400">{renderSortIcon(field)}</span>
      </div>
    </th>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Órdenes</h1>

      {/* Panel de filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda general */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, mesa o mesero..."
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Filtro de estado */}
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
              <option value="pagada">Pagadas</option>
              <option value="cerrada">Cerradas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          {/* Filtro de método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={filtroPago}
              onChange={(e) => setFiltroPago(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {/* Fecha inicio */}
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

          {/* Fecha fin */}
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

      {/* Órdenes Activas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
          <h2 className="text-lg font-semibold text-yellow-800">Órdenes Activas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderTableHeader('id', 'ID')}
                {renderTableHeader('mesa', 'Mesa')}
                {renderTableHeader('estado', 'Estado')}
                {renderTableHeader('total', 'Total')}
                {renderTableHeader('mesero', 'Mesero')}
                {renderTableHeader('metodo_pago', 'Método de Pago')}
                {renderTableHeader('hora', 'Creación')}
                {renderTableHeader('fecha_cierre', 'Cierre')}
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
              ) : ordenesActivas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No hay órdenes activas
                  </td>
                </tr>
              ) : (
                ordenesActivas.map((orden) => (
                  <tr
                    key={orden.id}
                    onClick={() => navigate(`/ordenes/${orden.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{orden.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Mesa {orden.mesa.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                        {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${orden.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.mesero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getMetodoPagoLabel(orden.metodo_pago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearHora(orden.hora)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.fecha_cierre ? formatearHora(orden.fecha_cierre) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Órdenes No Activas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Órdenes Anteriores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderTableHeader('id', 'ID')}
                {renderTableHeader('mesa', 'Mesa')}
                {renderTableHeader('estado', 'Estado')}
                {renderTableHeader('total', 'Total')}
                {renderTableHeader('mesero', 'Mesero')}
                {renderTableHeader('metodo_pago', 'Método de Pago')}
                {renderTableHeader('hora', 'Creación')}
                {renderTableHeader('fecha_cierre', 'Cierre')}
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
              ) : ordenesNoActivas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No hay órdenes anteriores
                  </td>
                </tr>
              ) : (
                ordenesNoActivas.map((orden) => (
                  <tr
                    key={orden.id}
                    onClick={() => navigate(`/ordenes/${orden.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{orden.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Mesa {orden.mesa.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                        {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${orden.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.mesero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getMetodoPagoLabel(orden.metodo_pago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearHora(orden.hora)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orden.fecha_cierre ? formatearHora(orden.fecha_cierre) : '-'}
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