// src/components/Calendar/Calendar.js
import React, { useState, useEffect, useCallback } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { useAuth } from '../../contexts/AuthContext';
import QuickNoteModal from '../Modals/QuickNoteModal';
import { useSocial } from '../../contexts/SocialContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { Calendar as CalendarIcon, Plus, MessageSquare, Sparkles, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

const Calendar = () => {
  const { getDayData } = useCycle();
  const { isMaleUser, userProfile } = useAuth();
  const { notes, addSharedNote } = useSocial();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  
  // Estado para datos de la pareja (usuarios masculinos)
  const [partnerPeriods, setPartnerPeriods] = useState([]);
  const [partnerSymptoms, setPartnerSymptoms] = useState([]);

  // Cargar datos de la pareja si es usuario masculino
  const loadPartnerData = useCallback(() => {
    if (!isMaleUser || !userProfile?.partnerId) {
      return;
    }

    const partnerId = userProfile.partnerId;

    // Cargar períodos de la pareja
    const periodsRef = ref(database, `periods/${partnerId}`);
    const unsubPeriods = onValue(periodsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
        setPartnerPeriods(data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
      } else {
        setPartnerPeriods([]);
      }
    });

    // Cargar síntomas de la pareja
    const symptomsRef = ref(database, `symptoms/${partnerId}`);
    const unsubSymptoms = onValue(symptomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
        setPartnerSymptoms(data);
      } else {
        setPartnerSymptoms([]);
      }
    });

    return () => {
      unsubPeriods();
      unsubSymptoms();
    };
  }, [isMaleUser, userProfile?.partnerId]);

  useEffect(() => {
    const unsubscribe = loadPartnerData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadPartnerData]);

  // Obtener datos del día para usuario masculino (datos de pareja)
  const getPartnerDayData = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Verificar si hay período en esta fecha
    let period = null;
    let phase = 'unknown';
    let dayOfCycle = 0;
    
    if (partnerPeriods.length > 0) {
      const lastPeriod = partnerPeriods[0];
      const periodStart = parseISO(lastPeriod.startDate);
      dayOfCycle = differenceInDays(date, periodStart) + 1;
      const cycleLength = 28;
      
      // Buscar si este día está en un período registrado
      for (const p of partnerPeriods) {
        const pStart = parseISO(p.startDate);
        const pEnd = p.endDate ? parseISO(p.endDate) : null;
        
        if (pEnd) {
          if (date >= pStart && date <= pEnd) {
            period = p;
            break;
          }
        } else {
          // Si no tiene fecha de fin, asumir 5 días
          const daysSinceStart = differenceInDays(date, pStart);
          if (daysSinceStart >= 0 && daysSinceStart < 5) {
            period = p;
            break;
          }
        }
      }
      
      // Calcular fase
      if (dayOfCycle > 0 && dayOfCycle <= cycleLength + 7) {
        if (dayOfCycle <= 5) phase = 'menstruation';
        else if (dayOfCycle <= 13) phase = 'follicular';
        else if (dayOfCycle <= 15) phase = 'ovulation';
        else if (dayOfCycle <= cycleLength) phase = 'luteal';
      }
    }
    
    // Síntomas de este día
    const daySymptoms = partnerSymptoms.filter(s => 
      s.date === dateStr || format(parseISO(s.createdAt || s.date), 'yyyy-MM-dd') === dateStr
    );
    
    const phaseNames = {
      menstruation: 'Menstruación',
      follicular: 'Fase Folicular',
      ovulation: 'Ovulación',
      luteal: 'Fase Lútea',
      unknown: 'Sin datos'
    };
    
    return {
      period,
      phase,
      symptoms: daySymptoms,
      dayOfCycle,
      phaseInfo: { name: phaseNames[phase] }
    };
  };

  // Función unificada para obtener datos del día
  const getDayInfo = (date) => {
    if (isMaleUser) {
      return getPartnerDayData(date);
    }
    return getDayData(date);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayStyle = (date) => {
    const dayData = getDayInfo(date);
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate && isSameDay(date, selectedDate);

    let baseClasses = 'relative w-full h-24 p-2 border border-gray-100/60 cursor-pointer transition-all duration-300 hover:bg-white/80 hover:shadow-md rounded-xl';
    
    // Indicador visual si tiene nota
    const hasNote = notes.some(note => note.date === format(date, 'yyyy-MM-dd'));
    if (hasNote) {
      baseClasses += ' ring-1 ring-blue-300';
    }
    
    if (isToday) {
      baseClasses += isMaleUser 
        ? ' ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
        : ' ring-2 ring-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md';
    } else if (isSelected) {
      baseClasses += ' ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md';
    }

    // Color de fondo basado en la fase del ciclo
    if (dayData.phase !== 'unknown') {
      const alpha = dayData.period ? '0.3' : '0.1';
      baseClasses += ` bg-opacity-${alpha}`;
    }

    return baseClasses;
  };

  const getPhaseColor = (phase) => {
    const colors = {
      menstruation: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700',
      follicular: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700',
      fertile: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700',
      ovulation: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700',
      luteal: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700',
      unknown: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600'
    };
    return colors[phase] || colors.unknown;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-white to-purple-50/50">
      {/* Decorative elements */}
      <div className={clsx(
        "fixed top-20 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none",
        isMaleUser ? "bg-gradient-to-br from-blue-200/30 to-indigo-200/30" : "bg-gradient-to-br from-pink-200/30 to-purple-200/30"
      )}></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Mensaje si no tiene pareja vinculada */}
      {isMaleUser && !userProfile?.partnerId && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-8 text-center">
            <Users className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin pareja vinculada</h2>
            <p className="text-gray-600 mb-4">
              Para ver el calendario de tu pareja, ella debe invitarte desde su perfil usando tu correo electrónico.
            </p>
            <p className="text-sm text-gray-500">
              Tu correo: <span className="font-medium text-blue-600">{userProfile?.email}</span>
            </p>
          </div>
        </div>
      )}

      {/* Contenido del calendario */}
      {(!isMaleUser || userProfile?.partnerId) && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header con título y botón de agregar nota */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
              isMaleUser ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-pink-500 to-purple-600"
            )}>
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={clsx(
                "text-2xl font-bold bg-clip-text text-transparent",
                isMaleUser ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gradient-to-r from-pink-600 to-purple-600"
              )}>
                {isMaleUser ? 'Calendario de Pareja' : 'Mi Calendario'}
              </h1>
              <p className="text-sm text-gray-500">
                {isMaleUser ? `Ciclo de ${userProfile?.partnerName || 'tu pareja'}` : 'Seguimiento de tu ciclo'}
              </p>
            </div>
          </div>
          {!isMaleUser && (
            <button
              onClick={() => {
                if (!selectedDate) {
                  setSelectedDate(new Date());
                }
                setShowAddNote(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-pink-500/30 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Nota</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendario principal */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 overflow-hidden">
              {/* Header del calendario */}
              <div className={clsx(
                "flex items-center justify-between px-6 py-5 border-b border-gray-200/60",
                isMaleUser 
                  ? "bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80"
                  : "bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-indigo-50/80"
              )}>
                <button
                  onClick={() => navigateMonth(-1)}
                  className={clsx(
                    "p-3 text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md",
                    isMaleUser ? "hover:text-blue-600" : "hover:text-pink-600"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {format(currentDate, "MMMM yyyy", { locale: es })}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className={clsx(
                    "p-3 text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md",
                    isMaleUser ? "hover:text-blue-600" : "hover:text-pink-600"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-b border-gray-200/60">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="px-3 py-3 text-sm font-semibold text-gray-600 text-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50/30">
                {calendarDays.map((date) => {
                  const dayData = getDayInfo(date);
                  const dayNotes = notes.filter(note => note.date === format(date, 'yyyy-MM-dd'));
                  
                  return (
                    <div
                      key={date.toString()}
                      onClick={() => setSelectedDate(date)}
                      className={getDayStyle(date)}
                    >
                      <div className="flex justify-between items-start">
                        <span className={clsx(
                          "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-lg",
                          isSameDay(date, new Date()) 
                            ? isMaleUser 
                              ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md"
                              : "bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md" 
                            : "text-gray-700"
                        )}>
                          {format(date, 'd')}
                        </span>
                        {dayData.period && (
                          <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-sm animate-pulse"></div>
                        )}
                      </div>

                      {/* Indicador de fase */}
                      {dayData.phase !== 'unknown' && (
                        <div className={clsx(
                          'inline-flex items-center px-1.5 py-0.5 rounded-lg text-xs font-medium mt-1',
                          getPhaseColor(dayData.phase)
                        )}>
                          {dayData.phase === 'menstruation' && '🔴'}
                          {dayData.phase === 'fertile' && '💚'}
                          {dayData.phase === 'ovulation' && '🥚'}
                          {dayData.phase === 'luteal' && '💜'}
                        </div>
                      )}

                      {/* Notas */}
                      {dayNotes.length > 0 && (
                        <div className="flex items-center mt-1 bg-blue-100/60 rounded-lg px-1.5 py-0.5">
                          <MessageSquare className="w-3 h-3 text-blue-500 mr-1" />
                          <span className="text-xs text-blue-600 font-medium">
                            {dayNotes.length}
                          </span>
                        </div>
                      )}

                      {/* Síntomas */}
                      {dayData.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayData.symptoms.slice(0, 2).map((symptom, index) => (
                            <span key={index} className="text-xs bg-purple-100/60 text-purple-600 px-1.5 py-0.5 rounded-lg font-medium">
                              {symptom.symptoms[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información del día seleccionado */}
            {selectedDate && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 hover:shadow-glow transition-all duration-500">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className={clsx("w-4 h-4", isMaleUser ? "text-blue-500" : "text-pink-500")} />
                  {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </h3>
                
                {(() => {
                  const dayData = getDayInfo(selectedDate);
                  const dayNotes = notes.filter(note => note.date === format(selectedDate, 'yyyy-MM-dd'));
                  
                  return (
                    <div className="space-y-4">
                      {/* Fase del ciclo */}
                      <div className={clsx(
                        "rounded-2xl p-4",
                        isMaleUser ? "bg-gradient-to-br from-blue-50/80 to-indigo-50/80" : "bg-gradient-to-br from-pink-50/80 to-purple-50/80"
                      )}>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Fase del ciclo</h4>
                        <div className={clsx(
                          'inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold',
                          getPhaseColor(dayData.phase)
                        )}>
                          {dayData.phaseInfo.name}
                        </div>
                      </div>

                      {/* Período */}
                      {dayData.period && (
                        <div className="bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-2xl p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Período</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Flujo: {dayData.period.flow === 'light' ? 'Ligero' : 
                                    dayData.period.flow === 'medium' ? 'Moderado' : 'Abundante'}
                          </p>
                        </div>
                      )}

                      {/* Síntomas */}
                      {dayData.symptoms.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-2xl p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Síntomas</h4>
                          <div className="flex flex-wrap gap-2">
                            {dayData.symptoms[0].symptoms.map((symptom, index) => (
                              <span key={index} className="px-3 py-1.5 bg-white/80 text-purple-700 text-xs font-medium rounded-xl border border-purple-200/60 shadow-sm">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-700">Notas</h4>
                          {!isMaleUser && (
                          <button
                            onClick={() => setShowAddNote(true)}
                            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Agregar nota a este día"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          )}
                        </div>
                        {dayNotes.length > 0 ? (
                          <div className="space-y-2">
                            {dayNotes.map((note, index) => (
                              <div key={index} className="bg-white/80 p-3 rounded-xl text-sm shadow-sm">
                                <p className="text-blue-900">{note.note}</p>
                                <p className="text-xs text-blue-600 mt-1 font-medium">
                                  Por {note.authorName}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">Sin notas para este día</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Leyenda */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Leyenda</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg shadow-sm"></div>
                  <span className="text-sm text-gray-600 font-medium">Período menstrual</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm"></div>
                  <span className="text-sm text-gray-600 font-medium">Ventana fértil</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <div className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg shadow-sm"></div>
                  <span className="text-sm text-gray-600 font-medium">Ovulación</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg shadow-sm"></div>
                  <span className="text-sm text-gray-600 font-medium">Fase lútea</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600 font-medium">Tiene notas</span>
                </div>
              </div>
            </div>

            {/* Próximos eventos */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100/60">
                  <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-semibold text-red-900">Próximo período</p>
                    <p className="text-xs text-red-700">En 5 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100/60">
                  <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">Ventana fértil</p>
                    <p className="text-xs text-green-700">En 12 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      )}
      
      {!isMaleUser && (
        <QuickNoteModal
          isOpen={showAddNote}
          onClose={()=>setShowAddNote(false)}
          selectedDate={selectedDate || new Date()}
          onSave={async (payload) => {
            try {
              // Usar la fecha seleccionada o hoy
              const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
              // El texto de la nota viene en payload.content o payload.title
              const noteText = payload.content || payload.title || '';
              if (!noteText.trim()) {
                throw new Error('La nota no puede estar vacía');
              }
              await addSharedNote(dateStr, noteText, []);
            } catch (err) {
              console.error('Error guardando nota desde Calendar:', err);
              throw err;
            }
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
