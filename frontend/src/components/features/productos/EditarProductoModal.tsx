import React, { useState } from 'react';
import { Producto } from '../../../types';

interface EditarProductoModalProps {
  producto: Producto;
  onSave: (productoData: Partial<Producto>) => Promise<void>;
  onClose: () => void;
  categorias: string[];
}

const EditarProductoModal: React.FC<EditarProductoModalProps> = ({
  producto,
  onSave,
  onClose,
  categorias
}) => {
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    categoria: producto.categoria,
    stock_minimo: producto.stock_minimo,
    disponible: producto.disponible
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }

    const precio = Number(formData.precio);
    if (isNaN(precio) || precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    const stockMin = Number(formData.stock_minimo);
    if (isNaN(stockMin) || stockMin < 0) {
      newErrors.stock_minimo = 'El stock mínimo debe ser 0 o mayor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Producto, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.nombre ? 'border-red-500' : ''
              }`}
              required
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precio || ''}
                onChange={(e) => handleInputChange('precio', parseFloat(e.target.value))}
                className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.precio ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.precio && (
                <p className="mt-1 text-sm text-red-600">{errors.precio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.categoria || ''}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.categoria ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Mínimo
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_minimo || ''}
              onChange={(e) => handleInputChange('stock_minimo', parseInt(e.target.value))}
              className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.stock_minimo ? 'border-red-500' : ''
              }`}
              required
            />
            {errors.stock_minimo && (
              <p className="mt-1 text-sm text-red-600">{errors.stock_minimo}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => handleInputChange('disponible', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="disponible" className="ml-2 block text-sm text-gray-900">
              Producto disponible
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProductoModal;