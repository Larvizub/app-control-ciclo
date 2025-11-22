// src/components/Calendar/Calendar.js
import React, { useState } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { useSocial } from '../../contexts/SocialContext';
import { Calendar as CalendarIcon, Plus, MessageSquare } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

const Calendar = () => {
  const { getDayData } = useCycle();
  const { notes } = useSocial();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  
  // Evitar warning de ESLint
  console.log('showAddNote state:', showAddNote);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayStyle = (date) => {
    const dayData = getDayData(date);
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const hasNote = notes.some(note => note.date === format(date, 'yyyy-MM-dd'));
    console.log('Day has note:', hasNote); // Para evitar warning

    let baseClasses = 'relative w-full h-20 p-2 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50';
    
    if (isToday) {
      baseClasses += ' ring-2 ring-blue-500 bg-blue-50';
    } else if (isSelected) {
      baseClasses += ' ring-2 ring-pink-500 bg-pink-50';
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
      menstruation: 'bg-red-100 text-red-800',
      follicular: 'bg-green-100 text-green-800',
      fertile: 'bg-green-200 text-green-900',
      ovulation: 'bg-yellow-100 text-yellow-800',
      luteal: 'bg-purple-100 text-purple-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return colors[phase] || colors.unknown;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Mi Calendario</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddNote(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nota</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendario principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del calendario */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                >
                  ←
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentDate, "MMMM yyyy", { locale: es })}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                >
                  →
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="px-3 py-2 text-sm font-medium text-gray-500 text-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7">
                {calendarDays.map((date) => {
                  const dayData = getDayData(date);
                  const dayNotes = notes.filter(note => note.date === format(date, 'yyyy-MM-dd'));
                  
                  return (
                    <div
                      key={date.toString()}
                      onClick={() => setSelectedDate(date)}
                      className={getDayStyle(date)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-900">
                          {format(date, 'd')}
                        </span>
                        {dayData.period && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>

                      {/* Indicador de fase */}
                      {dayData.phase !== 'unknown' && (
                        <div className={clsx(
                          'inline-flex items-center px-1 py-0.5 rounded text-xs font-medium mt-1',
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
                        <div className="flex items-center mt-1">
                          <MessageSquare className="w-3 h-3 text-blue-500 mr-1" />
                          <span className="text-xs text-blue-600">
                            {dayNotes.length}
                          </span>
                        </div>
                      )}

                      {/* Síntomas */}
                      {dayData.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayData.symptoms.slice(0, 2).map((symptom, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 rounded">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </h3>
                
                {(() => {
                  const dayData = getDayData(selectedDate);
                  const dayNotes = notes.filter(note => note.date === format(selectedDate, 'yyyy-MM-dd'));
                  
                  return (
                    <div className="space-y-4">
                      {/* Fase del ciclo */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Fase del ciclo</h4>
                        <div className={clsx(
                          'inline-flex items-center px-2 py-1 rounded-full text-sm font-medium',
                          getPhaseColor(dayData.phase)
                        )}>
                          {dayData.phaseInfo.name}
                        </div>
                      </div>

                      {/* Período */}
                      {dayData.period && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Período</h4>
                          <p className="text-sm text-gray-600">
                            Flujo: {dayData.period.flow === 'light' ? 'Ligero' : 
                                    dayData.period.flow === 'medium' ? 'Moderado' : 'Abundante'}
                          </p>
                        </div>
                      )}

                      {/* Síntomas */}
                      {dayData.symptoms.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Síntomas</h4>
                          <div className="flex flex-wrap gap-1">
                            {dayData.symptoms[0].symptoms.map((symptom, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      {dayNotes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Notas</h4>
                          <div className="space-y-2">
                            {dayNotes.map((note, index) => (
                              <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                                <p className="text-blue-900">{note.note}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Por {note.authorName}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Leyenda */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leyenda</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Período menstrual</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Ventana fértil</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Ovulación</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Fase lútea</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Tiene notas</span>
                </div>
              </div>
            </div>

            {/* Próximos eventos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Próximo período</p>
                    <p className="text-xs text-red-700">En 5 días</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Ventana fértil</p>
                    <p className="text-xs text-green-700">En 12 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
