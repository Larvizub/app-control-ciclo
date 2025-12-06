// src/components/Dashboard/NextPeriodCard.js
import React from 'react';
import { Calendar, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const NextPeriodCard = ({ predictions }) => {
  if (!predictions) {
    return (
      <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 hover:shadow-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Próximo Período</h3>
          <div className="p-2 bg-gray-100 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Registra más períodos para obtener predicciones</p>
        </div>
      </div>
    );
  }

  const nextPeriodDate = parseISO(predictions.nextPeriod.startDate);
  const daysUntilPeriod = differenceInDays(nextPeriodDate, new Date());
  const ovulationDate = parseISO(predictions.ovulation.date);
  const daysUntilOvulation = differenceInDays(ovulationDate, new Date());

  const getPeriodStatus = () => {
    if (daysUntilPeriod < 0) {
      return {
        status: 'late',
        message: 'Tu período se ha retrasado',
        textColor: 'text-red-600',
        bgGradient: 'from-red-50 to-rose-50',
        borderColor: 'border-red-100/50',
        numberBg: 'from-red-500 to-rose-500',
        icon: '⏰'
      };
    } else if (daysUntilPeriod === 0) {
      return {
        status: 'today',
        message: 'Tu período debería comenzar hoy',
        textColor: 'text-red-600',
        bgGradient: 'from-red-50 to-rose-50',
        borderColor: 'border-red-100/50',
        numberBg: 'from-red-500 to-rose-500',
        icon: '🔴'
      };
    } else if (daysUntilPeriod <= 3) {
      return {
        status: 'soon',
        message: 'Tu período comenzará pronto',
        textColor: 'text-orange-600',
        bgGradient: 'from-orange-50 to-amber-50',
        borderColor: 'border-orange-100/50',
        numberBg: 'from-orange-500 to-amber-500',
        icon: '🟠'
      };
    } else {
      return {
        status: 'normal',
        message: 'Próximo período predicho',
        textColor: 'text-primary-600',
        bgGradient: 'from-primary-50 to-pink-50',
        borderColor: 'border-primary-100/50',
        numberBg: 'from-primary-500 to-secondary-500',
        icon: '📅'
      };
    }
  };

  const periodStatus = getPeriodStatus();

  return (
    <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 hover:shadow-glow transition-all duration-300 group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">Próximo Período</h3>
          <Sparkles className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-2.5 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl">
          <Calendar className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Predicción del período */}
        <div className={`bg-gradient-to-r ${periodStatus.bgGradient} rounded-2xl p-4 border ${periodStatus.borderColor}`}>
          <div className="flex items-center space-x-4">
            <span className="text-3xl">{periodStatus.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${periodStatus.textColor}`}>
                {periodStatus.message}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {format(nextPeriodDate, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className={`w-14 h-14 bg-gradient-to-br ${periodStatus.numberBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-xl font-bold text-white">
                  {Math.abs(daysUntilPeriod)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1.5 font-medium">
                {daysUntilPeriod < 0 ? 'días tarde' : 
                 daysUntilPeriod === 0 ? 'hoy' : 'días'}
              </div>
            </div>
          </div>
        </div>

        {/* Información de ovulación */}
        {daysUntilOvulation >= 0 && daysUntilOvulation <= 14 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <span className="text-lg">🥚</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800">
                  {daysUntilOvulation === 0 ? 'Ovulación hoy' : 
                   daysUntilOvulation === 1 ? 'Ovulación mañana' : 
                   `Ovulación en ${daysUntilOvulation} días`}
                </p>
                <p className="text-sm text-amber-600">
                  {format(ovulationDate, "d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ventana fértil */}
        {predictions.fertileWindow && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <span className="text-lg">💚</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">
                  Ventana Fértil
                </p>
                <p className="text-sm text-emerald-600">
                  {format(parseISO(predictions.fertileWindow.startDate), "d", { locale: es })} - {' '}
                  {format(parseISO(predictions.fertileWindow.endDate), "d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consejos basados en la fase */}
        <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl p-4 border border-secondary-100/50">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">💡</span>
            <span className="font-semibold text-secondary-900">
              Preparación
            </span>
          </div>
          <div className="text-sm text-secondary-700 space-y-1.5">
            {daysUntilPeriod <= 7 && daysUntilPeriod > 0 && (
              <>
                <p className="flex items-center gap-2"><span className="text-secondary-400">•</span> Ten a mano productos de higiene</p>
                <p className="flex items-center gap-2"><span className="text-secondary-400">•</span> Mantén una dieta balanceada</p>
                <p className="flex items-center gap-2"><span className="text-secondary-400">•</span> Hidrátate bien</p>
              </>
            )}
            {daysUntilPeriod <= 0 && (
              <>
                <p className="flex items-center gap-2"><span className="text-secondary-400">•</span> Considera una prueba de embarazo</p>
                <p className="flex items-center gap-2"><span className="text-secondary-400">•</span> Consulta con tu médico si continúa</p>
                <p className="flex items-center gap-2"><span className="text-secondary-400">•</span> Mantén el registro de síntomas</p>
              </>
            )}
          </div>
        </div>

        {/* Precisión de la predicción */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 px-1">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Actualizado: {format(parseISO(predictions.updatedAt), 'HH:mm')}</span>
          </div>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Predicción IA
          </span>
        </div>
      </div>
    </div>
  );
};

export default NextPeriodCard;
