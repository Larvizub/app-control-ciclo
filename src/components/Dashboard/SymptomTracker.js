// src/components/Dashboard/SymptomTracker.js
import React, { useState } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { Plus, Check } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Registrar Síntomas
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
        >
          <Plus className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Síntomas */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              ¿Cómo te sientes?
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'bg-pink-100 text-pink-800 border border-pink-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{symptom.icon}</span>
                  <span className="flex-1 text-left">{symptom.name}</span>
                  {selectedSymptoms.includes(symptom.id) && (
                    <Check className="w-4 h-4 text-pink-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Estado de ánimo */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Estado de ánimo
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.id}
                  type="button"
                  onClick={() => setMood(moodOption.id)}
                  className={`flex flex-col items-center p-2 rounded-lg text-sm transition-colors ${
                    mood === moodOption.id
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg mb-1">{moodOption.icon}</span>
                  <span className="text-xs">{moodOption.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notas adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Algo más que quieras recordar?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={selectedSymptoms.length === 0 && !mood && !notes.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!isExpanded && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-2">
            Registra cómo te sientes hoy
          </p>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            Comenzar registro
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomTracker;
