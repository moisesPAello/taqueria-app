import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordenesService } from '../../../services/api';
import type { OrdenResponse } from '../../../types';
import { formatearHora } from '../../../utils/dateUtils';

type SortDirection = 'asc' | 'desc';
type SortField = 'id' | 'mesa' | 'estado' | 'total' | 'mesero' | 'metodo_pago' | 'hora' | 'fecha_cierre';
type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

interface PagoCliente {
  cliente_numero: number;
  monto: number;
  metodo_pago?: MetodoPago;
}

export default function OrdenesAdmin() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>(id ? 'historial' : 'activas');
  const [ordenesActivas, setOrdenesActivas] = useState<OrdenResponse[]>([]);
  const [ordenesNoActivas, setOrdenesNoActivas] = useState<OrdenResponse[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ 
    field: 'id', 
    direction: 'desc' 
  });
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [pagosDivididos, setPagosDivididos] = useState<PagoCliente[]>([]);
  const [modoPagoDividido, setModoPagoDividido] = useState(false);
  const [notas, setNotas] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const data = await ordenesService.getAll(new URLSearchParams());
      
      setOrdenesActivas(data.filter((orden: OrdenResponse) => orden.estado === 'activa'));
      setOrdenesNoActivas(data.filter((orden: OrdenResponse) => orden.estado !== 'activa'));
      
      if (id) {
        const ordenDetalle = await ordenesService.getById(Number(id));
        setOrdenSeleccionada(ordenDetalle);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const sortOrdenes = useCallback((ordenesToSort: OrdenResponse[]) => {
    return [...ordenesToSort].sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
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
          comparison = Number(a.total) - Number(b.total);
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
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [sortConfig]);

  const filtrarOrdenes = useCallback((ordenes: OrdenResponse[]) => {
    let resultado = [...ordenes];

    if (searchTerm) {
      const termino = searchTerm.toLowerCase();
      resultado = resultado.filter(orden => 
        orden.id.toString().includes(termino) ||
        orden.mesa.numero.toString().includes(termino) ||
        orden.mesero.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }, [searchTerm]);

  useEffect(() => {
    cargarOrdenes();
  }, [id]);

  useEffect(() => {
    const ordenesActivasFiltradas = filtrarOrdenes(ordenesActivas);
    const ordenesNoActivasFiltradas = filtrarOrdenes(ordenesNoActivas);
    
    setOrdenesActivas(sortOrdenes(ordenesActivasFiltradas));
    setOrdenesNoActivas(sortOrdenes(ordenesNoActivasFiltradas));
  }, [searchTerm, sortConfig, filtrarOrdenes, sortOrdenes]);

  const handlePagar = async () => {
    if (!ordenSeleccionada) return;
    
    try {
      setLoading(true);
      await ordenesService.pagar(ordenSeleccionada.id, {
        metodo_pago: metodoPago,
        notas: notas.trim() || undefined,
        pagos_divididos: modoPagoDividido ? pagosDivididos : undefined
      });
      
      mostrarNotificacion('success', 'Orden pagada exitosamente');
      setShowPagoModal(false);
      cargarOrdenes();
    } catch (err) {
      mostrarNotificacion('error', 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!ordenSeleccionada) return;
    
    try {
      setLoading(true);
      await ordenesService.cancelar(ordenSeleccionada.id);
      mostrarNotificacion('success', 'Orden cancelada exitosamente');
      setShowCancelModal(false);
      cargarOrdenes();
    } catch (err) {
      mostrarNotificacion('error', 'Error al cancelar la orden');
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const limpiarEstadosPago = () => {
    setMetodoPago('efectivo');
    setNotas('');
    setPagosDivididos([]);
    setModoPagoDividido(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-yellow-100 text-yellow-800';
      case 'cerrada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      {/* ... existing header code ... */}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar por ID, mesa o mesero..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => setSortConfig(prev => ({ ...prev, field: e.target.value as SortField }))}
            >
              <option value="hora">Más recientes primero</option>
              <option value="id">Por ID</option>
              <option value="total">Por total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('activas')}
            className={`py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'activas'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-white hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Órdenes Activas
            {ordenesActivas.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                {ordenesActivas.length}
              </span>
            )}
          </button>
            <button
            onClick={() => setActiveTab('historial')}
            className={`py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'historial'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-white hover:text-gray-700 hover:border-gray-300'
            }`}
            >
            Historial
            </button>
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${ordenSeleccionada ? '1' : '3'}`}>
          {activeTab === 'activas' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ordenesActivas.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">No hay órdenes activas</h3>
                  <p className="mt-2 text-gray-500">Las órdenes activas aparecerán aquí.</p>
                </div>
              ) : (
                ordenesActivas.map((orden) => (
                  <div
                    key={orden.id}
                    onClick={() => navigate(`/ordenes/${orden.id}`)}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-lg font-semibold text-gray-600">Orden #{orden.id}</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">Mesa {orden.mesa.numero}</h3>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getEstadoColor(orden.estado)}`}>
                        {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Mesero:</span> {orden.mesero}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Hora:</span> {formatearHora(orden.hora)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">${Number(orden.total).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortConfig(prev => ({ 
                          field: 'id', 
                          direction: prev.field === 'id' ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                        }))}>
                      <div className="flex items-center">
                        ID
                        {sortConfig.field === 'id' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortConfig(prev => ({ 
                          field: 'mesa', 
                          direction: prev.field === 'mesa' ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                        }))}>
                      <div className="flex items-center">
                        Mesa
                        {sortConfig.field === 'mesa' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortConfig(prev => ({ 
                          field: 'estado', 
                          direction: prev.field === 'estado' ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                        }))}>
                      <div className="flex items-center">
                        Estado
                        {sortConfig.field === 'estado' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortConfig(prev => ({ 
                          field: 'total', 
                          direction: prev.field === 'total' ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                        }))}>
                      <div className="flex items-center">
                        Total
                        {sortConfig.field === 'total' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'
                            }
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortConfig(prev => ({ 
                          field: 'hora', 
                          direction: prev.field === 'hora' ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
                        }))}>
                      <div className="flex items-center">
                        Fecha
                        {sortConfig.field === 'hora' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenesNoActivas.map((orden) => (
                    <tr
                      key={orden.id}
                      onClick={() => navigate(`/ordenes/${orden.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{orden.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Mesa {orden.mesa.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                          {orden.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(orden.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearHora(orden.hora)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order details panel */}
        {ordenSeleccionada && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Orden #{ordenSeleccionada.id}</h2>
                  <p className="text-gray-600">
                    {ordenSeleccionada.mesa ? `Mesa ${ordenSeleccionada.mesa.numero}` : 'Mesa no asignada'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(ordenSeleccionada.estado)}`}>
                  {ordenSeleccionada.estado.charAt(0).toUpperCase() + ordenSeleccionada.estado.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Información</h3>
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Mesero:</span>
                        <span className="font-medium">{ordenSeleccionada.mesero || 'No asignado'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Hora:</span>
                        <span className="font-medium">{ordenSeleccionada.hora ? formatearHora(ordenSeleccionada.hora) : 'No disponible'}</span>
                      </p>
                      {ordenSeleccionada.num_personas && (
                        <p className="flex justify-between">
                          <span className="text-gray-600">Personas:</span>
                          <span className="font-medium">{ordenSeleccionada.num_personas}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {ordenSeleccionada.notas && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Notas</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{ordenSeleccionada.notas}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Productos</h3>
                  <div className="space-y-4">
                    {ordenSeleccionada.productos?.map((producto) => (
                      <div key={producto.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{producto.nombre}</p>
                          <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                          {producto.notas && (
                            <p className="text-sm text-gray-500 mt-1">{producto.notas}</p>
                          )}
                        </div>
                        <p className="font-bold">${(producto.precio * producto.cantidad).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        ${Number(ordenSeleccionada.total || 0).toFixed(2)}
                      </span>
                    </div>

                    {ordenSeleccionada.estado === 'activa' && (
                      <div className="mt-4 flex justify-end space-x-3">
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Cancelar Orden
                        </button>
                        <button
                          onClick={() => {
                            setShowPagoModal(true);
                            setPagosDivididos([{ 
                              cliente_numero: 1, 
                              monto: Number(ordenSeleccionada.total) 
                            }]);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Procesar Pago
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPagoModal && ordenSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Procesar Pago</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">¿Cómo deseas dividir la cuenta?</span>
                  <select
                    value={modoPagoDividido ? 'dividido' : 'completo'}
                    onChange={(e) => {
                      const isDividido = e.target.value === 'dividido';
                      setModoPagoDividido(isDividido);
                      if (isDividido) {
                        setPagosDivididos([{ 
                          cliente_numero: 1, 
                          monto: Number(ordenSeleccionada.total) 
                        }]);
                      } else {
                        setPagosDivididos([]);
                      }
                    }}
                    className="block rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="completo">Pago completo</option>
                    <option value="dividido">Dividir por personas</option>
                  </select>
                </div>

                {modoPagoDividido ? (
                  <div className="space-y-4 border rounded-lg p-4">
                    {pagosDivididos.map((pago, index) => (
                      <div key={index} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Cliente {pago.cliente_numero}</span>
                          {index > 0 && (
                            <button
                              onClick={() => setPagosDivididos(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Monto</label>
                            <input
                              type="number"
                              value={pago.monto}
                              onChange={(e) => {
                                const newPagos = [...pagosDivididos];
                                newPagos[index] = {
                                  ...newPagos[index],
                                  monto: Number(e.target.value) || 0
                                };
                                setPagosDivididos(newPagos);
                              }}
                              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Método</label>
                            <select
                              value={pago.metodo_pago || metodoPago}
                              onChange={(e) => {
                                const newPagos = [...pagosDivididos];
                                newPagos[index] = {
                                  ...newPagos[index],
                                  metodo_pago: e.target.value as MetodoPago
                                };
                                setPagosDivididos(newPagos);
                              }}
                              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="efectivo">Efectivo</option>
                              <option value="tarjeta">Tarjeta</option>
                              <option value="transferencia">Transferencia</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setPagosDivididos(prev => [
                        ...prev,
                        { cliente_numero: prev.length + 1, monto: 0 }
                      ])}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      + Agregar cliente
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setMetodoPago('efectivo')}
                      className={`px-4 py-2 rounded-lg border ${
                        metodoPago === 'efectivo'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Efectivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPago('tarjeta')}
                      className={`px-4 py-2 rounded-lg border ${
                        metodoPago === 'tarjeta'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Tarjeta
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPago('transferencia')}
                      className={`px-4 py-2 rounded-lg border ${
                        metodoPago === 'transferencia'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Transferencia
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    rows={3}
                    placeholder="Agregar notas al pago..."
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPagoModal(false);
                      limpiarEstadosPago();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePagar}
                    disabled={loading || (modoPagoDividido && 
                      Math.abs(pagosDivididos.reduce((sum, p) => sum + p.monto, 0) - Number(ordenSeleccionada.total)) > 0.01
                    )}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && ordenSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirmar Cancelación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas cancelar la orden #{ordenSeleccionada.id}? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}