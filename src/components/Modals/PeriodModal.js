// src/components/Modals/PeriodModal.js
import React, { useState } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { X, Calendar, Droplet } from 'lucide-react';
import { format } from 'date-fns';

const PeriodModal = ({ isOpen, onClose }) => {
  const { addPeriod } = useCycle();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState('medium');
  const [loading, setLoading] = useState(false);

  const flowOptions = [
    { value: 'light', label: 'Ligero', color: 'bg-red-200', description: 'Pocos productos necesarios' },
    { value: 'medium', label: 'Moderado', color: 'bg-red-400', description: 'Flujo normal' },
    { value: 'heavy', label: 'Abundante', color: 'bg-red-600', description: 'Cambios frecuentes de producto' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addPeriod(
        new Date(startDate), 
        endDate ? new Date(endDate) : null, 
        flow
      );
      onClose();
    } catch (error) {
      console.error('Error registrando período:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Droplet className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Registrar Período
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fecha de inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Fecha de fin (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha de fin (opcional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deja en blanco si tu período aún no ha terminado
            </p>
          </div>

          {/* Intensidad del flujo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Intensidad del flujo
            </label>
            <div className="space-y-3">
              {flowOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    flow === option.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="flow"
                    value={option.value}
                    checked={flow === option.value}
                    onChange={(e) => setFlow(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full ${option.color} mr-3`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  {flow === option.value && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Consejo
            </h4>
            <p className="text-sm text-blue-700">
              Registrar tu período ayuda a predecir futuros ciclos y identificar patrones en tu salud menstrual.
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Guardar período'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeriodModal;
