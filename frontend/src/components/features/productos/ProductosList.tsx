import React, { useState, useEffect } from 'react';
import ProductoCard from './ProductoCard';
import { useAuth } from '../../../context/AuthContext';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen?: string;
  stock: number;
  stock_minimo: number;
}

const ProductosList: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [disponibilidadFiltro, setDisponibilidadFiltro] = useState<'todos' | 'disponibles' | 'agotados' | 'stock_bajo'>('todos');
  const [categorias, setCategorias] = useState<string[]>([]);
  const { token, user } = useAuth();

  const fetchProductos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/productos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      
      const data = await response.json();
      setProductos(data);
      
      const categoriasUnicas = [...new Set(data.map((p: Producto) => p.categoria))] as string[];
      setCategorias(categoriasUnicas);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleEliminarProducto = async (productoId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/productos/${productoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      setProductos(productos.filter(p => p.id !== productoId));
    } catch (err) {
      setError('Error al eliminar el producto');
      console.error(err);
    }
  };

  const handleEditarProducto = (producto: Producto) => {
    // TODO: Implementar edición de producto
    console.log('Editar producto:', producto);
  };

  const handleActualizarStock = async (productoId: number, cantidad: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/productos/${productoId}/stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cantidad,
          tipo: cantidad >= 0 ? 'entrada' : 'salida',
          motivo: 'Ajuste manual de inventario'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      await fetchProductos(); // Recargar productos para obtener el nuevo stock
    } catch (err) {
      setError('Error al actualizar el stock');
      console.error(err);
    }
  };

  const filtrarProductos = () => {
    let productosFiltrados = productos;

    // Filtrar por categoría
    if (categoriaFiltro) {
      productosFiltrados = productosFiltrados.filter(p => p.categoria === categoriaFiltro);
    }

    // Filtrar por disponibilidad
    switch (disponibilidadFiltro) {
      case 'disponibles':
        productosFiltrados = productosFiltrados.filter(p => p.stock > 0);
        break;
      case 'agotados':
        productosFiltrados = productosFiltrados.filter(p => p.stock <= 0);
        break;
      case 'stock_bajo':
        productosFiltrados = productosFiltrados.filter(p => p.stock > 0 && p.stock <= p.stock_minimo);
        break;
    }

    return productosFiltrados;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const productosFiltrados = filtrarProductos();
  const productosAgotados = productos.filter(p => p.stock <= 0).length;
  const productosStockBajo = productos.filter(p => p.stock > 0 && p.stock <= p.stock_minimo).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
          <div className="flex gap-4">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <select
              value={disponibilidadFiltro}
              onChange={(e) => setDisponibilidadFiltro(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="todos">Todos los productos</option>
              <option value="disponibles">Con stock</option>
              <option value="agotados">Agotados</option>
              <option value="stock_bajo">Stock bajo</option>
            </select>
            <button
              onClick={() => fetchProductos()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Resumen de inventario */}
        {user?.rol === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
              <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
              <h3 className="text-sm font-medium text-yellow-800">Stock Bajo</h3>
              <p className="text-2xl font-bold text-yellow-900">{productosStockBajo}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 bg-red-50">
              <h3 className="text-sm font-medium text-red-800">Agotados</h3>
              <p className="text-2xl font-bold text-red-900">{productosAgotados}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productosFiltrados.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            onEditar={user?.rol === 'admin' ? handleEditarProducto : undefined}
            onEliminar={user?.rol === 'admin' ? handleEliminarProducto : undefined}
            onActualizarStock={user?.rol === 'admin' ? handleActualizarStock : undefined}
            isAdmin={user?.rol === 'admin'}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductosList;