import React from 'react';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen?: string;
}

interface ProductoCardProps {
  producto: Producto;
  onEditar?: (producto: Producto) => void;
  onEliminar?: (productoId: number) => void;
  isAdmin?: boolean;
}

const ProductoCard: React.FC<ProductoCardProps> = ({ 
  producto, 
  onEditar, 
  onEliminar,
  isAdmin = false 
}) => {
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
        
        {isAdmin && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onEditar?.(producto)}
              className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Editar
            </button>
            <button
              onClick={() => onEliminar?.(producto.id)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoCard; 