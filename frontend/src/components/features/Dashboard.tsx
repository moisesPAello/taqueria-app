import React, { useState, useEffect } from 'react';
import { formatearHora } from '../../utils/dateUtils';

interface DashboardStats {
  totalOrdenes: number;
  ordenesActivas: number;
  mesasOcupadas: number;
  totalMesas: number;
  ventasHoy: number;
}

interface OrdenActiva {
  id: number;
  mesa: string;
  mesero: string;
  total: number;
  productos: number;
  hora: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrdenes: 0,
    ordenesActivas: 0,
    mesasOcupadas: 0,
    totalMesas: 0,
    ventasHoy: 0
  });
  const [ordenesActivas, setOrdenesActivas] = useState<OrdenActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar datos del dashboard');
        }

        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    const fetchOrdenesActivas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/ordenes/activas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar órdenes activas');
        }

        const data = await response.json();
        setOrdenesActivas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    fetchDashboardData();
    fetchOrdenesActivas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Órdenes Activas</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.ordenesActivas}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Mesas Ocupadas</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.mesasOcupadas} / {stats.totalMesas}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Órdenes Hoy</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalOrdenes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Ventas Hoy</h3>
          <p className="text-3xl font-bold text-gray-800">${stats.ventasHoy.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista de órdenes activas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Órdenes Activas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesero</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenesActivas.map((orden) => (
                <tr key={orden.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{orden.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orden.mesa}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orden.mesero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orden.productos}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${orden.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatearHora(orden.hora)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;