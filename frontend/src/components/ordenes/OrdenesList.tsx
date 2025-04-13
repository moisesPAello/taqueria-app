import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Mesa {
  id: number;
  numero: number;
}

interface Usuario {
  id: number;
  nombre: string;
}

interface Orden {
  id: number;
  mesa: Mesa;
  usuario: Usuario;
  total: number;
  productos: Producto[];
}

const OrdenesList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  const cargarOrdenes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ordenes/activas');
      if (!response.ok) {
        throw new Error('Error al cargar las órdenes');
      }
      const data = await response.json();
      setOrdenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    cargarOrdenes();
  }, []);

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
                  <p>Mesero: {orden.usuario.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Total: ${orden.total}</p>
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
              <div className="mt-4">
                <h3 className="font-semibold">Productos:</h3>
                <ul className="list-disc list-inside">
                  {orden.productos.map((producto) => (
                    <li key={producto.id}>
                      {producto.cantidad}x {producto.nombre} - ${producto.precio}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdenesList; 