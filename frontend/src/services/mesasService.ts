import { API_URL } from './config.ts';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'en_servicio' | 'mantenimiento';
  mesero_id?: number;
  mesero_nombre?: string;
  orden_actual?: number;
}

const mesasService = {
  // Obtener todas las mesas
  getMesas: async (): Promise<Mesa[]> => {
    const response = await fetch(`${API_URL}/mesas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener mesas');
    }
    
    return response.json();
  },

  // Asignar mesero a una mesa
  asignarMesero: async (mesaId: number, meseroId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/mesas/${mesaId}/asignar-mesero`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meseroId }),
    });
    
    if (!response.ok) {
      throw new Error('Error al asignar mesero');
    }
  },

  // Actualizar estado de mesa
  actualizarEstado: async (mesaId: number, estado: Mesa['estado']): Promise<void> => {
    const response = await fetch(`${API_URL}/mesas/${mesaId}/estado`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar estado');
    }
  },

  // Liberar mesa
  liberarMesa: async (mesaId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/mesas/${mesaId}/liberar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Error al liberar mesa');
    }
  },

  // Crear nueva orden para mesa
  crearOrden: async (mesaId: number, meseroId: number): Promise<number> => {
    const response = await fetch(`${API_URL}/ordenes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mesa_id: mesaId,
        usuario_id: meseroId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear orden');
    }
    
    const data = await response.json();
    return data.orden_id;
  },
};

export default mesasService;