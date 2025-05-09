import React, { useState } from 'react';
import { OrdenResponse, MetodoPago, PagoCliente } from '../../../../services/ordenesService';

interface PaymentModalProps {
  orden: OrdenResponse;
  onClose: () => void;
  onPagar: (data: {
    metodo_pago?: MetodoPago;
    pagos_divididos?: PagoCliente[];
    notas?: string;
  }) => Promise<void>;
}

const PaymentMethodButton: React.FC<{
  method: MetodoPago;
  selected: boolean;
  onClick: () => void;
  label: string;
}> = ({ method, selected, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-md ${
      selected
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
    }`}
  >
    <span className="mr-2">
      {method === 'efectivo' ? '💵' : method === 'tarjeta' ? '💳' : '📱'}
    </span>
    {label}
  </button>
);

const PaymentModal: React.FC<PaymentModalProps> = ({ orden, onClose, onPagar }) => {
  const [modoPagoDividido, setModoPagoDividido] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [pagosDivididos, setPagosDivididos] = useState<PagoCliente[]>([]);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPagoDividido = () => {
    setPagosDivididos([
      ...pagosDivididos,
      { cliente_numero: pagosDivididos.length + 1, monto: 0 }
    ]);
  };

  const handleUpdatePagoDividido = (index: number, field: keyof PagoCliente, value: any) => {
    const newPagos = [...pagosDivididos];
    newPagos[index] = { ...newPagos[index], [field]: value };
    setPagosDivididos(newPagos);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = modoPagoDividido
        ? { pagos_divididos: pagosDivididos, notas: notas || undefined }
        : { metodo_pago: metodoPago, notas: notas || undefined };

      await onPagar(data);
      onClose();
    } catch (error) {
      setError('Error al procesar el pago');
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold">
            Procesar Pago - Orden #{orden.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={!modoPagoDividido}
                onChange={() => setModoPagoDividido(false)}
                className="form-radio text-indigo-600"
              />
              <span className="ml-2">Pago completo</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={modoPagoDividido}
                onChange={() => setModoPagoDividido(true)}
                className="form-radio text-indigo-600"
              />
              <span className="ml-2">Dividir cuenta</span>
            </label>
          </div>

          {!modoPagoDividido ? (
            <div className="flex space-x-4">
              <PaymentMethodButton
                method="efectivo"
                selected={metodoPago === 'efectivo'}
                onClick={() => setMetodoPago('efectivo')}
                label="Efectivo"
              />
              <PaymentMethodButton
                method="tarjeta"
                selected={metodoPago === 'tarjeta'}
                onClick={() => setMetodoPago('tarjeta')}
                label="Tarjeta"
              />
              <PaymentMethodButton
                method="transferencia"
                selected={metodoPago === 'transferencia'}
                onClick={() => setMetodoPago('transferencia')}
                label="Transferencia"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {pagosDivididos.map((pago, index) => (
                <div key={index} className="flex space-x-4 items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Cliente {pago.cliente_numero}
                  </span>
                  <input
                    type="number"
                    value={pago.monto}
                    onChange={(e) => handleUpdatePagoDividido(index, 'monto', parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Monto"
                    step="0.01"
                  />
                  <select
                    value={pago.metodo_pago}
                    onChange={(e) => handleUpdatePagoDividido(index, 'metodo_pago', e.target.value as MetodoPago)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Método de pago</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              ))}
              <button
                onClick={handleAddPagoDividido}
                className="text-indigo-600 hover:text-indigo-700"
              >
                + Agregar cliente
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Agregar notas sobre el pago..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Procesar Pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
