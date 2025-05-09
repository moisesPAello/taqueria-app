import React from 'react';
import { OrdenResponse, MetodoPago, PagoCliente } from '../../../../services/ordenesService';
import { formatearHora } from '../../../../utils/dateUtils';

interface OrderCardProps {
  orden: OrdenResponse;
  onAction: (action: 'pagar' | 'cancelar' | 'detalles') => void;
  showActions?: boolean;
}

export const getEstadoColor = (estado: string) => {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    lista: 'bg-green-100 text-green-800',
    pagada: 'bg-gray-100 text-gray-800',
    cancelada: 'bg-red-100 text-red-800'
  };
  return colors[estado as keyof typeof colors] || colors.pendiente;
};

const OrderCard: React.FC<OrderCardProps> = ({ orden, onAction, showActions = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Orden #{orden.id}</h3>
          <p className="text-sm text-gray-500">Mesa {orden.mesa.numero}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(orden.estado)}`}>
          {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1).replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Mesero</p>
          <p className="font-medium">{orden.mesero}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-medium">${orden.total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hora</p>
          <p className="font-medium">{formatearHora(orden.hora)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Personas</p>
          <p className="font-medium">{orden.num_personas || '-'}</p>
        </div>
      </div>

      {orden.productos && orden.productos.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
          <div className="space-y-1">
            {orden.productos.map((producto, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{producto.cantidad}x {producto.nombre}</span>
                <span>${(producto.cantidad * producto.precio).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => onAction('detalles')}
            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Detalles
          </button>
          {orden.estado !== 'pagada' && orden.estado !== 'cancelada' && (
            <>
              <button
                onClick={() => onAction('pagar')}
                className="px-3 py-1 text-sm text-green-600 hover:text-green-800"
              >
                Cobrar
              </button>
              <button
                onClick={() => onAction('cancelar')}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
