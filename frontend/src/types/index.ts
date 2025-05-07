export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
    descripcion?: string;
    disponible: boolean;
    imagen?: string;
}

export interface ProductoOrden {
    producto: Producto;
    cantidad: number;
    notas?: string;
}

export interface OrdenRequest {
    mesa_id: number;
    mesero_id: number;
    productos: Array<{
        producto_id: number;
        cantidad: number;
        notas?: string;
    }>;
    notas?: string;
    num_personas?: number;
}

export interface OrdenResponse {
    id: number;
    mesa: {
        numero: number;
    };
    mesero_nombre: string;
    total: string;
    productos: number;
    hora: string;
    estado: 'activa' | 'cerrada' | 'cancelada';
    metodo_pago?: string;
    notas?: string;
}