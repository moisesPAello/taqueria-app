import { API_URL } from './config.ts';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'mantenimiento';
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
  }
};

export default mesasService;