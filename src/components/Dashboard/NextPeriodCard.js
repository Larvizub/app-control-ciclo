// src/components/Dashboard/NextPeriodCard.js
import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const NextPeriodCard = ({ predictions }) => {
  if (!predictions) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Próximo Período</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Registra más períodos para obtener predicciones</p>
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
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '⏰'
      };
    } else if (daysUntilPeriod === 0) {
      return {
        status: 'today',
        message: 'Tu período debería comenzar hoy',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '🔴'
      };
    } else if (daysUntilPeriod <= 3) {
      return {
        status: 'soon',
        message: 'Tu período comenzará pronto',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: '🟠'
      };
    } else {
      return {
        status: 'normal',
        message: 'Próximo período predicho',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '📅'
      };
    }
  };

  const periodStatus = getPeriodStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Próximo Período</h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* Predicción del período */}
        <div className={`${periodStatus.bgColor} rounded-lg p-4`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{periodStatus.icon}</span>
            <div className="flex-1">
              <p className={`font-semibold ${periodStatus.color}`}>
                {periodStatus.message}
              </p>
              <p className="text-sm text-gray-600">
                {format(nextPeriodDate, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${periodStatus.color}`}>
                {Math.abs(daysUntilPeriod)}
              </div>
              <div className="text-sm text-gray-500">
                {daysUntilPeriod < 0 ? 'días tarde' : 
                 daysUntilPeriod === 0 ? 'hoy' : 'días'}
              </div>
            </div>
          </div>
        </div>

        {/* Información de ovulación */}
        {daysUntilOvulation >= 0 && daysUntilOvulation <= 14 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🥚</span>
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">
                  {daysUntilOvulation === 0 ? 'Ovulación hoy' : 
                   daysUntilOvulation === 1 ? 'Ovulación mañana' : 
                   `Ovulación en ${daysUntilOvulation} días`}
                </p>
                <p className="text-sm text-yellow-600">
                  {format(ovulationDate, "d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ventana fértil */}
        {predictions.fertileWindow && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-xl">💚</span>
              <div className="flex-1">
                <p className="font-semibold text-green-800">
                  Ventana Fértil
                </p>
                <p className="text-sm text-green-600">
                  {format(parseISO(predictions.fertileWindow.startDate), "d", { locale: es })} - {' '}
                  {format(parseISO(predictions.fertileWindow.endDate), "d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consejos basados en la fase */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">💡</span>
            <span className="font-semibold text-purple-900">
              Preparación
            </span>
          </div>
          <div className="text-sm text-purple-700 space-y-1">
            {daysUntilPeriod <= 7 && daysUntilPeriod > 0 && (
              <>
                <p>• Ten a mano productos de higiene menstrual</p>
                <p>• Mantén una dieta balanceada</p>
                <p>• Hidrátate bien</p>
              </>
            )}
            {daysUntilPeriod <= 0 && (
              <>
                <p>• Considera hacer una prueba de embarazo</p>
                <p>• Consulta con tu médico si el retraso continúa</p>
                <p>• Mantén el registro de síntomas</p>
              </>
            )}
          </div>
        </div>

        {/* Precisión de la predicción */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Actualizado: {format(parseISO(predictions.updatedAt), 'HH:mm')}</span>
          </div>
          <span>Predicción basada en tu historial</span>
        </div>
      </div>
    </div>
  );
};

export default NextPeriodCard;
