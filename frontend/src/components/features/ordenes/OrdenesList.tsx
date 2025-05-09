import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ordenesService } from '../../../services/api';
import type { OrdenResponse } from '../../../types';

const formatearHora = (fechaISO: string) => {
  try {
    const fecha = new Date(fechaISO);
    
    if (isNaN(fecha.getTime())) {
      console.error("Fecha inválida:", fechaISO);
      return "Hora no disponible";
    }

    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Hermosillo'
    }).toLowerCase();
  } catch (err) {
    console.error("Error al formatear fecha:", err);
    return "Hora no disponible";
  }
};

const OrdenesList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenResponse[]>([]);
  const [ordenParaCancelar, setOrdenParaCancelar] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { token } = useAuth();

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const data = await ordenesService.getActivas();
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
    // Recargar órdenes cada 30 segundos
    const interval = setInterval(cargarOrdenes, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const mostrarNotificacion = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCerrarOrden = async (id: number) => {
    try {
      setLoading(true);
      await ordenesService.pagar(id, {
        metodo_pago: 'efectivo', // Default to efectivo for quick close
        notas: 'Cerrado desde lista de órdenes'
      });
      mostrarNotificacion('success', 'Orden cerrada exitosamente');
      await cargarOrdenes();
    } catch (err) {
      mostrarNotificacion('error', 'Error al cerrar la orden');
      console.error('Error al cerrar orden:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarCancelacion = async () => {
    if (!ordenParaCancelar) return;
    
    try {
      setLoading(true);
      await ordenesService.cancelar(ordenParaCancelar);
      mostrarNotificacion('success', 'Orden cancelada exitosamente');
      setOrdenParaCancelar(null);
      await cargarOrdenes();
    } catch (err) {
      mostrarNotificacion('error', 'Error al cancelar la orden');
      console.error('Error al cancelar orden:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes Activas</h1>
        <Link
          to="/ordenes/nueva"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Nueva Orden
        </Link>
      </div>

      {notification && (
        <div className={`mb-4 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}

      {loading && !ordenes.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Orden #{orden.id}</h2>
                  <p className="text-gray-600">Mesa: {orden.mesa.numero}</p>
                  <p className="text-gray-600">Mesero: {orden.mesero_nombre}</p>
                  <p className="text-gray-600">
                    Productos: {orden.productos.map((producto, index) => (
                      <span key={index}>{producto.nombre}{index < orden.productos.length - 1 ? ', ' : ''}</span>
                    ))}
                  </p>
                  <p className="text-gray-600">Hora: {formatearHora(orden.hora)}</p>
                  {orden.notas && (
                    <p className="mt-2 text-sm text-gray-500 italic">Notas: {orden.notas}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 mb-2">${orden.total}</p>
                  <p className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                    {orden.estado}
                  </p>
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => handleCerrarOrden(orden.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => setOrdenParaCancelar(orden.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {ordenParaCancelar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar Cancelación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas cancelar la orden #{ordenParaCancelar}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOrdenParaCancelar(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarCancelacion}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesList;