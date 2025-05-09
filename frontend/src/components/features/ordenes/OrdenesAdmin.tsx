import { useState, useEffect, useMemo } from 'react';
import ordenesService, { 
  OrdenResponse, 
  MetodoPago, 
  PagoCliente,
  EstadoOrden 
} from '../../../services/ordenesService';
import { formatearHora } from '../../../utils/dateUtils';
import OrderCard from './components/OrderCard';
import OrdersTable from './components/OrdersTable';
import PaymentModal from './components/PaymentModal';
import SortableTableHeader from './components/SortableTableHeader';

const ITEMS_PER_PAGE = 12;

type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'table';
type SortField = keyof Pick<OrdenResponse, 'id' | 'estado' | 'total' | 'mesero' | 'hora' | 'fecha_cierre'>;

interface FilterState {
  search: string;
  estado: EstadoOrden | '';
  fechaDesde: string;
  fechaHasta: string;
}

interface CancelModalProps {
  orden: OrdenResponse;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const CancelModal: React.FC<CancelModalProps> = ({ orden, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="text-lg font-semibold mb-4">
          ¿Estás seguro de que deseas cancelar la orden #{orden.id}?
        </div>
        <p className="text-gray-600 mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            No, mantener
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Sí, cancelar orden'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrdenesAdmin() {
  // State management
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>('activas');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [ordenesActivas, setOrdenesActivas] = useState<OrdenResponse[]>([]);
  const [ordenesNoActivas, setOrdenesNoActivas] = useState<OrdenResponse[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Filters and sorting
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'id',
    direction: 'desc'
  });

  // Load orders
  const loadOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      
      const data = await ordenesService.getAll(params);
      setOrdenesActivas(data.activas);
      setOrdenesNoActivas(data.historial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdenes();
  }, [filters]);

  // Sort and filter orders
  const ordenesFiltradas = useMemo(() => {
    const ordenes = activeTab === 'activas' ? ordenesActivas : ordenesNoActivas;
    
    return [...ordenes].sort((a, b) => {
      const field = sortConfig.field;
      const aValue = a[field];
      const bValue = b[field];

      // Handle date fields
      if (field === 'hora' || field === 'fecha_cierre') {
        const dateA = aValue ? new Date(aValue).getTime() : 0;
        const dateB = bValue ? new Date(bValue).getTime() : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // Handle regular fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [activeTab, ordenesActivas, ordenesNoActivas, sortConfig]);

  // Pagination
  const paginatedOrdenes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return ordenesFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [ordenesFiltradas, currentPage]);

  const totalPages = Math.ceil(ordenesFiltradas.length / ITEMS_PER_PAGE);

  // Action handlers
  const handleOrdenAction = (orden: OrdenResponse, action: 'pagar' | 'cancelar' | 'detalles') => {
    setOrdenSeleccionada(orden);
    if (action === 'pagar') {
      setShowPagoModal(true);
    } else if (action === 'cancelar') {
      setShowCancelModal(true);
    }
  };

  const handlePagar = async (data: {
    metodo_pago?: MetodoPago;
    pagos_divididos?: PagoCliente[];
    notas?: string;
  }) => {
    if (!ordenSeleccionada) return;
    
    try {
      await ordenesService.pagar(ordenSeleccionada.id, data);
      setShowPagoModal(false);
      loadOrdenes();
    } catch (err) {
      throw new Error('Error al procesar el pago');
    }
  };

  const handleCancelar = async (notas?: string) => {
    if (!ordenSeleccionada) return;
    
    try {
      await ordenesService.cancelar(ordenSeleccionada.id, { notas });
      setShowCancelModal(false);
      setOrdenSeleccionada(null);
      loadOrdenes();
    } catch (err) {
      setError('Error al cancelar la orden');
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 space-y-6">
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setActiveTab('activas');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'activas'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Órdenes Activas
                {ordenesActivas.length > 0 && (
                  <span className="ml-2 bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                    {ordenesActivas.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('historial');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'historial'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Historial
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Vista en cuadrícula"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Vista en tabla"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Buscar órdenes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {activeTab === 'historial' && (
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Desde:</span>
                  <input
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                    className="border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hasta:</span>
                  <input
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                    className="border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
            )}

            <select
              value={filters.estado}
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value as EstadoOrden | '' }))}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="lista">Lista</option>
              <option value="pagada">Pagada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Orders Content */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cargando órdenes...</span>
              </div>
            </div>
          ) : paginatedOrdenes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No se encontraron órdenes
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedOrdenes.map((orden) => (
                <OrderCard
                  key={orden.id}
                  orden={orden}
                  onAction={(action) => handleOrdenAction(orden, action)}
                  showActions={activeTab === 'activas'}
                />
              ))}
            </div>
          ) : (
            <OrdersTable
              orders={paginatedOrdenes}
              sortConfig={sortConfig}
              onSort={handleSort}
              onAction={handleOrdenAction}
              showActions={activeTab === 'activas'}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <nav className="flex space-x-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === idx + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </nav>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPagoModal && ordenSeleccionada && (
        <PaymentModal
          orden={ordenSeleccionada}
          onClose={() => {
            setShowPagoModal(false);
            setOrdenSeleccionada(null);
          }}
          onPagar={handlePagar}
        />
      )}

      {showCancelModal && ordenSeleccionada && (
        <CancelModal
          orden={ordenSeleccionada}
          onClose={() => {
            setShowCancelModal(false);
            setOrdenSeleccionada(null);
          }}
          onConfirm={() => handleCancelar()}
        />
      )}
    </div>
  );
}