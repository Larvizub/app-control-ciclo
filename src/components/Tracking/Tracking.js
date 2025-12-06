// src/components/Tracking/Tracking.js
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, Calendar, Plus, Heart, Coffee, Gift, Moon, Sun, Sparkles, MessageSquare, Smile, Users, Lightbulb } from 'lucide-react';
import { useCycle } from '../../contexts/CycleContext';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { parseISO, differenceInDays } from 'date-fns';
import PeriodModal from '../Modals/PeriodModal';
import SymptomTracker from '../Dashboard/SymptomTracker';

// Componente para usuarios masculinos
const TrackingMale = () => {
  const { userProfile } = useAuth();
  const [partnerPeriods, setPartnerPeriods] = useState([]);
  const [partnerSymptoms, setPartnerSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos de la pareja
  const loadPartnerData = useCallback(() => {
    if (!userProfile?.partnerId) {
      setLoading(false);
      return;
    }

    const partnerId = userProfile.partnerId;

    const periodsRef = ref(database, `periods/${partnerId}`);
    onValue(periodsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
        setPartnerPeriods(data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
      } else {
        setPartnerPeriods([]);
      }
      setLoading(false);
    });

    const symptomsRef = ref(database, `symptoms/${partnerId}`);
    onValue(symptomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
        setPartnerSymptoms(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        setPartnerSymptoms([]);
      }
    });
  }, [userProfile?.partnerId]);

  useEffect(() => {
    loadPartnerData();
  }, [loadPartnerData]);

  // Calcular fase actual
  const getCurrentPhase = () => {
    if (!partnerPeriods.length) return null;
    
    const lastPeriod = partnerPeriods[0];
    const today = new Date();
    const periodStart = parseISO(lastPeriod.startDate);
    const dayOfCycle = differenceInDays(today, periodStart) + 1;
    const cycleLength = 28;
    
    if (dayOfCycle <= 0 || dayOfCycle > cycleLength + 7) return { phase: 'unknown', day: 0 };
    
    if (dayOfCycle <= 5) return { phase: 'menstruation', day: dayOfCycle, name: 'Menstruación', color: 'red', icon: '🔴', gradient: 'from-red-500 to-pink-500' };
    if (dayOfCycle <= 13) return { phase: 'follicular', day: dayOfCycle, name: 'Fase Folicular', color: 'green', icon: '🌱', gradient: 'from-green-500 to-emerald-500' };
    if (dayOfCycle <= 15) return { phase: 'ovulation', day: dayOfCycle, name: 'Ovulación', color: 'yellow', icon: '🥚', gradient: 'from-yellow-500 to-amber-500' };
    if (dayOfCycle <= cycleLength) return { phase: 'luteal', day: dayOfCycle, name: 'Fase Lútea', color: 'purple', icon: '🌙', gradient: 'from-purple-500 to-violet-500' };
    
    return { phase: 'late', day: dayOfCycle, name: 'Período Tardío', color: 'red', icon: '⚠️', gradient: 'from-red-500 to-orange-500' };
  };

  // Consejos según la fase
  const getPhaseAdvice = (phase) => {
    const advice = {
      menstruation: {
        title: 'Durante la Menstruación',
        description: 'Es momento de ser especialmente comprensivo y atento.',
        tips: [
          { icon: Coffee, text: 'Prepárale bebidas calientes, ayudan con los cólicos', color: 'text-amber-600' },
          { icon: Gift, text: 'Un pequeño detalle puede alegrar su día', color: 'text-pink-600' },
          { icon: Moon, text: 'Respeta si necesita más descanso', color: 'text-indigo-600' },
          { icon: Heart, text: 'Muestra empatía ante los cambios de humor', color: 'text-red-500' },
          { icon: Smile, text: 'Evita comentarios sobre su estado emocional', color: 'text-green-600' }
        ],
        doList: [
          'Ofrece un masaje en la espalda o abdomen',
          'Ten a mano analgésicos si los necesita',
          'Prepara comidas reconfortantes',
          'Sé paciente con los cambios de ánimo'
        ],
        dontList: [
          'No minimices cómo se siente',
          'Evita planear actividades muy demandantes',
          'No hagas comentarios sobre su apetito'
        ]
      },
      follicular: {
        title: 'Fase Folicular',
        description: 'Sus niveles de energía están aumentando. ¡Buen momento para actividades juntos!',
        tips: [
          { icon: Sun, text: 'Es buen momento para planear actividades al aire libre', color: 'text-yellow-600' },
          { icon: Activity, text: 'Proponle hacer ejercicio juntos', color: 'text-green-600' },
          { icon: MessageSquare, text: 'Su creatividad está alta, escucha sus ideas', color: 'text-blue-600' },
          { icon: Sparkles, text: 'Es un buen momento para proyectos nuevos', color: 'text-purple-600' },
          { icon: Heart, text: 'Aprovecha para tener conversaciones importantes', color: 'text-pink-600' }
        ],
        doList: [
          'Planea una cita o salida especial',
          'Apoya sus nuevos proyectos o ideas',
          'Hagan actividades físicas juntos',
          'Disfruten tiempo de calidad'
        ],
        dontList: [
          'No desperdicies su buena energía',
          'Evita ser negativo ante sus propuestas'
        ]
      },
      ovulation: {
        title: 'Período de Ovulación',
        description: 'Está en su punto máximo de energía y puede sentirse más sociable.',
        tips: [
          { icon: Heart, text: 'Es el momento de mayor conexión emocional', color: 'text-red-500' },
          { icon: Sparkles, text: 'Su confianza está en su punto más alto', color: 'text-yellow-600' },
          { icon: MessageSquare, text: 'Comunicación fluida, aprovecha para hablar', color: 'text-blue-600' },
          { icon: Sun, text: 'Energía alta, ideal para actividades sociales', color: 'text-orange-500' },
          { icon: Gift, text: 'Buen momento para sorpresas románticas', color: 'text-pink-600' }
        ],
        doList: [
          'Planea algo romántico y especial',
          'Halagos sinceros serán muy apreciados',
          'Es ideal para salir con amigos en pareja',
          'Demuestra tu admiración por ella'
        ],
        dontList: [
          'No ignores esta oportunidad de conexión',
          'Evita discusiones innecesarias'
        ]
      },
      luteal: {
        title: 'Fase Lútea (Pre-menstrual)',
        description: 'Puede experimentar síndrome premenstrual. Sé comprensivo.',
        tips: [
          { icon: Moon, text: 'Puede sentirse más cansada de lo normal', color: 'text-indigo-600' },
          { icon: Coffee, text: 'Antojos de comida son normales, no juzgues', color: 'text-amber-600' },
          { icon: Heart, text: 'Necesita más apoyo emocional', color: 'text-pink-600' },
          { icon: Smile, text: 'Paciencia con los cambios de humor', color: 'text-green-600' },
          { icon: Gift, text: 'Pequeños gestos significan mucho', color: 'text-purple-600' }
        ],
        doList: [
          'Ten snacks y chocolates disponibles',
          'Ofrece tu compañía sin presionar',
          'Sé paciente si está más sensible',
          'Prepárate para el inicio del período'
        ],
        dontList: [
          'No digas "¿Estás en tus días?"',
          'Evita discutir temas delicados',
          'No tomes sus reacciones como algo personal'
        ]
      },
      unknown: {
        title: 'Información no disponible',
        description: 'No hay suficientes datos para determinar la fase actual.',
        tips: [],
        doList: ['Anima a tu pareja a registrar su ciclo'],
        dontList: []
      }
    };
    
    return advice[phase] || advice.unknown;
  };

  const currentPhase = getCurrentPhase();
  const phaseAdvice = currentPhase ? getPhaseAdvice(currentPhase.phase) : getPhaseAdvice('unknown');

  if (!userProfile?.partnerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Activity className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Consejos de Pareja</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <Users className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin pareja vinculada</h2>
            <p className="text-gray-600 mb-4">
              Para ver consejos sobre el ciclo de tu pareja, ella debe invitarte desde su perfil.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Decorative elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Consejos de Pareja</h1>
                <p className="text-xs text-gray-500">Para {userProfile?.partnerName || 'tu pareja'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fase actual */}
            {currentPhase && currentPhase.phase !== 'unknown' && (
              <div className={`bg-gradient-to-r ${currentPhase.gradient} rounded-3xl p-6 text-white shadow-lg`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{currentPhase.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{currentPhase.name}</h2>
                    <p className="text-white/80">Día {currentPhase.day} del ciclo</p>
                  </div>
                </div>
                <p className="text-white/90 text-lg">{phaseAdvice.description}</p>
              </div>
            )}

            {/* Consejos principales */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                {phaseAdvice.title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phaseAdvice.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50/80 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                    <tip.icon className={`w-6 h-6 ${tip.color} flex-shrink-0 mt-0.5`} />
                    <p className="text-gray-700">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Qué hacer y qué evitar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Qué hacer */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-green-100 p-6">
                <h4 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">✓</div>
                  Qué hacer
                </h4>
                <ul className="space-y-3">
                  {phaseAdvice.doList.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Qué evitar */}
              {phaseAdvice.dontList.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-red-100 p-6">
                  <h4 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">✗</div>
                    Qué evitar
                  </h4>
                  <ul className="space-y-3">
                    {phaseAdvice.dontList.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-red-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Síntomas recientes de la pareja */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Síntomas Recientes
              </h3>
              
              {partnerSymptoms.length > 0 ? (
                <div className="space-y-3">
                  {partnerSymptoms.slice(0, 5).map((symptom, index) => (
                    <div key={index} className="p-3 bg-purple-50/80 rounded-xl">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {symptom.symptoms?.map((s, i) => (
                          <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(symptom.createdAt || symptom.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Sin síntomas registrados recientemente</p>
              )}
            </div>

            {/* Historial de períodos */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Historial de Períodos
              </h3>
              
              {partnerPeriods.length > 0 ? (
                <div className="space-y-3">
                  {partnerPeriods.slice(0, 4).map((period, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50/80 rounded-xl">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(period.startDate).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {period.flow === 'light' ? 'Ligero' : 
                           period.flow === 'medium' ? 'Moderado' : 'Abundante'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Sin períodos registrados</p>
              )}
            </div>

            {/* Tip general */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Recuerda
              </h3>
              <p className="text-blue-800 text-sm">
                Cada persona es diferente. Estos consejos son generales. 
                Lo más importante es comunicarte con tu pareja y preguntarle 
                cómo se siente y qué necesita.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente principal que decide qué vista mostrar
const Tracking = () => {
  const { isMaleUser } = useAuth();
  
  if (isMaleUser) {
    return <TrackingMale />;
  }
  
  return <TrackingFemale />;
};

// Componente original para usuarios femeninos
const TrackingFemale = () => {
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
