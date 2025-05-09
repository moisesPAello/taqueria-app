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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Date | null>(null);
  const { token } = useAuth();

  const handleError = (err: unknown) => {
    console.error('Error al cargar órdenes:', err);
    setLastError(new Date());
    
    if (err instanceof Error) {
      const errorMessage = err.message.toLowerCase();
      
      // Manejar diferentes tipos de errores
      if (errorMessage.includes('no se pudo conectar') || errorMessage.includes('network error') || errorMessage.includes('failed to fetch')) {
        setError('No se pudo conectar con el servidor. Por favor verifica:\n1. Que el servidor esté activo\n2. Tu conexión a internet\n3. No haya problemas con el firewall\n\nReintentando conexión automáticamente...');
        
        // Intentar reconectar si no hemos excedido el límite de intentos
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            cargarOrdenes();
          }, 5000);
        }
      } else if (errorMessage.includes('401') || errorMessage.includes('no autorizado')) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (errorMessage.includes('403')) {
        setError('No tienes permiso para acceder a las órdenes.');
      } else if (errorMessage.includes('404')) {
        setError('El servicio de órdenes no está disponible en este momento.');
      } else if (errorMessage.includes('500')) {
        setError('Error interno del servidor. Por favor, intenta más tarde.');
      } else {
        setError(`Error al cargar órdenes: ${err.message}`);
      }
    } else {
      setError('Ocurrió un error inesperado al cargar las órdenes');
    }
  };

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        console.error('No hay token de autenticación');
        navigate('/login');
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      console.log('Cargando órdenes activas...');
      const data = await ordenesService.getActivas();
      
      console.log('Respuesta del servidor:', data);
      
      if (!data) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      if (!Array.isArray(data)) {
        console.error('Respuesta inesperada:', data);
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      setRetryCount(0); // Resetear contador de intentos si la carga fue exitosa
      setOrdenes(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    cargarOrdenes();
    // Recargar órdenes cada 30 segundos si no hay errores
    // o cada 5 segundos si hubo un error de conexión
    const interval = setInterval(() => {
      const now = new Date();
      const shouldRetryQuickly = lastError && 
        (now.getTime() - lastError.getTime() < 30000) && 
        retryCount < 6;

      if (!error || shouldRetryQuickly) {
        cargarOrdenes();
      }
    }, error ? 5000 : 30000);

    return () => clearInterval(interval);
  }, [token, error, lastError, retryCount]);

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
      )}      {loading && !ordenes.length ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Cargando órdenes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938-9L12 4.062l6.938 6.938M19 12a7 7 0 01-14 0" />
            </svg>
            <span className="font-medium">Error de conexión</span>
          </div>
          <p className="whitespace-pre-line">{error}</p>
          {retryCount > 0 && (
            <p className="mt-2 text-sm">
              Intentos de reconexión: {retryCount}
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">                <div>
                  <h2 className="text-xl font-semibold mb-2">Orden #{orden.id}</h2>
                  <p className="text-gray-600">Mesa: {orden.mesa.numero}</p>
                  <p className="text-gray-600">Mesero: {orden.mesero_nombre || orden.mesero}</p>
                  <div className="text-gray-600">
                    <p className="mb-1">Productos:</p>
                    <ul className="list-disc list-inside pl-2">
                      {orden.productos.map((prod, idx) => (
                        <li key={idx}>
                          {prod.nombre} x{prod.cantidad}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-gray-600 mt-2">Hora: {formatearHora(orden.hora)}</p>
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