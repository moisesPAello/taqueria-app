import React, { useState, useEffect } from 'react';
import ProductoCard from './ProductoCard';
import { useAuth } from '../../context/AuthContext';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen?: string;
}

const ProductosList: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
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
      
      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(data.map((p: Producto) => p.categoria))];
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

  const productosFiltrados = categoriaFiltro
    ? productos.filter(p => p.categoria === categoriaFiltro)
    : productos;

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

  return (
    <div className="container mx-auto px-4 py-8">
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
          <button
            onClick={() => fetchProductos()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Actualizar
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productosFiltrados.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            onEditar={user?.rol === 'admin' ? handleEditarProducto : undefined}
            onEliminar={user?.rol === 'admin' ? handleEliminarProducto : undefined}
            isAdmin={user?.rol === 'admin'}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductosList; 