// src/components/Modals/PeriodModal.js
import React, { useState } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { X, Calendar, Droplet, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const PeriodModal = ({ isOpen, onClose }) => {
  const { addPeriod } = useCycle();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState('medium');
  const [loading, setLoading] = useState(false);

  const flowOptions = [
    { value: 'light', label: 'Ligero', gradient: 'from-red-200 to-pink-200', description: 'Pocos productos necesarios', emoji: '💧' },
    { value: 'medium', label: 'Moderado', gradient: 'from-red-400 to-pink-400', description: 'Flujo normal', emoji: '💦' },
    { value: 'heavy', label: 'Abundante', gradient: 'from-red-600 to-pink-600', description: 'Cambios frecuentes de producto', emoji: '🌊' }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto border border-white/60 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50/80 to-pink-50/80 rounded-t-3xl border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Registrar Período
              </h2>
              <p className="text-sm text-gray-500">Añade tu información</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fecha de inicio */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-pink-500" />
              Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-400 transition-all duration-300"
              required
            />
          </div>

          {/* Fecha de fin (opcional) */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-pink-500" />
              Fecha de fin (opcional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-400 transition-all duration-300"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Deja en blanco si tu período aún no ha terminado
            </p>
          </div>

          {/* Intensidad del flujo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Intensidad del flujo
            </label>
            <div className="space-y-3">
              {flowOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                    flow === option.value
                      ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-red-50 shadow-md scale-[1.02]'
                      : 'border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
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
                  <div className={`w-10 h-10 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center mr-4 shadow-sm`}>
                    <span className="text-lg">{option.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  {flow === option.value && (
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-md">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/60">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Consejo
            </h4>
            <p className="text-sm text-blue-700">
              Registrar tu período ayuda a predecir futuros ciclos y identificar patrones en tu salud menstrual.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-pink-500/30"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <span className="relative z-10">Guardar período</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeriodModal;
