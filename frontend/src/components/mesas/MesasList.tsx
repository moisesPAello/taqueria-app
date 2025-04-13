import React, { useState, useEffect } from 'react';
import MesaCard from './MesaCard';
import { useAuth } from '../../context/AuthContext';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'reservada';
  orden_actual?: number;
}

const MesasList: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const fetchMesas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/mesas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar las mesas');
      }
      
      const data = await response.json();
      setMesas(data);
    } catch (err) {
      setError('Error al cargar las mesas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const handleOcuparMesa = async (mesaId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/mesas/${mesaId}/ocupar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al ocupar la mesa');
      }

      // Actualizar el estado local
      setMesas(mesas.map(mesa => 
        mesa.id === mesaId 
          ? { ...mesa, estado: 'ocupada' } 
          : mesa
      ));
    } catch (err) {
      setError('Error al ocupar la mesa');
      console.error(err);
    }
  };

  const handleLiberarMesa = async (mesaId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/mesas/${mesaId}/liberar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al liberar la mesa');
      }

      // Actualizar el estado local
      setMesas(mesas.map(mesa => 
        mesa.id === mesaId 
          ? { ...mesa, estado: 'disponible', orden_actual: undefined } 
          : mesa
      ));
    } catch (err) {
      setError('Error al liberar la mesa');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
        <button
          onClick={() => fetchMesas()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Actualizar
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            onOcupar={handleOcuparMesa}
            onLiberar={handleLiberarMesa}
          />
        ))}
      </div>
    </div>
  );
};

export default MesasList; 