// src/components/Dashboard/DashboardMale.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationContext';
import { ref, onValue, get, set } from 'firebase/database';
import { database } from '../../config/firebase';
import toast from 'react-hot-toast';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import {
  Heart, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  Gift,
  Coffee,
  Moon,
  Sun,
  Users,
  Activity,
  Link2,
  Key
} from 'lucide-react';

const DashboardMale = () => {
  const { currentUser, userProfile } = useAuth();
  const { createNotification } = useNotifications();
  const [partnerData, setPartnerData] = useState(null);
  const [partnerPeriods, setPartnerPeriods] = useState([]);
  const [partnerPredictions, setPartnerPredictions] = useState(null);
  const [partnerSymptoms, setPartnerSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [linking, setLinking] = useState(false);

  // Configurar saludo
  useEffect(() => {
    const hour = new Date().getHours();
    const name = userProfile?.name || currentUser?.displayName || 'Usuario';
    
    if (hour < 12) setGreeting(`Buenos días, ${name}`);
    else if (hour < 18) setGreeting(`Buenas tardes, ${name}`);
    else setGreeting(`Buenas noches, ${name}`);
  }, [userProfile?.name, currentUser?.displayName]);

  // Cargar datos de la pareja
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Escuchar cambios en el perfil del usuario para detectar partnerId
    const userRef = ref(database, `users/${currentUser.uid}`);
    
    const unsubUser = onValue(userRef, async (userSnapshot) => {
      if (!userSnapshot.exists()) {
        setLoading(false);
        return;
      }

      const userData = userSnapshot.val();
      const partnerId = userData.partnerId;

      if (!partnerId) {
        setLoading(false);
        return;
      }

      // Cargar perfil de la pareja
      const partnerRef = ref(database, `users/${partnerId}`);
      onValue(partnerRef, (snapshot) => {
        if (snapshot.exists()) {
          setPartnerData(snapshot.val());
        }
      });

      // Cargar períodos de la pareja
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

      // Cargar síntomas
      const symptomsRef = ref(database, `symptoms/${partnerId}`);
      onValue(symptomsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
          setPartnerSymptoms(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        } else {
          setPartnerSymptoms([]);
        }
      });

    }, (err) => {
      console.error('Error:', err);
      setLoading(false);
    });

    return () => unsubUser();
  }, [currentUser]);

  // FUNCIÓN PRINCIPAL: Vincular con código
  const linkWithCode = async () => {
    const code = linkCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      toast.error('Ingresa un código de 6 caracteres');
      return;
    }

    setLinking(true);
    try {
      // Buscar el código en la base de datos
      const codeRef = ref(database, `linkCodes/${code}`);
      const codeSnapshot = await get(codeRef);

      if (!codeSnapshot.exists()) {
        toast.error('Código no válido o expirado');
        setLinking(false);
        return;
      }

      const codeData = codeSnapshot.val();
      const partnerId = codeData.odwifeId;
      const partnerName = codeData.odwifeName;
      const partnerEmail = codeData.odwifeEmail;

      // Verificar que no sea el mismo usuario
      if (partnerId === currentUser.uid) {
        toast.error('No puedes vincularte contigo mismo');
        setLinking(false);
        return;
      }

      const now = new Date().toISOString();
      const myName = userProfile?.name || currentUser?.displayName || currentUser?.email;

      // 1. Actualizar MI perfil (usuario masculino)
      await set(ref(database, `users/${currentUser.uid}/partnerId`), partnerId);
      await set(ref(database, `users/${currentUser.uid}/partnerEmail`), partnerEmail);
      await set(ref(database, `users/${currentUser.uid}/partnerName`), partnerName);
      await set(ref(database, `users/${currentUser.uid}/linkedAt`), now);

      // 2. Actualizar perfil de la PAREJA (usuario femenino)
      await set(ref(database, `users/${partnerId}/partnerId`), currentUser.uid);
      await set(ref(database, `users/${partnerId}/partnerEmail`), currentUser.email);
      await set(ref(database, `users/${partnerId}/partnerName`), myName);
      await set(ref(database, `users/${partnerId}/linkedAt`), now);

      // 3. Marcar código como usado
      await set(ref(database, `linkCodes/${code}/usedBy`), currentUser.uid);
      await set(ref(database, `linkCodes/${code}/usedAt`), now);

      // 4. Crear amistad bidireccional para que aparezcan en Social
      const friendshipData = {
        odwifeId: currentUser.uid,
        status: 'accepted',
        type: 'partner',
        createdAt: now
      };
      const reverseFriendshipData = {
        odwifeId: partnerId,
        status: 'accepted',
        type: 'partner',
        createdAt: now
      };
      await set(ref(database, `friendships/${currentUser.uid}/${partnerId}`), friendshipData);
      await set(ref(database, `friendships/${partnerId}/${currentUser.uid}`), reverseFriendshipData);

      // 5. Crear chat entre la pareja
      const chatId = uuidv4();
      const chatData = {
        id: chatId,
        participants: [currentUser.uid, partnerId],
        type: 'partner',
        createdAt: now,
        lastMessage: '¡Se han vinculado como pareja! 💕',
        lastActivity: now,
        lastSender: 'system'
      };
      await set(ref(database, `chats/${chatId}`), chatData);

      // Mensaje inicial del sistema
      const welcomeMessageId = uuidv4();
      const welcomeMessage = {
        id: welcomeMessageId,
        senderId: 'system',
        senderName: 'Sistema',
        message: `¡${myName} y ${partnerName} ahora están vinculados como pareja! 💕`,
        type: 'system',
        timestamp: now,
        read: false
      };
      await set(ref(database, `messages/${chatId}/${welcomeMessageId}`), welcomeMessage);

      // 6. Crear notificación para la pareja
      await createNotification(
        partnerId,
        NOTIFICATION_TYPES.PARTNER_LINKED,
        `¡${myName} se ha vinculado contigo como pareja!`,
        { odwifeId: currentUser.uid, chatId }
      );

      toast.success(`¡Vinculado exitosamente con ${partnerName}!`);
      setLinkCode('');
      
    } catch (err) {
      console.error('Error vinculando:', err);
      toast.error('Error al vincular: ' + err.message);
    } finally {
      setLinking(false);
    }
  };

  // Calcular fase actual
  const getCurrentPhase = () => {
    if (!partnerPeriods.length) return null;
    
    const lastPeriod = partnerPeriods[0];
    const today = new Date();
    const periodStart = parseISO(lastPeriod.startDate);
    const dayOfCycle = differenceInDays(today, periodStart) + 1;
    
    if (dayOfCycle <= 0 || dayOfCycle > 35) return { phase: 'unknown', day: 0 };
    
    if (dayOfCycle <= 5) return { phase: 'menstruation', day: dayOfCycle, name: 'Menstruación', color: 'red', icon: '🔴' };
    if (dayOfCycle <= 13) return { phase: 'follicular', day: dayOfCycle, name: 'Fase Folicular', color: 'green', icon: '🌱' };
    if (dayOfCycle <= 15) return { phase: 'ovulation', day: dayOfCycle, name: 'Ovulación', color: 'yellow', icon: '🥚' };
    if (dayOfCycle <= 28) return { phase: 'luteal', day: dayOfCycle, name: 'Fase Lútea', color: 'purple', icon: '🌙' };
    
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

  const getDaysUntilPeriod = () => {
    if (!partnerPredictions?.nextPeriod?.startDate) return null;
    const nextPeriod = parseISO(partnerPredictions.nextPeriod.startDate);
    return Math.max(0, differenceInDays(nextPeriod, new Date()));
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

  // PANTALLA DE VINCULACIÓN - Si no tiene pareja
  if (!userProfile?.partnerId || !partnerData) {
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

        <main className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Link2 className="w-10 h-10 text-pink-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Conecta con tu pareja</h2>
            <p className="text-gray-600 mb-8">
              Ingresa el código de 6 caracteres que tu pareja generó desde su cuenta
            </p>

            {/* Input del código */}
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                <input
                  type="text"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full max-w-xs text-center text-3xl font-mono font-bold tracking-widest px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 uppercase"
                  onKeyDown={(e) => e.key === 'Enter' && linkWithCode()}
                />
              </div>
              
              <button
                onClick={linkWithCode}
                disabled={linking || linkCode.length !== 6}
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    <span>Vincular cuenta</span>
                  </>
                )}
              </button>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 rounded-2xl p-6 text-left mt-8">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                ¿Cómo obtener el código?
              </h3>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Tu pareja abre la app con su cuenta femenina</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Va a <strong>Compartir Ciclo</strong> → <strong>Pareja</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>Hace clic en <strong>"Generar código"</strong> y te lo comparte</span>
                </li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // DASHBOARD CONECTADO - Muestra datos de la pareja
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
              <p className="text-sm text-gray-500">{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
            </div>
            <div className="flex items-center gap-2 bg-pink-100 px-3 py-2 rounded-full">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-700">{partnerData?.name || 'Tu pareja'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Tarjeta principal - Fase actual */}
        {currentPhase && currentPhase.phase !== 'unknown' && (
          <div className={`bg-white rounded-3xl shadow-lg border p-6 ${
            currentPhase.phase === 'menstruation' ? 'border-red-200' :
            currentPhase.phase === 'ovulation' ? 'border-yellow-200' :
            currentPhase.phase === 'luteal' ? 'border-purple-200' :
            'border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Fase actual de {partnerData?.name}</p>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>{currentPhase.icon}</span>
                  {currentPhase.name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">Día {currentPhase.day}</p>
                <p className="text-sm text-gray-500">del ciclo</p>
              </div>
            </div>

            {/* Tips */}
            <div className="grid gap-3 mt-4">
              {getPhaseTips(currentPhase.phase).map((tip, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <tip.icon className="w-5 h-5 text-pink-500 shrink-0" />
                  <span className="text-sm text-gray-700">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximo período */}
        {daysUntilPeriod !== null && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Próximo período</p>
                <p className="text-xl font-bold text-gray-900">
                  {daysUntilPeriod === 0 ? 'Hoy' : 
                   daysUntilPeriod === 1 ? 'Mañana' : 
                   `En ${daysUntilPeriod} días`}
                </p>
                {partnerPredictions?.nextPeriod?.startDate && (
                  <p className="text-sm text-gray-500">
                    {format(parseISO(partnerPredictions.nextPeriod.startDate), "d 'de' MMMM", { locale: es })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Síntomas recientes */}
        {partnerSymptoms.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Síntomas recientes
            </h3>
            <div className="flex flex-wrap gap-2">
              {partnerSymptoms.slice(0, 5).map((symptom, index) => (
                <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {symptom.type || symptom.name || 'Síntoma'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay datos */}
        {!currentPhase && partnerPeriods.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Esperando datos</h3>
            <p className="text-gray-500">
              {partnerData?.name} aún no ha registrado información de su ciclo.
              Los datos aparecerán aquí cuando los registre.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardMale;
