import React, { useState, useEffect } from 'react';
import { formatearHora } from '../../utils/dateUtils';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalOrdenes: number;
  ordenesActivas: number;
  ordenesCerradas: number;
  ordenesCanceladas: number;
  mesasOcupadas: number;
  totalMesas: number;
  ventasHoy: number;
  ventasUltimos7Dias: {
    fecha: string;
    total: number;
  }[];
  productosPopulares: {
    nombre: string;
    cantidad: number;
    total: number;
  }[];
  mesasStatus: {
    disponibles: number;
    ocupadas: number;
    mantenimiento: number;
  };
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
    ordenesCerradas: 0,
    ordenesCanceladas: 0,
    mesasOcupadas: 0,
    totalMesas: 0,
    ventasHoy: 0,
    ventasUltimos7Dias: [],
    productosPopulares: [],
    mesasStatus: {
      disponibles: 0,
      ocupadas: 0,
      mantenimiento: 0
    }
  });

  // Ensure ordenesActivas is an empty array initially
  const [ordenesActivas, setOrdenesActivas] = useState<OrdenActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsRefreshing(true);
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
        
        // Ensure we have proper number values
        setStats({
          ...data,
          totalOrdenes: Number(data.totalOrdenes) || 0,
          ordenesActivas: Number(data.ordenesActivas) || 0,
          ordenesCerradas: Number(data.ordenesCerradas) || 0,
          ordenesCanceladas: Number(data.ordenesCanceladas) || 0,
          mesasOcupadas: Number(data.mesasOcupadas) || 0,
          totalMesas: Number(data.totalMesas) || 0,
          ventasHoy: Number(data.ventasHoy) || 0,
          mesasStatus: {
            disponibles: Number(data.mesasStatus?.disponibles) || 0,
            ocupadas: Number(data.mesasStatus?.ocupadas) || 0,
            mantenimiento: Number(data.mesasStatus?.mantenimiento) || 0
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsRefreshing(false);
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
        
        // Ensure we transform any nested objects or format numbers
        setOrdenesActivas(data.map((orden: any) => ({
          id: Number(orden.id),
          mesa: String(orden.mesa),
          mesero: String(orden.mesero),
          total: Number(orden.total),
          productos: Number(orden.productos),
          hora: String(orden.hora)
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    fetchDashboardData();
    fetchOrdenesActivas();

    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchOrdenesActivas();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: stats.ventasUltimos7Dias.map(venta => venta.fecha),
    datasets: [
      {
        label: 'Ventas diarias',
        data: stats.ventasUltimos7Dias.map(venta => venta.total),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Ventas últimos 7 días'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: number | string) {
            return `$${Number(tickValue).toFixed(2)}`;
          }
        }
      }
    }
  } as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        {isRefreshing && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Actualizando datos...
          </div>
        )}
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Órdenes Hoy</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalOrdenes || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Ventas Hoy</h3>
          <p className="text-3xl font-bold text-indigo-600">${(stats.ventasHoy || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Estado de Órdenes</h3>
          <div className="flex justify-between mt-2">
            <div>
              <p className="text-sm text-gray-500">Activas</p>
              <p className="text-xl font-bold text-yellow-500">{stats.ordenesActivas || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cerradas</p>
              <p className="text-xl font-bold text-green-500">{stats.ordenesCerradas || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Canceladas</p>
              <p className="text-xl font-bold text-red-500">{stats.ordenesCanceladas || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Estado de Mesas</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-sm text-gray-500">Disponibles</p>
              <p className="text-xl font-bold text-green-500">{stats.mesasStatus?.disponibles || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ocupadas</p>
              <p className="text-xl font-bold text-red-500">{stats.mesasStatus?.ocupadas || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mantenimiento</p>
              <p className="text-xl font-bold text-gray-500">{stats.mesasStatus?.mantenimiento || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Gráfica de ventas */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Top 5 productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {stats.productosPopulares.slice(0, 5).map((producto, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{producto.nombre}</p>
                  <p className="text-sm text-gray-500">{producto.cantidad} unidades</p>
                </div>
                <p className="font-medium text-indigo-600">${producto.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de órdenes activas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Órdenes Activas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordenesActivas.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No hay órdenes activas en este momento
              </div>
            ) : (
              ordenesActivas.map((orden) => (
                <div 
                  key={orden.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-600">Orden #{orden.id}</span>
                        <h3 className="text-lg font-bold text-gray-900">Mesa {orden.mesa}</h3>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Activa
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Mesero</span>
                        <span className="font-medium text-gray-900">{orden.mesero}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Productos</span>
                        <span className="font-medium text-gray-900">{orden.productos}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hora</span>
                        <span className="font-medium text-gray-900">{formatearHora(orden.hora)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-2xl font-bold text-indigo-600">${Number(orden.total).toFixed(2)}</span>
                      <div className="flex space-x-2">
                        <button 
                          className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                          onClick={() => window.location.href = `/ordenes/${orden.id}`}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;