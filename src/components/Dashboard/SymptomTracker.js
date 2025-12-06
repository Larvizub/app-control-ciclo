// src/components/Dashboard/SymptomTracker.js
import React, { useState } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { Plus, Check, Sparkles, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SymptomTracker = () => {
  const { addSymptom } = useCycle();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const symptoms = [
    { id: 'cramps', name: 'Cólicos', icon: '🤕' },
    { id: 'headache', name: 'Dolor de cabeza', icon: '😵' },
    { id: 'bloating', name: 'Hinchazón', icon: '🤰' },
    { id: 'acne', name: 'Acné', icon: '😬' },
    { id: 'breast_tenderness', name: 'Sensibilidad en senos', icon: '😣' },
    { id: 'fatigue', name: 'Fatiga', icon: '😴' },
    { id: 'mood_swings', name: 'Cambios de humor', icon: '😤' },
    { id: 'cravings', name: 'Antojos', icon: '🍫' },
    { id: 'nausea', name: 'Náuseas', icon: '🤢' },
    { id: 'back_pain', name: 'Dolor de espalda', icon: '😖' }
  ];

  const moods = [
    { id: 'happy', name: 'Feliz', icon: '😊' },
    { id: 'sad', name: 'Triste', icon: '😢' },
    { id: 'anxious', name: 'Ansiosa', icon: '😰' },
    { id: 'irritated', name: 'Irritada', icon: '😠' },
    { id: 'energetic', name: 'Energética', icon: '⚡' },
    { id: 'calm', name: 'Calmada', icon: '😌' }
  ];

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedSymptoms.length === 0 && !mood && !notes.trim()) {
      return;
    }

    try {
      await addSymptom(new Date(), selectedSymptoms, mood, notes);
      
      // Reset form
      setSelectedSymptoms([]);
      setMood('');
      setNotes('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error registrando síntomas:', error);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg border border-white/60 p-6 hover:shadow-glow transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Registrar Síntomas
            </h3>
            <p className="text-xs text-gray-500">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 text-pink-600 rounded-2xl transition-all duration-300 hover:scale-105"
        >
          <Plus className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          {/* Síntomas */}
          <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/80 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              ¿Cómo te sientes?
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`flex items-center space-x-2 p-3 rounded-xl text-sm transition-all duration-300 ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md backdrop-blur-sm'
                  }`}
                >
                  <span className="text-lg">{symptom.icon}</span>
                  <span className="flex-1 text-left font-medium">{symptom.name}</span>
                  {selectedSymptoms.includes(symptom.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Estado de ánimo */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Estado de ánimo
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.id}
                  type="button"
                  onClick={() => setMood(moodOption.id)}
                  className={`flex flex-col items-center p-3 rounded-xl text-sm transition-all duration-300 ${
                    mood === moodOption.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md backdrop-blur-sm'
                  }`}
                >
                  <span className="text-2xl mb-1">{moodOption.icon}</span>
                  <span className="text-xs font-medium">{moodOption.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notas adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Algo más que quieras recordar?"
              rows={3}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-300 text-sm transition-all duration-300 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={selectedSymptoms.length === 0 && !mood && !notes.trim()}
              className="flex-1 relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
            >
              <span className="relative z-10">Guardar</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-2xl transition-all duration-300 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!isExpanded && (
        <div className="text-center py-6 bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Registra cómo te sientes hoy
          </p>
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm font-semibold bg-pink-100/50 hover:bg-pink-100 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Comenzar registro
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomTracker;
