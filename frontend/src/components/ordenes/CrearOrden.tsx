import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Mesa {
  id: number;
  numero: number;
  estado: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

interface ProductoSeleccionado {
  producto: Producto;
  cantidad: number;
}

const CrearOrden: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener mesas disponibles
        const mesasResponse = await fetch('http://localhost:3000/api/mesas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mesasData = await mesasResponse.json();
        setMesas(mesasData.filter((m: Mesa) => m.estado === 'disponible'));

        // Obtener productos
        const productosResponse = await fetch('http://localhost:3000/api/productos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const productosData = await productosResponse.json();
        setProductos(productosData);
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAgregarProducto = (producto: Producto) => {
    setProductosSeleccionados(prev => {
      const existente = prev.find(p => p.producto.id === producto.id);
      if (existente) {
        return prev.map(p => 
          p.producto.id === producto.id 
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const handleEliminarProducto = (productoId: number) => {
    setProductosSeleccionados(prev => 
      prev.filter(p => p.producto.id !== productoId)
    );
  };

  const handleCambiarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad < 1) return;
    setProductosSeleccionados(prev =>
      prev.map(p => 
        p.producto.id === productoId 
          ? { ...p, cantidad }
          : p
      )
    );
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce(
      (total, item) => total + (item.producto.precio * item.cantidad),
      0
    );
  };

  const handleCrearOrden = async () => {
    if (!mesaSeleccionada || productosSeleccionados.length === 0) {
      setError('Selecciona una mesa y al menos un producto');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/ordenes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mesa_id: mesaSeleccionada,
          usuario_id: user?.id,
          productos: productosSeleccionados.map(p => ({
            producto_id: p.producto.id,
            cantidad: p.cantidad,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden');
      }

      navigate('/ordenes');
    } catch (err) {
      setError('Error al crear la orden');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Nueva Orden</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selección de Mesa */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Seleccionar Mesa</h2>
          <div className="grid grid-cols-2 gap-4">
            {mesas.map(mesa => (
              <button
                key={mesa.id}
                onClick={() => setMesaSeleccionada(mesa.id)}
                className={`p-4 rounded-lg border ${
                  mesaSeleccionada === mesa.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-600'
                }`}
              >
                Mesa {mesa.numero}
              </button>
            ))}
          </div>
        </div>

        {/* Productos Seleccionados */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Productos Seleccionados</h2>
          {productosSeleccionados.length === 0 ? (
            <p className="text-gray-500">No hay productos seleccionados</p>
          ) : (
            <div className="space-y-4">
              {productosSeleccionados.map(item => (
                <div key={item.producto.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.producto.nombre}</p>
                    <p className="text-sm text-gray-500">${item.producto.precio} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCambiarCantidad(item.producto.id, item.cantidad - 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => handleCambiarCantidad(item.producto.id, item.cantidad + 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleEliminarProducto(item.producto.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <p className="text-lg font-semibold">
                  Total: ${calcularTotal().toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Productos Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productos.map(producto => (
            <div
              key={producto.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium">{producto.nombre}</h3>
              <p className="text-sm text-gray-500">{producto.categoria}</p>
              <p className="text-indigo-600 font-semibold">${producto.precio}</p>
              <button
                onClick={() => handleAgregarProducto(producto)}
                className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleCrearOrden}
          disabled={!mesaSeleccionada || productosSeleccionados.length === 0}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear Orden
        </button>
      </div>
    </div>
  );
};

export default CrearOrden; 