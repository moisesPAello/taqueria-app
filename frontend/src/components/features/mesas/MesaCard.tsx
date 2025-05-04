import React from 'react';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'reservada';
  orden_actual?: number;
}

interface MesaCardProps {
  mesa: Mesa;
  onOcupar: (mesaId: number) => void;
  onLiberar: (mesaId: number) => void;
}

const MesaCard: React.FC<MesaCardProps> = ({ mesa, onOcupar, onLiberar }) => {
  const getEstadoColor = () => {
    switch (mesa.estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'ocupada':
        return 'bg-red-100 text-red-800';
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Mesa {mesa.numero}</h3>
          <p className="text-sm text-gray-600">Capacidad: {mesa.capacidad} personas</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor()}`}>
          {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
        </span>
      </div>
      
      <div className="mt-4 flex gap-2">
        {mesa.estado === 'disponible' && (
          <button
            onClick={() => onOcupar(mesa.id)}
            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ocupar Mesa
          </button>
        )}
        
        {mesa.estado === 'ocupada' && (
          <>
            <button
              onClick={() => window.location.href = `/ordenes/${mesa.orden_actual}`}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver Orden
            </button>
            <button
              onClick={() => onLiberar(mesa.id)}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Liberar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MesaCard; 