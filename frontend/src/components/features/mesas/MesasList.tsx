import React, { useState, useEffect } from 'react';
import MesaCard from './MesaCard';
import mesasService from '../../../services/mesasService';
import { useAuth } from '../../../context/AuthContext';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'mantenimiento';
  mesero_nombre?: string;
  mesero_id?: number;
  orden_actual?: number;
}

interface Mesero {
  id: number;
  nombre: string;
  rol: string;
}

const MesasList: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [meseros, setMeseros] = useState<Mesero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mesasData, meserosData] = await Promise.all([
        mesasService.getMesas(),
        fetch(`${import.meta.env.VITE_API_URL}/usuarios?rol=mesero`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      ]);
      setMesas(mesasData);
      setMeseros(meserosData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleAsignarMesero = async (mesaId: number, meseroId: number) => {
    try {
      await mesasService.asignarMesero(mesaId, meseroId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar mesero');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
        <button
          onClick={fetchData}
          className="bg-secondary hover:bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            meseros={meseros}
            onAsignarMesero={handleAsignarMesero}
          />
        ))}
      </div>
    </div>
  );
};

export default MesasList;