import React, { useState, useEffect } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { useAuth } from '../../contexts/AuthContext';
import CycleMapVisual from './CycleMapVisual';
import NextPeriodCard from './NextPeriodCard';
import TodayCard from './TodayCard';
import SymptomTracker from './SymptomTracker';
import InsightsCard from './InsightsCard';
import QuickActions from './QuickActions';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { 
    predictions, 
    getDayData, 
    periods, 
    symptoms, 
    loading 
  } = useCycle();
  
  const [todayData, setTodayData] = useState(null);
  const [greeting, setGreeting] = useState('');

  // Obtener datos del día actual
  useEffect(() => {
    const today = startOfDay(new Date());
    const data = getDayData(today);
    setTodayData(data);
  }, [getDayData]);

  // Configurar saludo personalizado
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      const name = userProfile?.name || currentUser?.displayName || 'Usuaria';
      
      if (hour < 12) {
        return `Buenos días, ${name}`;
      } else if (hour < 18) {
        return `Buenas tardes, ${name}`;
      } else {
        return `Buenas noches, ${name}`;
      }
    };

    setGreeting(getGreeting());
  }, [userProfile?.name, currentUser?.displayName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
              <p className="text-sm text-gray-600">
                Hoy es {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <QuickActions />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-8">
            {/* Información del día actual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TodayCard data={todayData} />
              <NextPeriodCard predictions={predictions} />
            </div>

            {/* Mapa del ciclo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tu Ciclo Menstrual
                </h2>
                <span className="text-sm text-gray-500">
                  Vista interactiva
                </span>
              </div>
              <CycleMapVisual />
            </div>

            {/* Insights */}
            <InsightsCard />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Rastreador de síntomas */}
            <SymptomTracker />

            {/* Recordatorios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recordatorios
              </h3>
              <div className="space-y-3">
                {predictions?.nextPeriod && (
                  <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-pink-900">
                        Próximo período
                      </p>
                      <p className="text-xs text-pink-700">
                        {format(new Date(predictions.nextPeriod.startDate), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Registrar síntomas
                    </p>
                    <p className="text-xs text-blue-700">
                      No olvides registrar cómo te sientes hoy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips de salud */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                💡 Tip del día
              </h3>
              <div className="space-y-3">
                {todayData?.phaseInfo?.tips?.map((tip, index) => (
                  <div key={index} className="text-sm text-purple-800">
                    • {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estadísticas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Períodos registrados</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {periods.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Síntomas registrados</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {symptoms.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duración promedio</span>
                  <span className="text-lg font-semibold text-gray-900">
                    28 días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
