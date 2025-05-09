import { ordenesService as api } from './api';

export interface PagoCliente {
  cliente_numero: number;
  monto: number;
  metodo_pago?: MetodoPago;
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';
export type EstadoOrden = 'pendiente' | 'en_proceso' | 'lista' | 'pagada' | 'cancelada';

export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  notas?: string;
}

export interface Mesa {
  id: number;
  numero: number;
}

export interface OrdenResponse {
  id: number;
  mesa: Mesa;
  estado: EstadoOrden;
  total: number;
  mesero: string;
  hora: string;
  fecha_cierre?: string;
  notas?: string;
  num_personas?: number;
  productos?: Producto[];
  metodo_pago?: MetodoPago;
  pagos_divididos?: PagoCliente[];
}

export interface OrdenPagoRequest {
  metodo_pago?: MetodoPago;
  pagos_divididos?: PagoCliente[];
  notas?: string;
}

export interface CancelarOrdenRequest {
  notas?: string;
}

export interface OrdenesResponse {
  activas: OrdenResponse[];
  historial: OrdenResponse[];
}

class OrdenesServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'OrdenesServiceError';
  }
}

const handleError = (error: any): never => {
  if (error.response) {
    throw new OrdenesServiceError(
      error.response.data.message || 'Error en el servidor',
      error.response.status
    );
  }
  throw new OrdenesServiceError(
    'Error de conexión con el servidor'
  );
};

const ordenesService = {
  getAll: async (params: URLSearchParams): Promise<OrdenesResponse> => {
    try {
      const response = await api.get(`/ordenes?${params}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  pagar: async (ordenId: number, data: OrdenPagoRequest): Promise<OrdenResponse> => {
    try {
      const response = await api.post(`/ordenes/${ordenId}/pagar`, data);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  cancelar: async (ordenId: number, data: CancelarOrdenRequest): Promise<OrdenResponse> => {
    try {
      const response = await api.post(`/ordenes/${ordenId}/cancelar`, data);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getDetalles: async (ordenId: number): Promise<OrdenResponse> => {
    try {
      const response = await api.get(`/ordenes/${ordenId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default ordenesService;
