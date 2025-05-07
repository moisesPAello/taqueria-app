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
}

type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

const OrdenDetalles: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [notas, setNotas] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const cargarOrden = async () => {
      try {
        setLoading(true);
        const data = await ordenesService.getById(Number(id));
        setOrden(data);
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

  const handlePagar = async () => {
    if (!orden || orden.productos.length === 0) {
      mostrarNotificacion('error', 'No se puede pagar una orden vacía');
      return;
    }

    if (orden.estado !== 'activa') {
      mostrarNotificacion('error', 'Esta orden ya no está activa');
      return;
    }

    try {
      setLoading(true);
      await ordenesService.pagar(Number(id), {
        metodo_pago: metodoPago,
        notas: notas.trim() || undefined
      });
      mostrarNotificacion('success', 'Orden pagada exitosamente');
      setShowPagoModal(false);
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
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Volver
          </button>
          {orden.estado === 'activa' && (
            <button
              onClick={() => setShowPagoModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              disabled={orden.productos.length === 0}
            >
              Pagar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información general */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Información General</h2>
          <div className="space-y-3">
            <p className="flex justify-between">
              <span className="text-gray-600">Mesa:</span>
              <span className="font-medium">#{orden.mesa_numero}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Mesero:</span>
              <span className="font-medium">{orden.mesero_nombre || 'No asignado'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
                {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Personas:</span>
              <span className="font-medium">{orden.num_personas}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium">{hora}</span>
            </p>
            {orden.notas && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm font-medium mb-1">Notas generales:</p>
                <p className="text-sm">{orden.notas}</p>
              </div>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Productos</h2>
          <div className="divide-y divide-gray-200">
            {orden.productos.map((producto) => (
              <div key={producto.id} className="py-4 first:pt-0 last:pb-0">
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
                  ${orden.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {showPagoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Procesar Pago</h3>
            
            <div className="space-y-4">
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

              <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 h-24"
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
                  onClick={() => setShowPagoModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePagar}
                  disabled={loading}
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