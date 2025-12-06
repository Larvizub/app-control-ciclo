// src/components/Dashboard/TodayCard.js
import React from 'react';
import { Calendar, Circle, AlertCircle, Sparkles } from 'lucide-react';

const TodayCard = ({ data }) => {
  if (!data) {
    return (
      <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 hover:shadow-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Hoy</h3>
          <div className="p-2 bg-gray-100 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Registra tu primer período para comenzar</p>
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
    <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 hover:shadow-glow transition-all duration-300 group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">Hoy</h3>
          <Sparkles className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-2.5 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl">
          <Calendar className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Fase actual con diseño mejorado */}
        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl">
          <div 
            className="w-5 h-5 rounded-full flex-shrink-0 ring-4 ring-white shadow-md"
            style={{ backgroundColor: data.color }}
          ></div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getPhaseEmoji(data.phase)}</span>
              <span className="font-bold text-gray-900">
                {data.phaseInfo.name}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {getPhaseDescription(data.phase)}
            </p>
          </div>
        </div>

        {/* Estado del período */}
        {data.period && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <Circle className="w-4 h-4 text-red-500 fill-current" />
              </div>
              <div>
                <span className="text-sm font-semibold text-red-900">
                  Período activo
                </span>
                <p className="text-xs text-red-600 mt-0.5">
                  Flujo: {data.period.flow === 'light' ? 'Ligero' : 
                          data.period.flow === 'medium' ? 'Moderado' : 'Abundante'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Síntomas del día */}
        {data.symptoms.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/50">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              Síntomas registrados:
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.symptoms[0].symptoms.map((symptom, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-blue-700 text-xs font-medium rounded-full border border-blue-200/50 shadow-sm"
                >
                  {symptom}
                </span>
              ))}
            </div>
            {data.symptoms[0].mood && (
              <p className="text-xs text-blue-600 mt-3 flex items-center gap-1.5">
                <span className="text-sm">😊</span>
                Estado de ánimo: {data.symptoms[0].mood}
              </p>
            )}
          </div>
        )}

        {/* Predicción */}
        {data.isPredicted && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-amber-300 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-amber-900">
                  Predicción
                </span>
                <p className="text-xs text-amber-700 mt-0.5">
                  Este día está basado en predicciones de tu ciclo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consejos */}
        {data.phaseInfo.tips && data.phaseInfo.tips.length > 0 && (
          <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl p-4 border border-secondary-100/50">
            <h4 className="text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-2">
              <span>💡</span> Consejo para hoy:
            </h4>
            <p className="text-sm text-secondary-700 leading-relaxed">
              {data.phaseInfo.tips[0]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayCard;
