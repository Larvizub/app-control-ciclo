// src/components/Tracking/Tracking.js
import React, { useState } from 'react';
import { Activity, TrendingUp, Calendar, Plus } from 'lucide-react';
import { useCycle } from '../../contexts/CycleContext';
import PeriodModal from '../Modals/PeriodModal';
import SymptomTracker from '../Dashboard/SymptomTracker';

const Tracking = () => {
  const { periods, symptoms } = useCycle();
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Seguimiento</h1>
            </div>
            <button
              onClick={() => setShowPeriodModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Período</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seguimiento de síntomas */}
          <div className="lg:col-span-2">
            <SymptomTracker />
            
            {/* Historial de períodos */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Historial de Períodos</h2>
              
              {periods.length > 0 ? (
                <div className="space-y-4">
                  {periods.slice(0, 5).map((period, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(period.startDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Flujo: {period.flow === 'light' ? 'Ligero' : 
                                    period.flow === 'medium' ? 'Moderado' : 'Abundante'}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {period.endDate ? 
                          `${Math.ceil((new Date(period.endDate) - new Date(period.startDate)) / (1000 * 60 * 60 * 24)) + 1} días` :
                          'En curso'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No has registrado ningún período aún</p>
                  <button
                    onClick={() => setShowPeriodModal(true)}
                    className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Registra tu primer período
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total períodos</span>
                  <span className="text-lg font-semibold text-gray-900">{periods.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Síntomas registrados</span>
                  <span className="text-lg font-semibold text-gray-900">{symptoms.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duración promedio</span>
                  <span className="text-lg font-semibold text-gray-900">28 días</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Progreso
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                ¡Excelente! Has registrado información valiosa sobre tu ciclo.
              </p>
              <div className="bg-white rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Completitud del perfil</span>
                  <span className="font-semibold text-purple-600">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showPeriodModal && (
        <PeriodModal 
          isOpen={showPeriodModal}
          onClose={() => setShowPeriodModal(false)}
        />
      )}
    </div>
  );
};

export default Tracking;
