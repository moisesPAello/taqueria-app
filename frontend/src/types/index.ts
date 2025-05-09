export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    imagen?: string;
    stock: number;
    stock_minimo: number;
    disponible: boolean;
}

export interface ProductoOrden {
    producto: Producto;
    cantidad: number;
    notas?: string;
}

export interface OrdenRequest {
    mesa_id: number;
    usuario_id: number;
    productos: Array<{
        producto_id: number;
        cantidad: number;
        notas?: string;
    }>;
    notas?: string;
    num_personas?: number;
}

export interface PagoDividido {
    monto: number;
    cliente_numero: number;
}

export interface OrdenPagoRequest {
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
    notas?: string;
    pagos_divididos?: PagoDividido[];
}

interface ProductoEnOrden {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
    notas?: string;
}

export interface OrdenResponse {
    id: number;
    mesa: {
        numero: number;
    };
    mesero: string;
    mesero_nombre?: string;  // Added for backward compatibility
    total: string;
    productos: ProductoEnOrden[];
    hora: string;
    estado: 'activa' | 'cerrada' | 'cancelada';
    metodo_pago?: string;
    notas?: string;
    fecha_cierre?: string;
    fecha_creacion?: string;
    num_personas?: number;
    mesero_nombre?: string;

}