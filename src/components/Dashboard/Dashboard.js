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
import { Sparkles, TrendingUp, Calendar } from 'lucide-react';
import SymptomModal from '../Modals/SymptomModal';
import QuickNoteModal from '../Modals/QuickNoteModal';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { 
    predictions, 
    getDayData, 
    periods, 
    symptoms, 
    loading,
    addSymptom,
    addQuickNote
  } = useCycle();
  
  const [todayData, setTodayData] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [openSymptomModal, setOpenSymptomModal] = useState(false);
  const [openNoteModal, setOpenNoteModal] = useState(false);

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

  const handleSaveSymptom = async (payload) => {
    if (addSymptom) return addSymptom(payload);
    console.log('Guardar síntoma (payload):', payload);
  };

  const handleSaveNote = async (payload) => {
    if (addQuickNote) return addQuickNote(payload);
    console.log('Guardar nota rápida (payload):', payload);
  };

  // Enlace seguro y puntual a botones existentes (sin observers globales).
  // 1) Si QuickActions acepta props onOpenSymptom/onOpenQuickNote lo usará.
  // 2) Si los botones están fuera, este efecto busca selectores específicos y añade handler.
  useEffect(() => {
    // síntomas
    const symptomSelector = '[data-action="open-symptom-modal"], [aria-label="Registrar síntomas"], button[title="Registrar síntomas"]';
    const symEl = document.querySelector(symptomSelector);
    if (symEl && symEl.dataset.boundSymptom !== '1') {
      const h = () => setOpenSymptomModal(true);
      symEl.addEventListener('click', h);
      symEl.dataset.boundSymptom = '1';
      return () => {
        try { symEl.removeEventListener('click', h); delete symEl.dataset.boundSymptom; } catch (e) {}
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    // nota rápida
    const noteSelector = '[data-action="open-note-modal"], [aria-label="Nota rápida"], button[title="Nota rápida"]';
    const noteEl = document.querySelector(noteSelector);
    if (noteEl && noteEl.dataset.boundNote !== '1') {
      const h2 = () => setOpenNoteModal(true);
      noteEl.addEventListener('click', h2);
      noteEl.dataset.boundNote = '1';
      return () => {
        try { noteEl.removeEventListener('click', h2); delete noteEl.dataset.boundNote; } catch (e) {}
      };
    }
    return undefined;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 animate-spin"></div>
            <div className="absolute inset-1 rounded-full bg-white"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header moderno con glassmorphism */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
                <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
            {/* pasar handlers a QuickActions para que use los botones internos si soporta props */}
            <QuickActions onOpenSymptom={() => setOpenSymptomModal(true)} onOpenQuickNote={() => setOpenNoteModal(true)} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-6">
            {/* Información del día actual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <TodayCard data={todayData} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <NextPeriodCard predictions={predictions} />
              </div>
            </div>

            {/* Mapa del ciclo */}
            <div className="animate-slide-up bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 lg:p-8" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Tu Ciclo Menstrual
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700">
                      Interactivo
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Visualiza y comprende tu ciclo</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <CycleMapVisual />
            </div>

            {/* Insights */}
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <InsightsCard />
            </div>
          </div>

          {/* Sidebar derecha */}
          <div className="lg:col-span-4 space-y-6">
            {/* Rastreador de síntomas */}
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <SymptomTracker />
            </div>

            {/* Recordatorios con diseño moderno */}
            <div className="animate-slide-up bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6" style={{ animationDelay: '300ms' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🔔</span>
                Recordatorios
              </h3>
              <div className="space-y-3">
                {predictions?.nextPeriod && (
                  <div className="group flex items-center p-4 bg-gradient-to-r from-primary-50 to-pink-50 rounded-2xl border border-primary-100/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full mr-4 group-hover:animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-primary-900">
                        Próximo período
                      </p>
                      <p className="text-xs text-primary-600">
                        {format(new Date(predictions.nextPeriod.startDate), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  data-action="open-symptom-modal"
                  onClick={() => setOpenSymptomModal(true)}
                  className="group flex items-center w-full text-left p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  aria-label="Registrar síntomas"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-4 group-hover:animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">Registrar síntomas</p>
                    <p className="text-xs text-blue-600">No olvides registrar cómo te sientes hoy</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Tips de salud con diseño mejorado */}
            <div className="animate-slide-up relative overflow-hidden bg-gradient-to-br from-secondary-100 via-primary-50 to-accent-50 rounded-3xl p-6 border border-white/60" style={{ animationDelay: '400ms' }}>
              {/* Decoración */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <h3 className="relative text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Tip del día
              </h3>
              <div className="relative space-y-3">
                {todayData?.phaseInfo?.tips?.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl">
                    <span className="text-secondary-500 mt-0.5">•</span>
                    <span className="text-sm text-secondary-800">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas rápidas con diseño moderno */}
            <div className="animate-slide-up bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6" style={{ animationDelay: '500ms' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Estadísticas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-600">Períodos registrados</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {periods.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-600">Síntomas registrados</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {symptoms.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-600">Duración promedio</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    28 días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SymptomModal isOpen={openSymptomModal} onClose={()=>setOpenSymptomModal(false)} onSave={handleSaveSymptom} />
      <QuickNoteModal isOpen={openNoteModal} onClose={()=>setOpenNoteModal(false)} onSave={handleSaveNote} />
    </div>
  );
};

export default Dashboard;
