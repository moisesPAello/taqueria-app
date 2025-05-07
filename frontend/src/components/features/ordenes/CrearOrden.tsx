import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ordenesService, productosService } from '../../../services/api';
import { Producto, ProductoOrden } from '../../../types';

interface LocationState {
  mesaId: number;
  mesaNumero: number;
  meseroId: number;
}

const CrearOrden: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoOrden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notas, setNotas] = useState('');
  const [numPersonas, setNumPersonas] = useState(1);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Verificar que tengamos la mesaId
  useEffect(() => {
    if (!state?.mesaId) {
      navigate('/mesas');
    }
  }, [state, navigate]);

  // Cargar productos
  useEffect(() => {
    let mounted = true;
    
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await productosService.getAll();
        if (mounted) {
          const productosDisponibles = data.filter((p: Producto) => p.disponible);
          setProductos(productosDisponibles);
          
          // Extraer categorías únicas con tipado correcto
          const cats = [...new Set(productosDisponibles.map((p: Producto) => p.categoria))] as string[];
          setCategorias(cats);
          
          setProductosFiltrados(productosDisponibles);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError('Error al cargar productos');
          console.error(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProductos();
    return () => { mounted = false; };
  }, []);

  // Filtrar productos
  useEffect(() => {
    let filtered = productos;
    
    if (categoriaSeleccionada) {
      filtered = filtered.filter(p => p.categoria === categoriaSeleccionada);
    }
    
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm) ||
        p.descripcion?.toLowerCase().includes(searchTerm)
      );
    }
    
    setProductosFiltrados(filtered);
  }, [productos, categoriaSeleccionada, busqueda]);

  const calcularTotal = useCallback(() => {
    return productosSeleccionados.reduce((total, item) => 
      total + (item.producto.precio * item.cantidad), 0
    );
  }, [productosSeleccionados]);

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
      return [...prev, { producto, cantidad: 1, notas: '' }];
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

  const handleCambiarNotasProducto = (productoId: number, notas: string) => {
    setProductosSeleccionados(prev =>
      prev.map(p =>
        p.producto.id === productoId
          ? { ...p, notas }
          : p
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state?.mesaId || !state?.meseroId) {
      setError('No se puede crear la orden: falta información de mesa o mesero');
      return;
    }

    if (productosSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un producto');
      return;
    }

    try {
      setLoading(true);
      await ordenesService.create({
        mesa_id: state.mesaId,
        usuario_id: state.meseroId,
        productos: productosSeleccionados.map(p => ({
          producto_id: p.producto.id,
          cantidad: p.cantidad,
          notas: p.notas?.trim() || undefined
        })),
        notas: notas.trim() || undefined,
        num_personas: numPersonas
      });
      
      setNotification({
        type: 'success',
        message: 'Orden creada exitosamente'
      });

      setTimeout(() => {
        navigate('/mesas');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden');
      console.error('Error al crear orden:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  const total = calcularTotal();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Nueva Orden - Mesa {state?.mesaNumero}</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {notification && (
          <div className={`${
            notification.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
          } px-4 py-3 rounded border mb-4`}>
            {notification.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo */}
        <div className="space-y-6">
          {/* Detalles de la mesa */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Detalles de la Orden</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="numPersonas" className="block text-sm font-medium text-gray-700">
                  Número de Personas
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNumPersonas(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="numPersonas"
                    value={numPersonas}
                    onChange={(e) => setNumPersonas(Math.max(1, parseInt(e.target.value) || 1))}
                    className="block w-20 text-center border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => setNumPersonas(prev => prev + 1)}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notas generales
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="mt-1 block w-full border border-gray-500 rounded-lg shadow-sm p-3 bg-white"
                  rows={2}
                  placeholder="Notas o instrucciones especiales para toda la orden..."
                />
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold">Productos Disponibles</h2>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="block w-full sm:w-40 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar productos..."
                  className="block w-full sm:w-48 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {productosFiltrados.map(producto => (
                <div
                  key={producto.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-50"
                >
                  {producto.imagen && (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-medium text-lg">{producto.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-indigo-600">${producto.precio.toFixed(2)}</p>
                    <button
                      onClick={() => handleAgregarProducto(producto)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Orden actual */}
        <div className="lg:sticky lg:top-4 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Orden Actual</h2>
            {productosSeleccionados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay productos seleccionados</p>
            ) : (
              <div className="space-y-4">
                {productosSeleccionados.map(item => (
                  <div key={item.producto.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-lg">{item.producto.nombre}</p>
                        <p className="text-indigo-600">${(item.producto.precio * item.cantidad).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCambiarCantidad(item.producto.id, item.cantidad - 1)}
                          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => handleCambiarCantidad(item.producto.id, item.cantidad + 1)}
                          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleEliminarProducto(item.producto.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <textarea
                        value={item.notas || ''}
                        onChange={(e) => handleCambiarNotasProducto(item.producto.id, e.target.value)}
                        placeholder="Notas especiales para este producto..."
                        className="w-full text-sm border border-gray-300 rounded-lg p-2"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  {numPersonas > 1 && (
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span>Por persona ({numPersonas}):</span>
                      <span>${(total / numPersonas).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate('/mesas')}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={productosSeleccionados.length === 0 || loading}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Procesando...' : 'Crear Orden'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearOrden;