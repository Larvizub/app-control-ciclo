// src/components/Modals/PeriodModal.js
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCycle } from '../../contexts/CycleContext';
import { X, Calendar, Droplet, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const PeriodModal = ({ isOpen, onClose }) => {
  const { addPeriod } = useCycle();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState('medium');
  const [loading, setLoading] = useState(false);

  const modalRootRef = useRef(null);
  const elRef = useRef(null);

  useEffect(() => {
    // Crear / obtener un contenedor #modal-root para todos los modales
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      // asegurarse que no interfiera con layout normal
      root.style.position = 'relative';
      document.body.appendChild(root);
    }
    modalRootRef.current = root;

    // elemento container para este modal
    if (!elRef.current) {
      elRef.current = document.createElement('div');
    }
    const el = elRef.current;
    modalRootRef.current.appendChild(el);

    return () => {
      // limpieza
      if (modalRootRef.current && elRef.current) {
        modalRootRef.current.removeChild(elRef.current);
      }
    };
  }, []);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  if (!isOpen || !modalRootRef.current) return null;

  const modalContent = (
    <div
      className="fixed inset-0 overflow-x-hidden"
      style={{ zIndex: 99999, pointerEvents: 'auto' }}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop con blur (captura sólo los clicks cuando está visible) */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'auto'
        }}
        onClick={onClose}
      />

      {/* Contenedor del modal centrado (asegurar pointer-events para que elementos interactúen) */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registrar Período</h2>
                <p className="text-sm text-gray-500">Añade tu información</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content con scroll */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-5 space-y-5 min-w-0">
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
                  className="w-full min-w-0 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition-all"
                  required
                />
              </div>

              {/* Fecha de fin */}
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
                  className="w-full min-w-0 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Deja en blanco si tu período aún no ha terminado
                </p>
              </div>

              {/* Intensidad del flujo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Intensidad del flujo
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'light', label: 'Ligero', gradient: 'from-red-200 to-pink-200', description: 'Pocos productos necesarios', emoji: '💧' },
                    { value: 'medium', label: 'Moderado', gradient: 'from-red-400 to-pink-400', description: 'Flujo normal', emoji: '💦' },
                    { value: 'heavy', label: 'Abundante', gradient: 'from-red-600 to-pink-600', description: 'Cambios frecuentes de producto', emoji: '🌊' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        flow === option.value
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
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
                      <div className={`w-10 h-10 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center mr-3 flex-shrink-0`}>
                          <span className="text-lg">{option.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      {flow === option.value && (
                        <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Consejo */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
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
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Guardando...
                    </span>
                  ) : (
                    'Guardar período'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, elRef.current);
};

export default PeriodModal;
