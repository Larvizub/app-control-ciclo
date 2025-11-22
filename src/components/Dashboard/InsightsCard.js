// src/components/Dashboard/InsightsCard.js
import React from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { TrendingUp, Calendar, Clock, Heart } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

const InsightsCard = () => {
  const { periods, symptoms, cycleSettings } = useCycle();

  // Calcular insights
  const calculateInsights = () => {
    if (periods.length < 2) {
      return {
        avgCycleLength: cycleSettings.averageCycleLength,
        avgPeriodLength: cycleSettings.averagePeriodLength,
        mostCommonSymptom: null,
        cycleConsistency: 'Insuficientes datos'
      };
    }

    // Calcular duración promedio del ciclo
    const cycleLengths = [];
    const sortedPeriods = periods.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const current = parseISO(sortedPeriods[i].startDate);
      const previous = parseISO(sortedPeriods[i + 1].startDate);
      const length = differenceInDays(current, previous);
      if (length > 0 && length < 60) {
        cycleLengths.push(length);
      }
    }

    const avgCycle = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
      : cycleSettings.averageCycleLength;

    // Calcular duración promedio del período
    const periodLengths = periods
      .filter(p => p.endDate)
      .map(p => differenceInDays(parseISO(p.endDate), parseISO(p.startDate)) + 1);
    
    const avgPeriod = periodLengths.length > 0
      ? Math.round(periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length)
      : cycleSettings.averagePeriodLength;

    // Síntoma más común
    const symptomCounts = {};
    symptoms.forEach(symptom => {
      symptom.symptoms.forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });

    const mostCommonSymptom = Object.keys(symptomCounts).length > 0
      ? Object.keys(symptomCounts).reduce((a, b) => symptomCounts[a] > symptomCounts[b] ? a : b)
      : null;

    // Consistencia del ciclo
    const getConsistency = () => {
      if (cycleLengths.length < 3) return 'Pocos datos';
      
      const variance = cycleLengths.reduce((sum, length) => {
        return sum + Math.pow(length - avgCycle, 2);
      }, 0) / cycleLengths.length;

      if (variance <= 4) return 'Muy regular';
      if (variance <= 9) return 'Regular';
      if (variance <= 16) return 'Moderadamente irregular';
      return 'Irregular';
    };

    return {
      avgCycleLength: avgCycle,
      avgPeriodLength: avgPeriod,
      mostCommonSymptom,
      cycleConsistency: getConsistency()
    };
  };

  const insights = calculateInsights();

  const getConsistencyColor = (consistency) => {
    switch (consistency) {
      case 'Muy regular':
      case 'Regular':
        return 'text-green-600 bg-green-50';
      case 'Moderadamente irregular':
        return 'text-yellow-600 bg-yellow-50';
      case 'Irregular':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSymptomName = (symptom) => {
    const symptoms = {
      'cramps': 'Cólicos',
      'headache': 'Dolor de cabeza',
      'bloating': 'Hinchazón',
      'acne': 'Acné',
      'breast_tenderness': 'Sensibilidad en senos',
      'fatigue': 'Fatiga',
      'mood_swings': 'Cambios de humor',
      'cravings': 'Antojos',
      'nausea': 'Náuseas',
      'back_pain': 'Dolor de espalda'
    };
    return symptoms[symptom] || symptom;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Insights de tu Ciclo
        </h2>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Duración promedio del ciclo */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {insights.avgCycleLength}
          </p>
          <p className="text-sm text-gray-600">
            días promedio de ciclo
          </p>
        </div>

        {/* Duración promedio del período */}
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {insights.avgPeriodLength}
          </p>
          <p className="text-sm text-gray-600">
            días promedio de período
          </p>
        </div>

        {/* Consistencia */}
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <p className={`text-sm font-semibold px-2 py-1 rounded-full ${getConsistencyColor(insights.cycleConsistency)}`}>
            {insights.cycleConsistency}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            consistencia del ciclo
          </p>
        </div>

        {/* Síntoma más común */}
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">😵</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {insights.mostCommonSymptom 
              ? getSymptomName(insights.mostCommonSymptom)
              : 'Sin datos'
            }
          </p>
          <p className="text-xs text-gray-600">
            síntoma más frecuente
          </p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          💡 Recomendaciones personalizadas
        </h3>
        <div className="space-y-1 text-sm text-gray-700">
          {insights.cycleConsistency === 'Irregular' && (
            <p>• Considera consultar con un especialista sobre la irregularidad de tu ciclo</p>
          )}
          {insights.avgCycleLength < 21 && (
            <p>• Tu ciclo es más corto que el promedio, mantén un registro detallado</p>
          )}
          {insights.avgCycleLength > 35 && (
            <p>• Tu ciclo es más largo que el promedio, considera consultar con un médico</p>
          )}
          {insights.mostCommonSymptom === 'cramps' && (
            <p>• Para los cólicos, prueba ejercicio suave y aplicar calor</p>
          )}
          {periods.length < 3 && (
            <p>• Registra más períodos para obtener insights más precisos</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
