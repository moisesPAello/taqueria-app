import React from 'react';
import { OrdenResponse } from '../../../../services/ordenesService';

type SortDirection = 'asc' | 'desc';
type SortField = keyof Pick<OrdenResponse, 'id' | 'estado' | 'total' | 'mesero' | 'hora' | 'fecha_cierre'>;

interface SortableTableHeaderProps {
  label: string;
  field: SortField;
  currentSort: {
    field: SortField;
    direction: SortDirection;
  };
  onSort: (field: SortField) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  field,
  currentSort,
  onSort
}) => {
  const isCurrentSort = currentSort.field === field;
  
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
    >
      <span>{label}</span>
      <span className={`transition-transform duration-200 ${
        isCurrentSort ? 'opacity-100' : 'opacity-0'
      }`}>
        {isCurrentSort && (currentSort.direction === 'asc' ? '↑' : '↓')}
      </span>
    </button>
  );
};

export default SortableTableHeader;
