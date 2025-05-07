import React, { useState } from 'react';

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

interface ProductoCardProps {
  producto: Producto;
  onEditar?: (producto: Producto) => void;
  onEliminar?: (productoId: number) => void;
  onActualizarStock?: (productoId: number, cantidad: number) => void;
  isAdmin?: boolean;
}

const ProductoCard: React.FC<ProductoCardProps> = ({
  producto,
  onEditar,
  onEliminar,
  onActualizarStock,
  isAdmin = false
}) => {
  const [showStockModal, setShowStockModal] = useState(false);
  const [cantidad, setCantidad] = useState(0);

  const handleActualizarStock = () => {
    if (onActualizarStock) {
      onActualizarStock(producto.id, cantidad);
      setShowStockModal(false);
      setCantidad(0);
    }
  };

  const getStockStatusColor = () => {
    if (producto.stock <= 0) return 'bg-red-100 text-red-800';
    if (producto.stock <= producto.stock_minimo) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {producto.imagen && (
        <div className="h-48 w-full bg-gray-200">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>
            <p className="text-sm text-gray-500">{producto.categoria}</p>
          </div>
          <span className="text-lg font-bold text-indigo-600">
            ${producto.precio.toFixed(2)}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-600">{producto.descripcion}</p>

        <div className="mt-3">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor()}`}>
            {producto.stock <= 0 ? (
              'Agotado'
            ) : producto.stock <= producto.stock_minimo ? (
              `Stock Bajo: ${producto.stock} unidades`
            ) : (
              `Stock: ${producto.stock} unidades`
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setShowStockModal(true)}
                className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-200"
              >
                Actualizar Stock
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEditar?.(producto)}
                className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Editar
              </button>
              <button
                onClick={() => onEliminar?.(producto.id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Actualización de Stock */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Actualizar Stock - {producto.nombre}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual: {producto.stock}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCantidad(prev => Math.max(-producto.stock, prev - 1))}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setCantidad(Math.max(-producto.stock, value));
                  }}
                  className="block w-20 text-center border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => setCantidad(prev => prev + 1)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Nuevo stock total: {producto.stock + cantidad}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setCantidad(0);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleActualizarStock}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                disabled={cantidad === 0}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoCard;