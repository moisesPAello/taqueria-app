import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface MesaCardProps {
  mesa: Mesa;
  meseros: Mesero[];
  onAsignarMesero: (mesaId: number, meseroId: number) => void;
}

const MesaCard: React.FC<MesaCardProps> = ({
  mesa,
  meseros,
  onAsignarMesero
}) => {
  const [showMeseros, setShowMeseros] = useState(false);
  const navigate = useNavigate();

  const getEstadoColor = () => {
    switch (mesa.estado) {
      case 'disponible':
        return 'border-green-500 bg-green-50';
      case 'ocupada':
        return 'border-red-500 bg-red-50';
      case 'mantenimiento':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300';
    }
  };

  const getEstadoIcono = () => {
    switch (mesa.estado) {
      case 'disponible':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ocupada':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleAgregarOrden = () => {
    navigate('/ordenes/nueva', { 
      state: { 
        mesaId: mesa.id, 
        mesaNumero: mesa.numero,
        meseroId: mesa.mesero_id
      }
    });
  };

  return (
    <div className={`relative rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-shadow ${getEstadoColor()}`}>
      <div className="absolute top-3 right-3">
        {getEstadoIcono()}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold">Mesa {mesa.numero}</h3>
        <p className="text-sm text-gray-600">Capacidad: {mesa.capacidad} personas</p>
        {mesa.mesero_nombre && (
          <p className="text-sm text-gray-600">Mesero: {mesa.mesero_nombre}</p>
        )}
        <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-white border border-current text-gray-700">
          {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
        </span>
      </div>

      <div className="space-y-2">
        {mesa.estado === 'disponible' && !mesa.mesero_id && (
          <div>
            <button
              onClick={() => setShowMeseros(!showMeseros)}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Asignar Mesero
            </button>

            {showMeseros && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Seleccionar Mesero:</h4>
                <div className="space-y-1">
                  {meseros.map(mesero => (
                    <button
                      key={mesero.id}
                      onClick={() => {
                        onAsignarMesero(mesa.id, mesero.id);
                        setShowMeseros(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {mesero.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mesa.estado === 'disponible' && mesa.mesero_id && (
          <button
            onClick={handleAgregarOrden}
            className="w-full bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Añadir Orden
          </button>
        )}

        {mesa.estado === 'ocupada' && (
          <button
            onClick={() => mesa.orden_actual && navigate(`/ordenes/${mesa.orden_actual}`)}
            className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Ver Orden Actual
          </button>
        )}
      </div>
    </div>
  );
};

export default MesaCard;