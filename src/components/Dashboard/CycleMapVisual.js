// src/components/Dashboard/CycleMapVisual.js
import React, { useMemo, useState } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { 
  addDays, 
  subDays, 
  format, 
  differenceInDays,
  isSameDay,
  startOfDay,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';

const CycleMapVisual = () => {
  const { getDayData, periods, predictions } = useCycle();
  const [activeView, setActiveView] = useState('timeline');

  // Calcular datos del ciclo para los últimos 90 días
  const cycleData = useMemo(() => {
    const startDate = subDays(new Date(), 90);
    const endDate = new Date();
    const totalDays = differenceInDays(endDate, startDate);
    const today = startOfDay(new Date());
    
    const days = [];
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = addDays(startDate, i);
      const dayData = getDayData(currentDate);
      days.push({
        date: currentDate,
        dayData,
        isToday: isSameDay(currentDate, today),
        dayNumber: format(currentDate, 'd'),
        month: format(currentDate, 'MMM', { locale: es })
      });
    }
    
    return days;
  }, [getDayData]);

  // Crear un calendario circular/visual - EXACTO A LA IMAGEN DE REFERENCIA
  const renderCircularView = () => {
    const radius = 110;
    const centerX = 160;
    const centerY = 160;
    const totalDays = 28;
    
    // Obtener el día actual del ciclo basado en datos reales
    const getCurrentCycleDay = () => {
      if (periods.length === 0) return 1;
      
      const lastPeriod = periods[periods.length - 1];
      const lastPeriodDate = new Date(lastPeriod.startDate);
      const today = new Date();
      const daysSinceLastPeriod = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24));
      
      return Math.max(1, Math.min(28, daysSinceLastPeriod + 1));
    };
    
    const currentDay = getCurrentCycleDay();
    
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative" style={{ width: '320px', height: '320px' }}>
          <svg width="320" height="320" className="absolute inset-0">
            {/* Círculo exterior de referencia */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Días del ciclo */}
            {Array.from({ length: totalDays }, (_, i) => {
              // Empezar desde la parte superior (día 1) y seguir en sentido horario
              const angle = (i / totalDays) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              const dayNumber = i + 1;
              
              // Colores exactos según la imagen de referencia
              let phaseColor = '#e5e7eb';
              
              if (dayNumber >= 1 && dayNumber <= 5) {
                // Menstruación - rojo intenso
                phaseColor = '#dc2626';
              } else if (dayNumber >= 6 && dayNumber <= 13) {
                // Fase folicular - verde
                phaseColor = '#059669';
              } else if (dayNumber >= 14 && dayNumber <= 16) {
                // Ovulación - amarillo/naranja
                phaseColor = '#d97706';
              } else {
                // Fase lútea - púrpura
                phaseColor = '#7c3aed';
              }
              
              const isCurrentDay = dayNumber === currentDay;
              
              return (
                <g key={i}>
                  {/* Punto del día - más pequeño y consistente */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isCurrentDay ? "6" : "4"}
                    fill={phaseColor}
                    className="cursor-pointer transition-all duration-200"
                    style={{ 
                      filter: isCurrentDay ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))' : 'none',
                      stroke: isCurrentDay ? '#3b82f6' : 'white',
                      strokeWidth: isCurrentDay ? '2' : '0.5'
                    }}
                  />
                  
                  {/* Número del día - posicionado fuera del círculo */}
                  <text
                    x={centerX + Math.cos(angle) * (radius + 15)}
                    y={centerY + Math.sin(angle) * (radius + 15) + 1}
                    textAnchor="middle"
                    className="font-medium pointer-events-none"
                    style={{ 
                      fontSize: '11px',
                      fill: isCurrentDay ? '#3b82f6' : '#6b7280',
                      fontWeight: isCurrentDay ? '700' : '500'
                    }}
                  >
                    {dayNumber}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Centro del círculo - diseño exacto a la imagen */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="text-center bg-white rounded-full shadow-lg border border-gray-200 flex flex-col items-center justify-center"
              style={{ 
                width: '140px', 
                height: '140px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Día actual grande */}
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {currentDay}
              </div>
              
              {/* Texto "Día del ciclo" */}
              <div className="text-xs text-gray-500 mb-2">
                día del ciclo
              </div>
              
              {/* Fase actual con color */}
              <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                currentDay >= 1 && currentDay <= 5 ? 'text-red-700 bg-red-100' :
                currentDay >= 6 && currentDay <= 13 ? 'text-green-700 bg-green-100' :
                currentDay >= 14 && currentDay <= 16 ? 'text-orange-700 bg-orange-100' :
                'text-purple-700 bg-purple-100'
              }`}>
                {currentDay >= 1 && currentDay <= 5 ? 'Menstruación' :
                 currentDay >= 6 && currentDay <= 13 ? 'Folicular' :
                 currentDay >= 14 && currentDay <= 16 ? 'Ovulación' :
                 'Lútea'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Leyenda de colores - exacta a la imagen */}
        <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-md">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-gray-700">Menstruación</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-700">Folicular</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span className="text-gray-700">Ovulación</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-gray-700">Lútea</span>
          </div>
        </div>
      </div>
    );
  };

  // Vista de timeline moderna
  const renderTimelineView = () => {
    const recentDays = cycleData.slice(-30); // Últimos 30 días
    
    // Función para determinar la fase basada en la fecha y los períodos
    const getPhaseForDate = (date) => {
      if (periods.length === 0) return 'unknown';
      
      // Encontrar el período más cercano antes de esta fecha
      const datePeriods = periods.filter(p => new Date(p.startDate) <= date);
      if (datePeriods.length === 0) return 'unknown';
      
      const lastPeriod = datePeriods[datePeriods.length - 1];
      const lastPeriodDate = new Date(lastPeriod.startDate);
      const daysSincePeriod = Math.floor((date - lastPeriodDate) / (1000 * 60 * 60 * 24));
      
      if (daysSincePeriod >= 0 && daysSincePeriod < 5) {
        return 'period';
      } else if (daysSincePeriod >= 5 && daysSincePeriod < 13) {
        return 'follicular';
      } else if (daysSincePeriod >= 13 && daysSincePeriod < 16) {
        return 'ovulation';
      } else if (daysSincePeriod >= 16 && daysSincePeriod < 28) {
        return 'luteal';
      } else {
        return 'unknown';
      }
    };
    
    return (
      <div className="space-y-4">
        {/* Timeline de días */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {recentDays.map((day, index) => {
            // Determinar el color de fondo basado en la fase real
            const phase = getPhaseForDate(day.date);
            let bgColor = '#f3f4f6'; // Gris por defecto
            let textColor = '#374151';
            let borderColor = 'transparent';
            
            switch(phase) {
              case 'period':
                bgColor = '#dc2626'; // Mismo rojo que la vista circular
                textColor = 'white';
                break;
              case 'follicular':
                bgColor = '#059669'; // Mismo verde que la vista circular
                textColor = 'white';
                break;
              case 'ovulation':
                bgColor = '#d97706'; // Mismo naranja que la vista circular
                textColor = 'white';
                break;
              case 'luteal':
                bgColor = '#7c3aed'; // Mismo púrpura que la vista circular
                textColor = 'white';
                break;
              default:
                bgColor = '#9ca3af';
                textColor = 'white';
            }
            
            if (day.isToday) {
              borderColor = '#3b82f6';
            }
            
            return (
              <div
                key={index}
                className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold
                  transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-md
                  ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
                style={{ 
                  backgroundColor: bgColor,
                  color: textColor,
                  border: `2px solid ${borderColor}`
                }}
                title={`${format(day.date, 'd MMM yyyy', { locale: es })} - ${
                  phase === 'period' ? 'Menstruación' :
                  phase === 'follicular' ? 'Fase Folicular' :
                  phase === 'ovulation' ? 'Ovulación' :
                  phase === 'luteal' ? 'Fase Lútea' :
                  'Sin datos'
                }`}
              >
                {day.dayNumber}
              </div>
            );
          })}
        </div>
        
        {/* Información de fases con diseño mejorado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <div className="w-4 h-4 bg-red-600 rounded-full flex-shrink-0"></div>
            <div>
              <div className="text-sm font-semibold text-red-900">Menstruación</div>
              <div className="text-xs text-red-700">Días 1-5</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></div>
            <div>
              <div className="text-sm font-semibold text-green-900">Folicular</div>
              <div className="text-xs text-green-700">Días 6-13</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
            <div className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0"></div>
            <div>
              <div className="text-sm font-semibold text-orange-900">Ovulación</div>
              <div className="text-xs text-orange-700">Días 14-16</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-4 h-4 bg-purple-600 rounded-full flex-shrink-0"></div>
            <div>
              <div className="text-sm font-semibold text-purple-900">Lútea</div>
              <div className="text-xs text-purple-700">Días 17-28</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vista de estadísticas
  const renderStatsView = () => {
    const totalPeriods = periods.length;
    const averageCycleLength = totalPeriods > 1 ? 28 : 0; // Simplificado
    const nextPeriod = predictions?.nextPeriod;
    
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
          <div className="text-2xl font-bold text-pink-600">{totalPeriods}</div>
          <div className="text-sm text-pink-800">Períodos registrados</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{averageCycleLength}</div>
          <div className="text-sm text-blue-800">Días promedio</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <div className="text-2xl font-bold text-purple-600">
            {nextPeriod ? differenceInDays(parseISO(nextPeriod.startDate), new Date()) : '--'}
          </div>
          <div className="text-sm text-purple-800">Días hasta próximo</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pestañas para cambiar vista */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button 
          onClick={() => setActiveView('timeline')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
            activeView === 'timeline' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Timeline
        </button>
        <button 
          onClick={() => setActiveView('circular')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
            activeView === 'circular' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Circular
        </button>
        <button 
          onClick={() => setActiveView('stats')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
            activeView === 'stats' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Estadísticas
        </button>
      </div>
      
      {/* Contenido dinámico según la vista activa */}
      {activeView === 'timeline' && renderTimelineView()}
      {activeView === 'circular' && renderCircularView()}
      {activeView === 'stats' && renderStatsView()}
      
      {/* Predicciones - siempre visible */}
      {predictions?.nextPeriod && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Próximo período</h4>
              <p className="text-sm text-gray-600">
                {format(parseISO(predictions.nextPeriod.startDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-600">
                {Math.max(0, differenceInDays(parseISO(predictions.nextPeriod.startDate), new Date()))}
              </div>
              <div className="text-xs text-gray-600">días restantes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleMapVisual;