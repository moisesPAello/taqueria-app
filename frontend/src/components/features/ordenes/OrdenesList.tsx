import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface Orden {
  id: number;
  mesa: {
    numero: number;
  };
  mesero: string;
  total: string;
  productos: number;
  hora: string;
  estado: string;
  metodo_pago?: string;
  notas?: string;
  fecha_creacion: string;
  fecha_cierre?: string;
}

const OrdenesList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const { token } = useAuth();

  const cargarOrdenes = async () => {
    try {
      // Mostrar el estado de carga
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/ordenes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las órdenes');
      }

      const data = await response.json();
      console.log('Órdenes cargadas:', data);
      setOrdenes(data);
    } catch (err) {
      console.error('Error detallado:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar órdenes cuando el componente se monta
  React.useEffect(() => {
    cargarOrdenes();
  }, [token]); // Agregamos token como dependencia

  const handleCerrarOrden = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/ordenes/${id}/cerrar`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Error al cerrar la orden');
      }
      await cargarOrdenes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleCancelarOrden = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/ordenes/${id}/cancelar`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Error al cancelar la orden');
      }
      await cargarOrdenes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes Activas</h1>
        <Link
          to="/ordenes/nueva"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Nueva Orden
        </Link>
      </div>

      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">Orden #{orden.id}</h2>
                  <p>Mesa: {orden.mesa.numero}</p>
                  <p>Mesero: {orden.mesero}</p>
                  <p>Productos: {orden.productos}</p>
                  <p>Hora: {orden.hora}</p>
                  {orden.notas && <p>Notas: {orden.notas}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Total: ${orden.total}</p>
                  <p className="text-sm text-gray-600">{orden.estado}</p>
                  {orden.metodo_pago && (
                    <p className="text-sm text-gray-600">Pago: {orden.metodo_pago}</p>
                  )}
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleCerrarOrden(orden.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => handleCancelarOrden(orden.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
    </div>
  );
};

export default OrdenesList;