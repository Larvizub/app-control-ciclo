// src/components/Dashboard/DashboardMale.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Heart, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  AlertCircle,
  Gift,
  Coffee,
  Moon,
  Sun,
  Users,
  Bell,
  Activity
} from 'lucide-react';

const DashboardMale = () => {
  const { currentUser, userProfile, partnerProfile } = useAuth();
  const [partnerPeriods, setPartnerPeriods] = useState([]);
  const [partnerPredictions, setPartnerPredictions] = useState(null);
  const [partnerSymptoms, setPartnerSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  // Configurar saludo
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      const name = userProfile?.name || currentUser?.displayName || 'Usuario';
      
      if (hour < 12) return `Buenos días, ${name}`;
      else if (hour < 18) return `Buenas tardes, ${name}`;
      else return `Buenas noches, ${name}`;
    };
    setGreeting(getGreeting());
  }, [userProfile?.name, currentUser?.displayName]);

  // Cargar datos de la pareja
  const loadPartnerData = useCallback(async () => {
    if (!userProfile?.partnerId) {
      setLoading(false);
      return;
    }

    const partnerId = userProfile.partnerId;

    try {
      // Cargar períodos
      const periodsRef = ref(database, `periods/${partnerId}`);
      onValue(periodsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
          setPartnerPeriods(data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
        } else {
          setPartnerPeriods([]);
        }
      });

      // Cargar predicciones
      const predictionsRef = ref(database, `predictions/${partnerId}`);
      onValue(predictionsRef, (snapshot) => {
        if (snapshot.exists()) {
          setPartnerPredictions(snapshot.val());
        }
        setLoading(false);
      });

      // Cargar síntomas recientes
      const symptomsRef = ref(database, `symptoms/${partnerId}`);
      onValue(symptomsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
          setPartnerSymptoms(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
          setPartnerSymptoms([]);
        }
      });
    } catch (error) {
      console.error('Error cargando datos de pareja:', error);
      setLoading(false);
    }
  }, [userProfile?.partnerId]);

  useEffect(() => {
    loadPartnerData();
  }, [loadPartnerData]);

  // Calcular fase actual de la pareja
  const getCurrentPhase = () => {
    if (!partnerPeriods.length) return null;
    
    const lastPeriod = partnerPeriods[0];
    const today = new Date();
    const periodStart = parseISO(lastPeriod.startDate);
    const dayOfCycle = differenceInDays(today, periodStart) + 1;
    const cycleLength = 28; // promedio
    
    if (dayOfCycle <= 0 || dayOfCycle > cycleLength + 7) return { phase: 'unknown', day: 0 };
    
    if (dayOfCycle <= 5) return { phase: 'menstruation', day: dayOfCycle, name: 'Menstruación', color: 'red', icon: '🔴' };
    if (dayOfCycle <= 13) return { phase: 'follicular', day: dayOfCycle, name: 'Fase Folicular', color: 'green', icon: '🌱' };
    if (dayOfCycle <= 15) return { phase: 'ovulation', day: dayOfCycle, name: 'Ovulación', color: 'yellow', icon: '🥚' };
    if (dayOfCycle <= cycleLength) return { phase: 'luteal', day: dayOfCycle, name: 'Fase Lútea', color: 'purple', icon: '🌙' };
    
    return { phase: 'late', day: dayOfCycle, name: 'Período Tardío', color: 'red', icon: '⚠️' };
  };

  // Tips según la fase
  const getPhaseTips = (phase) => {
    const tips = {
      menstruation: [
        { icon: Coffee, text: 'Prepárale su bebida favorita caliente' },
        { icon: Gift, text: 'Un pequeño detalle puede alegrar su día' },
        { icon: Moon, text: 'Respeta si necesita más descanso' }
      ],
      follicular: [
        { icon: Sun, text: 'Es un buen momento para actividades juntos' },
        { icon: Heart, text: 'Su energía está aumentando' },
        { icon: Calendar, text: 'Planifiquen algo especial' }
      ],
      ovulation: [
        { icon: Heart, text: 'Momento de mayor conexión emocional' },
        { icon: Sparkles, text: 'Puede sentirse más sociable y activa' },
        { icon: AlertCircle, text: 'Mayor fertilidad en estos días' }
      ],
      luteal: [
        { icon: Coffee, text: 'Puede necesitar más apoyo emocional' },
        { icon: Moon, text: 'Los antojos son normales' },
        { icon: Heart, text: 'Sé paciente y comprensivo' }
      ],
      unknown: [
        { icon: Heart, text: 'Mantente atento a cómo se siente' }
      ]
    };
    return tips[phase] || tips.unknown;
  };

  // Días hasta próximo período
  const getDaysUntilPeriod = () => {
    if (!partnerPredictions?.nextPeriod?.startDate) return null;
    const nextPeriod = parseISO(partnerPredictions.nextPeriod.startDate);
    const today = new Date();
    return Math.max(0, differenceInDays(nextPeriod, today));
  };

  const currentPhase = getCurrentPhase();
  const daysUntilPeriod = getDaysUntilPeriod();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Si no tiene pareja vinculada
  if (!userProfile?.partnerId || !partnerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
                <p className="text-sm text-gray-500">{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Esperando conexión</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Tu pareja aún no ha compartido su ciclo contigo. Pídele que te invite desde su perfil 
              usando tu correo electrónico: <strong>{currentUser?.email}</strong>
            </p>
            <div className="bg-blue-50 rounded-2xl p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">¿Cómo funciona?</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Tu pareja debe tener una cuenta con perfil femenino
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  Desde su perfil, selecciona "Invitar a mi pareja"
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Ingresa tu correo electrónico para conectarse
                </li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Conectado con</p>
                <p className="font-semibold text-gray-900">{partnerProfile.name || 'Tu pareja'}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {partnerProfile.name?.charAt(0) || 'P'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado actual de la pareja */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Estado actual de {partnerProfile.name || 'tu pareja'}
              </h2>
              
              {currentPhase ? (
                <div className={`bg-gradient-to-r ${
                  currentPhase.phase === 'menstruation' ? 'from-red-50 to-pink-50 border-red-200' :
                  currentPhase.phase === 'follicular' ? 'from-green-50 to-emerald-50 border-green-200' :
                  currentPhase.phase === 'ovulation' ? 'from-yellow-50 to-amber-50 border-yellow-200' :
                  currentPhase.phase === 'luteal' ? 'from-purple-50 to-violet-50 border-purple-200' :
                  'from-gray-50 to-slate-50 border-gray-200'
                } rounded-2xl p-6 border`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{currentPhase.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{currentPhase.name}</h3>
                        <p className="text-gray-600">Día {currentPhase.day} del ciclo</p>
                      </div>
                    </div>
                    {daysUntilPeriod !== null && (
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">{daysUntilPeriod}</p>
                        <p className="text-sm text-gray-500">días para período</p>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso del ciclo */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Inicio</span>
                      <span>Día {currentPhase.day} de ~28</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          currentPhase.phase === 'menstruation' ? 'bg-red-500' :
                          currentPhase.phase === 'follicular' ? 'bg-green-500' :
                          currentPhase.phase === 'ovulation' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, (currentPhase.day / 28) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-gray-500">No hay datos de ciclo disponibles aún</p>
                </div>
              )}
            </div>

            {/* Consejos para la pareja */}
            {currentPhase && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Consejos para ti
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getPhaseTips(currentPhase.phase).map((tip, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                      <tip.icon className="w-8 h-8 text-blue-500 mb-3" />
                      <p className="text-sm text-gray-700">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Síntomas recientes */}
            {partnerSymptoms.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Síntomas recientes
                </h2>
                <div className="space-y-3">
                  {partnerSymptoms.slice(0, 5).map((symptom, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {symptom.symptoms?.join(', ') || 'Síntoma registrado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {symptom.date || format(new Date(symptom.createdAt), 'd MMM', { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recordatorios */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Recordatorios
              </h3>
              <div className="space-y-3">
                {daysUntilPeriod !== null && daysUntilPeriod <= 3 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Período próximo</p>
                      <p className="text-xs text-red-700">En {daysUntilPeriod} días</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Envía un mensaje</p>
                    <p className="text-xs text-blue-700">Muestra que te importa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leyenda de fases */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Fases del ciclo</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Menstruación</p>
                    <p className="text-xs text-gray-500">Días 1-5</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fase Folicular</p>
                    <p className="text-xs text-gray-500">Días 6-13</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ovulación</p>
                    <p className="text-xs text-gray-500">Días 14-15</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fase Lútea</p>
                    <p className="text-xs text-gray-500">Días 16-28</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info de la pareja */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 border border-pink-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {partnerProfile.name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{partnerProfile.name || 'Tu pareja'}</p>
                  <p className="text-sm text-gray-600">{partnerProfile.email}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Conectados desde el {format(new Date(userProfile?.partnerId ? new Date() : Date.now()), "d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardMale;
