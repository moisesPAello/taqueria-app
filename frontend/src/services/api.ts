import { OrdenRequest, OrdenPagoRequest } from '../types';

// Obtener la URL base de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función para realizar peticiones con token de autenticación
const fetchWithAuth = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Añadir token de autenticación si existe
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    // Intentar parsear la respuesta como JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
};

// Servicio de autenticación
export const authService = {
  // Iniciar sesión
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Credenciales inválidas');
    }
    
    return response.json();
  },
  
  // Registrar nuevo usuario
  register: async (userData: {
    nombre: string;
    email: string;
    password: string;
    rol?: string;
  }) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
};

// Servicio de mesas
export const mesasService = {
  // Obtener todas las mesas
  getAll: async () => {
    return fetchWithAuth('/mesas');
  },
  
  // Obtener una mesa específica
  getById: async (id: number) => {
    return fetchWithAuth(`/mesas/${id}`);
  },
  
  // Actualizar estado de una mesa
  updateEstado: async (id: number, estado: string) => {
    return fetchWithAuth(`/mesas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado })
    });
  },
  
  // Crear nueva mesa (solo admin)
  create: async (mesaData: {
    numero: number;
    capacidad: number;
    ubicacion?: string;
  }) => {
    return fetchWithAuth('/mesas', {
      method: 'POST',
      body: JSON.stringify(mesaData)
    });
  }
};

// Servicio de productos
export const productosService = {
  // Obtener todos los productos
  getAll: async () => {
    return fetchWithAuth('/productos');
  },
  
  // Obtener un producto específico
  getById: async (id: number) => {
    return fetchWithAuth(`/productos/${id}`);
  },
  
  // Crear nuevo producto (solo admin)
  create: async (productoData: {
    nombre: string;
    descripcion?: string;
    precio: number;
    categoria: string;
    disponible?: boolean;
  }) => {
    return fetchWithAuth('/productos', {
      method: 'POST',
      body: JSON.stringify(productoData)
    });
  },
  
  // Actualizar producto (solo admin)
  update: async (id: number, productoData: any) => {
    return fetchWithAuth(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productoData)
    });
  },
  
  // Eliminar producto (solo admin)
  delete: async (id: number) => {
    return fetchWithAuth(`/productos/${id}`, {
      method: 'DELETE'
    });
  },

  // Actualizar stock de producto (solo admin)
  updateStock: async (id: number, cantidad: number) => {
    return fetchWithAuth(`/productos/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify({
        cantidad,
        tipo: cantidad >= 0 ? 'entrada' : 'salida',
        motivo: 'Ajuste manual de inventario'
      })
    });
  }
};

// Servicio de órdenes
export const ordenesService = {
  // Obtener todas las órdenes
  getAll: async () => {
    return fetchWithAuth('/ordenes');
  },
  
  // Obtener órdenes activas
  getActivas: async () => {
    return fetchWithAuth('/ordenes?estado=activa');
  },
  
  // Obtener una orden específica
  getById: async (id: number) => {
    return fetchWithAuth(`/ordenes/${id}`);
  },
  
  // Crear nueva orden
  create: async (ordenData: OrdenRequest) => {
    return fetchWithAuth('/ordenes', {
      method: 'POST',
      body: JSON.stringify(ordenData)
    });
  },
  
  // Cerrar una orden
  cerrar: async (id: number) => {
    return fetchWithAuth(`/ordenes/${id}/cerrar`, {
      method: 'POST'
    });
  },
  
  // Cancelar una orden
  cancelar: async (id: number) => {
    return fetchWithAuth(`/ordenes/${id}/cancelar`, {
      method: 'POST'
    });
  },
  
  // Pagar una orden
  pagar: async (id: number, data: OrdenPagoRequest) => {
    return fetchWithAuth(`/ordenes/${id}/pagar`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // Agregar productos a una orden existente
  agregarProductos: async (id: number, productos: Array<{
    producto_id: number;
    cantidad: number;
    notas?: string;
  }>) => {
    return fetchWithAuth(`/ordenes/${id}/productos`, {
      method: 'POST',
      body: JSON.stringify({ productos })
    });
  },

  // Registrar pago individual
  pagarIndividual: async (id: number, data: { 
    cliente_numero: number;
    monto: number;
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  }) => {
    return fetchWithAuth(`/ordenes/${id}/pagar-individual`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Obtener resumen de pagos
  obtenerPagos: async (id: number) => {
    return fetchWithAuth(`/ordenes/${id}/pagos`);
  }
};