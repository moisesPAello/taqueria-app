import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordenesService } from '../../../services/api';
import { formatearHora } from '../../../utils/dateUtils';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string;
}

interface Orden {
  id: number;
  mesa_numero: number;
  mesero_nombre: string;
  estado: string;
  total: number;
  productos: Producto[];
  notas?: string;
  num_personas: number;
  fecha_creacion: string;
  fecha_cierre?: string;
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia';
}

type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

interface PagoCliente {
  cliente_numero: number;
  monto: number;
  metodo_pago?: MetodoPago;
}

const OrdenDetalles: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPagoCompletoModal, setShowPagoCompletoModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [notas, setNotas] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pagosDivididos, setPagosDivididos] = useState<PagoCliente[]>([]);
  const [modoPagoDividido, setModoPagoDividido] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const cargarOrden = async () => {
      try {
        setLoading(true);
        const ordenData = await ordenesService.getById(Number(id));
        setOrden(ordenData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los detalles de la orden');
        console.error('Error al cargar orden:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarOrden();
    }
  }, [id]);

  const mostrarNotificacion = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const validarOrden = () => {
    if (!orden || orden.productos.length === 0) {
      mostrarNotificacion('error', 'No se puede procesar una orden vacía');
      return false;
    }

    if (orden.estado !== 'activa') {
      mostrarNotificacion('error', 'Esta orden ya no está activa');
      return false;
    }

    return true;
  };

  const agregarCliente = () => {
    setPagosDivididos(prev => [...prev, { cliente_numero: prev.length + 1, monto: 0 }]);
  };

  const eliminarCliente = (index: number) => {
    setPagosDivididos(prev => prev.filter((_, i) => i !== index));
  };

  const actualizarMontoPago = (index: number, monto: number) => {
    setPagosDivididos(prev => 
      prev.map((pago, i) => 
        i === index ? { ...pago, monto } : pago
      )
    );
  };

  const validarPagosDivididos = () => {
    if (!modoPagoDividido || !orden) return true;

    const totalPagos = pagosDivididos.reduce((sum, pago) => sum + pago.monto, 0);
    return Math.abs(totalPagos - orden.total) <= 0.01; // Permitir diferencia de 1 centavo por redondeo
  };

  const handlePagar = async () => {
    if (!validarOrden()) return;

    if (modoPagoDividido && !validarPagosDivididos()) {
      mostrarNotificacion('error', 'La suma de los pagos debe ser igual al total de la orden');
      return;
    }

    try {
      setLoading(true);
      await ordenesService.pagar(Number(id), {
        metodo_pago: metodoPago,
        notas: notas.trim() || undefined,
        pagos_divididos: modoPagoDividido ? pagosDivididos : undefined
      });
      mostrarNotificacion('success', 'Orden pagada exitosamente');
      setShowPagoCompletoModal(false);
      setTimeout(() => {
        navigate('/mesas');
      }, 1500);
    } catch (err) {
      mostrarNotificacion('error', 'Error al procesar el pago');
      console.error('Error al pagar orden:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProducto = (productoId: number) => {
    if (!modoPagoDividido) return;
    
    setProductosSeleccionados(prev => ({
      ...prev,
      [productoId]: !prev[productoId]
    }));
  };

  const calcularTotalSeleccionado = () => {
    if (!orden || !modoPagoDividido) return orden?.total || 0;
    
    return orden.productos
      .filter(p => productosSeleccionados[p.id])
      .reduce((total, p) => total + (p.precio * p.cantidad), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'No se encontró la orden'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Volver
        </button>
      </div>
    );
  }

  const hora = formatearHora(orden.fecha_creacion);

  const limpiarEstadosPago = () => {
    setMetodoPago('efectivo');
    setNotas('');
    setPagosDivididos([]);
    setModoPagoDividido(false);
    setProductosSeleccionados({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {notification && (
        <div className={`mb-4 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orden #{orden.id}</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/mesas')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Volver a Mesas
          </button>
          {orden.estado === 'activa' && (
            <button
              onClick={() => setShowPagoCompletoModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              disabled={orden.productos.length === 0}
            >
              Pagar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Información General</h2>
            <div className="space-y-3">
              <p className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${
                  orden.estado === 'pagada' ? 'text-green-600' :
                  orden.estado === 'activa' ? 'text-blue-600' :
                  orden.estado === 'cancelada' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Mesa:</span>
                <span className="font-medium">{orden.mesa_numero}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Mesero:</span>
                <span className="font-medium">{orden.mesero_nombre}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium">{hora}</span>
              </p>
              {orden.estado === 'pagada' && (
                <>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Método de pago:</span>
                    <span className="font-medium">{orden.metodo_pago}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Fecha de pago:</span>
                    <span className="font-medium">{formatearHora(orden.fecha_cierre || '')}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Productos</h2>
          <div className="divide-y divide-gray-200">
            {orden.productos.map((producto) => (
              <div 
                key={producto.id} 
                className={`py-4 first:pt-0 last:pb-0 ${
                  modoPagoDividido ? 'cursor-pointer hover:bg-gray-50' : ''
                } ${productosSeleccionados[producto.id] ? 'bg-indigo-50' : ''}`}
                onClick={() => handleToggleProducto(producto.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{producto.nombre}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>Cantidad: {producto.cantidad}</span>
                      <span className="mx-2">•</span>
                      <span>${producto.precio.toFixed(2)} c/u</span>
                    </div>
                    {producto.notas && (
                      <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                        {producto.notas}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-lg text-indigo-600">
                    ${(producto.precio * producto.cantidad).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${orden.total.toFixed(2)}</span>
              </div>
              {orden.num_personas > 1 && (
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Por persona ({orden.num_personas}):</span>
                  <span>${(orden.total / orden.num_personas).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${modoPagoDividido ? calcularTotalSeleccionado().toFixed(2) : orden.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {showPagoCompletoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Procesar Pago</h3>
            
            <div className="space-y-4">
              {/* Toggle para pago dividido */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">¿Cómo deseas dividir la cuenta?</span>
                <select
                  value={modoPagoDividido ? 'dividido' : 'completo'}
                  onChange={(e) => {
                    const isDividido = e.target.value === 'dividido';
                    setModoPagoDividido(isDividido);
                    if (isDividido) {
                      setPagosDivididos([{ cliente_numero: 1, monto: orden?.total || 0 }]);
                    } else {
                      setPagosDivididos([]);
                      setProductosSeleccionados({});
                    }
                  }}
                  className="block w-48 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="completo">Pago completo</option>
                  <option value="dividido">Dividir por personas</option>
                </select>
              </div>

              {/* Formulario de pagos divididos */}
              {modoPagoDividido && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Pagos por cliente</h4>
                    <button
                      type="button"
                      onClick={agregarCliente}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      + Agregar cliente
                    </button>
                  </div>

                  {pagosDivididos.map((pago, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Cliente {pago.cliente_numero}</span>
                        {index > 0 && (
                          <button
                            onClick={() => eliminarCliente(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Monto a pagar</label>
                        <input
                          type="number"
                          value={pago.monto || ''}
                          onChange={(e) => actualizarMontoPago(index, parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Método de pago</label>
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
                  ))}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total pagos:</span>
                    <span className={`font-medium ${
                      validarPagosDivididos() ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${pagosDivididos.reduce((sum, p) => sum + p.monto, 0).toFixed(2)} / ${orden?.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {!modoPagoDividido && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
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

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-bold">Total a pagar:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${orden.total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPagoCompletoModal(false);
                    limpiarEstadosPago();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePagar}
                  disabled={loading || (modoPagoDividido && !validarPagosDivididos())}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenDetalles;