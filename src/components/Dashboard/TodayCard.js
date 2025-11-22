// src/components/Dashboard/TodayCard.js
import React from 'react';
import { Calendar, Circle, AlertCircle } from 'lucide-react';

const TodayCard = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hoy</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Registra tu primer período para comenzar</p>
        </div>
      </div>
    );
  }

  const getPhaseEmoji = (phase) => {
    const emojis = {
      menstruation: '🔴',
      follicular: '🌱',
      fertile: '💚',
      ovulation: '🥚',
      luteal: '💜',
      unknown: '❓',
      late: '⏰'
    };
    return emojis[phase] || '❓';
  };

  const getPhaseDescription = (phase) => {
    const descriptions = {
      menstruation: 'Es tu período menstrual',
      follicular: 'Tu cuerpo se prepara para ovular',
      fertile: 'Ventana fértil activa',
      ovulation: 'Día de ovulación',
      luteal: 'Fase post-ovulación',
      unknown: 'Necesitamos más datos',
      late: 'Tu período se ha retrasado'
    };
    return descriptions[phase] || 'Fase desconocida';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Hoy</h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* Fase actual */}
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: data.color }}
          ></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getPhaseEmoji(data.phase)}</span>
              <span className="font-semibold text-gray-900">
                {data.phaseInfo.name}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {getPhaseDescription(data.phase)}
            </p>
          </div>
        </div>

        {/* Estado del período */}
        {data.period && (
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Circle className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm font-medium text-red-900">
                Período activo
              </span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Flujo: {data.period.flow === 'light' ? 'Ligero' : 
                      data.period.flow === 'medium' ? 'Moderado' : 'Abundante'}
            </p>
          </div>
        )}

        {/* Síntomas del día */}
        {data.symptoms.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Síntomas registrados:
            </h4>
            <div className="flex flex-wrap gap-1">
              {data.symptoms[0].symptoms.map((symptom, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {symptom}
                </span>
              ))}
            </div>
            {data.symptoms[0].mood && (
              <p className="text-xs text-blue-700 mt-2">
                Estado de ánimo: {data.symptoms[0].mood}
              </p>
            )}
          </div>
        )}

        {/* Predicción */}
        {data.isPredicted && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-900">
                Predicción
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Este día está basado en predicciones de tu ciclo
            </p>
          </div>
        )}

        {/* Consejos */}
        {data.phaseInfo.tips && data.phaseInfo.tips.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-purple-900 mb-2">
              💡 Consejo para hoy:
            </h4>
            <p className="text-xs text-purple-700">
              {data.phaseInfo.tips[0]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayCard;
