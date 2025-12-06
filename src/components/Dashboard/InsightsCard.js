// src/components/Dashboard/InsightsCard.js
import React from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { TrendingUp, Calendar, Clock, Heart, Sparkles, Lightbulb } from 'lucide-react';
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
        return 'text-emerald-600 bg-gradient-to-r from-emerald-100 to-green-100';
      case 'Moderadamente irregular':
        return 'text-amber-600 bg-gradient-to-r from-amber-100 to-yellow-100';
      case 'Irregular':
        return 'text-rose-600 bg-gradient-to-r from-rose-100 to-red-100';
      default:
        return 'text-gray-600 bg-gradient-to-r from-gray-100 to-slate-100';
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
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 hover:shadow-glow transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Insights de tu Ciclo
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Análisis personalizado
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Duración promedio del ciclo */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            {insights.avgCycleLength}
          </p>
          <p className="text-xs text-gray-600 font-medium">
            días promedio de ciclo
          </p>
        </div>

        {/* Duración promedio del período */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 text-center hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-1">
            {insights.avgPeriodLength}
          </p>
          <p className="text-xs text-gray-600 font-medium">
            días promedio de período
          </p>
        </div>

        {/* Consistencia */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className={`text-sm font-bold px-3 py-1.5 rounded-full inline-block ${getConsistencyColor(insights.cycleConsistency)}`}>
            {insights.cycleConsistency}
          </p>
          <p className="text-xs text-gray-600 mt-2 font-medium">
            consistencia del ciclo
          </p>
        </div>

        {/* Síntoma más común */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 text-center hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="text-2xl">😵</span>
          </div>
          <p className="text-sm font-bold text-gray-900 mb-1">
            {insights.mostCommonSymptom 
              ? getSymptomName(insights.mostCommonSymptom)
              : 'Sin datos'
            }
          </p>
          <p className="text-xs text-gray-600 font-medium">
            síntoma más frecuente
          </p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="mt-6 p-5 bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-indigo-50/80 rounded-2xl border border-white/60">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          Recomendaciones personalizadas
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          {insights.cycleConsistency === 'Irregular' && (
            <div className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
              <span className="text-rose-500">•</span>
              <p>Considera consultar con un especialista sobre la irregularidad de tu ciclo</p>
            </div>
          )}
          {insights.avgCycleLength < 21 && (
            <div className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
              <span className="text-amber-500">•</span>
              <p>Tu ciclo es más corto que el promedio, mantén un registro detallado</p>
            </div>
          )}
          {insights.avgCycleLength > 35 && (
            <div className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
              <span className="text-amber-500">•</span>
              <p>Tu ciclo es más largo que el promedio, considera consultar con un médico</p>
            </div>
          )}
          {insights.mostCommonSymptom === 'cramps' && (
            <div className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
              <span className="text-purple-500">•</span>
              <p>Para los cólicos, prueba ejercicio suave y aplicar calor</p>
            </div>
          )}
          {periods.length < 3 && (
            <div className="flex items-start gap-2 bg-white/60 rounded-xl p-3">
              <span className="text-blue-500">•</span>
              <p>Registra más períodos para obtener insights más precisos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
