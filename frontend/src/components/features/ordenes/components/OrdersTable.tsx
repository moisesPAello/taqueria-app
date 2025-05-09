import React from 'react';
import { OrdenResponse } from '../../../../services/ordenesService';
import { formatearHora } from '../../../../utils/dateUtils';
import SortableTableHeader from './SortableTableHeader';
import { getEstadoColor } from './OrderCard';

type SortDirection = 'asc' | 'desc';
type SortField = keyof Pick<OrdenResponse, 'id' | 'estado' | 'total' | 'mesero' | 'hora' | 'fecha_cierre'>;

interface OrdersTableProps {
  orders: OrdenResponse[];
  sortConfig: {
    field: SortField;
    direction: SortDirection;
  };
  onSort: (field: SortField) => void;
  onAction: (orden: OrdenResponse, action: 'pagar' | 'cancelar' | 'detalles') => void;
  showActions?: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  sortConfig,
  onSort,
  onAction,
  showActions = true
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <SortableTableHeader
                label="ID"
                field="id"
                currentSort={sortConfig}
                onSort={onSort}
              />
            </th>
            <th className="px-6 py-3">
              <SortableTableHeader
                label="Estado"
                field="estado"
                currentSort={sortConfig}
                onSort={onSort}
              />
            </th>
            <th className="px-6 py-3">
              <SortableTableHeader
                label="Total"
                field="total"
                currentSort={sortConfig}
                onSort={onSort}
              />
            </th>
            <th className="px-6 py-3">
              <SortableTableHeader
                label="Mesero"
                field="mesero"
                currentSort={sortConfig}
                onSort={onSort}
              />
            </th>
            <th className="px-6 py-3">
              <SortableTableHeader
                label="Hora"
                field="hora"
                currentSort={sortConfig}
                onSort={onSort}
              />
            </th>
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((orden) => (
            <tr key={orden.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">#{orden.id}</div>
                  <div className="ml-2 text-sm text-gray-500">Mesa {orden.mesa.numero}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  getEstadoColor(orden.estado)
                }`}>
                  {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1).replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${orden.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {orden.mesero}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatearHora(orden.hora)}
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onAction(orden, 'detalles')}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Detalles
                  </button>
                  {orden.estado !== 'pagada' && orden.estado !== 'cancelada' && (
                    <>
                      <button
                        onClick={() => onAction(orden, 'pagar')}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Cobrar
                      </button>
                      <button
                        onClick={() => onAction(orden, 'cancelar')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
