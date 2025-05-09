import React, { useState, useEffect } from 'react';

interface SystemSettings {
  timezone: string;
  currency: string;
  payment_methods: string[];
  tax_rate: number;
  auto_logout_minutes: number;
  order_prefix: string;
  order_sequence_start: number;
  table_count: number;
  allow_split_payments: boolean;
  require_stock_control: boolean;
}

const SystemConfig: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    timezone: 'America/Hermosillo',
    currency: 'MXN',
    payment_methods: ['efectivo', 'tarjeta', 'transferencia'],
    tax_rate: 16,
    auto_logout_minutes: 30,
    order_prefix: 'ORD',
    order_sequence_start: 1000,
    table_count: 20,
    allow_split_payments: true,
    require_stock_control: true
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const timezones = [
    { id: 'America/Hermosillo', label: 'Hermosillo (UTC-7)' },
    { id: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
    { id: 'America/Tijuana', label: 'Tijuana (UTC-8)' }
  ];

  const currencies = [
    { id: 'MXN', label: 'Peso Mexicano (MXN)' },
    { id: 'USD', label: 'Dólar Estadounidense (USD)' }
  ];

  const paymentMethods = [
    { id: 'efectivo', label: 'Efectivo' },
    { id: 'tarjeta', label: 'Tarjeta' },
    { id: 'transferencia', label: 'Transferencia' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Error al cargar la configuración');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        showMessage('success', 'Configuración guardada exitosamente');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración del Sistema</h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {/* Regional Settings */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Regional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona Horaria
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {timezones.map(tz => (
                    <option key={tz.id} value={tz.id}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {currencies.map(currency => (
                    <option key={currency.id} value={currency.id}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Pagos</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Métodos de Pago Aceptados
                </label>
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <label key={method.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.payment_methods.includes(method.id)}
                        onChange={(e) => {
                          const newMethods = e.target.checked
                            ? [...settings.payment_methods, method.id]
                            : settings.payment_methods.filter(m => m !== method.id);
                          setSettings({ ...settings, payment_methods: newMethods });
                        }}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa de Impuesto (%)
                </label>
                <input
                  type="number"
                  value={settings.tax_rate}
                  onChange={(e) => setSettings({ ...settings, tax_rate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Cierre de Sesión (minutos)
                </label>
                <input
                  type="number"
                  value={settings.auto_logout_minutes}
                  onChange={(e) => setSettings({ ...settings, auto_logout_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefijo de Órdenes
                </label>
                <input
                  type="text"
                  value={settings.order_prefix}
                  onChange={(e) => setSettings({ ...settings, order_prefix: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inicio de Secuencia de Órdenes
                </label>
                <input
                  type="number"
                  value={settings.order_sequence_start}
                  onChange={(e) => setSettings({ ...settings, order_sequence_start: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Mesas
                </label>
                <input
                  type="number"
                  value={settings.table_count}
                  onChange={(e) => setSettings({ ...settings, table_count: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allow_split_payments}
                  onChange={(e) => setSettings({ ...settings, allow_split_payments: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Permitir dividir pagos en una orden
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.require_stock_control}
                  onChange={(e) => setSettings({ ...settings, require_stock_control: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Requerir control de inventario
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white rounded-lg`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemConfig;