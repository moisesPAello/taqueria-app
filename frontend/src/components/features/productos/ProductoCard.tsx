import React, { useState } from 'react';
import { Producto } from '../../../types';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cantidad, setCantidad] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleActualizarStock = () => {
    if (!onActualizarStock) return;

    // Validar cambios significativos en el stock
    if (cantidad < 0 && Math.abs(cantidad) > producto.stock * 0.5) {
      setShowConfirmModal(true);
      return;
    }

    proceedWithStockUpdate();
  };

  const proceedWithStockUpdate = () => {
    if (!onActualizarStock) return;

    onActualizarStock(producto.id, cantidad);
    setShowStockModal(false);
    setShowConfirmModal(false);
    setCantidad(0);
    setError(null);
  };

  const handleCantidadChange = (value: number) => {
    if (value < -producto.stock) {
      setError('No puede reducir más del stock actual');
      return;
    }
    setError(null);
    setCantidad(value);
  };

  const getStockStatusColor = () => {
    if (producto.stock <= 0) return 'bg-red-100 text-red-800';
    if (producto.stock <= producto.stock_minimo) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {producto.imagen && (
        <div className="h-48 w-full bg-gray-200">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className={`h-full w-full object-cover ${!producto.disponible || producto.stock <= 0 ? 'filter grayscale opacity-50' : ''}`}
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
          {!producto.disponible && producto.stock > 0 && (
            <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Temporalmente no disponible
            </div>
          )}
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
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Stock Actual:</label>
                <span className="font-medium">{producto.stock}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCantidadChange(cantidad - 1)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  disabled={cantidad <= -producto.stock}
                >
                  -
                </button>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => handleCantidadChange(parseInt(e.target.value) || 0)}
                  className="block w-24 text-center border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => handleCantidadChange(cantidad + 1)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Nuevo stock total:</span>
                  <span className={`font-medium ${producto.stock + cantidad <= producto.stock_minimo ? 'text-yellow-600' : ''}`}>
                    {producto.stock + cantidad} unidades
                  </span>
                </div>
                {producto.stock + cantidad <= producto.stock_minimo && (
                  <p className="mt-2 text-sm text-yellow-600">
                    ⚠️ Este ajuste dejará el stock por debajo del mínimo ({producto.stock_minimo} unidades)
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setCantidad(0);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleActualizarStock}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={cantidad === 0 || !!error}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-600 mb-2">¿Confirmar reducción significativa?</h3>
              <p className="text-gray-600">
                Está por reducir el stock en {Math.abs(cantidad)} unidades ({Math.round(Math.abs(cantidad) / producto.stock * 100)}% del stock actual).
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={proceedWithStockUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoCard;