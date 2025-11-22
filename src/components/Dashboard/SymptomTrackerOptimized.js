// src/components/Dashboard/SymptomTrackerOptimized.js
import React, { useState, useCallback, useMemo } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { Plus, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SymptomTrackerOptimized = React.memo(() => {
  const { addSymptom } = useCycle();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoizar listas de síntomas y estados de ánimo
  const symptoms = useMemo(() => [
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
  ], []);

  const moods = useMemo(() => [
    { id: 'happy', name: 'Feliz', icon: '😊' },
    { id: 'sad', name: 'Triste', icon: '😢' },
    { id: 'anxious', name: 'Ansiosa', icon: '😰' },
    { id: 'irritated', name: 'Irritada', icon: '😠' },
    { id: 'energetic', name: 'Energética', icon: '⚡' },
    { id: 'calm', name: 'Calmada', icon: '😌' }
  ], []);

  const toggleSymptom = useCallback((symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (selectedSymptoms.length === 0 && !mood && !notes.trim()) {
      return;
    }

    try {
      await addSymptom(
        new Date(),
        selectedSymptoms,
        mood || null,
        notes.trim()
      );

      // Limpiar formulario
      setSelectedSymptoms([]);
      setMood('');
      setNotes('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error al registrar síntomas:', error);
    }
  }, [selectedSymptoms, mood, notes, addSymptom]);

  // Determinar si hay datos para enviar
  const hasDataToSubmit = useMemo(() => {
    return selectedSymptoms.length > 0 || mood || notes.trim();
  }, [selectedSymptoms.length, mood, notes]);

  if (!isExpanded) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Síntomas de Hoy
          </h3>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 transition-colors"
          >
            <Plus size={16} />
            Registrar
          </button>
        </div>
        
        <p className="text-sm text-gray-600">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Registrar tus síntomas diarios te ayuda a entender mejor tu ciclo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Síntomas de Hoy
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Minimizar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Síntomas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Cómo te sientes?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {symptoms.map((symptom) => (
              <button
                key={symptom.id}
                type="button"
                onClick={() => toggleSymptom(symptom.id)}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'bg-pink-100 text-pink-700 border border-pink-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-lg">{symptom.icon}</span>
                <span className="flex-1 text-left">{symptom.name}</span>
                {selectedSymptoms.includes(symptom.id) && (
                  <Check size={16} className="text-pink-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de ánimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Cómo está tu estado de ánimo?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {moods.map((moodOption) => (
              <button
                key={moodOption.id}
                type="button"
                onClick={() => setMood(moodOption.id === mood ? '' : moodOption.id)}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  mood === moodOption.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-lg">{moodOption.icon}</span>
                <span className="flex-1 text-left">{moodOption.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Algo más que quieras recordar sobre hoy?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
            rows={3}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!hasDataToSubmit}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              hasDataToSubmit
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check size={16} />
            Guardar
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedSymptoms([]);
              setMood('');
              setNotes('');
              setIsExpanded(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
});

SymptomTrackerOptimized.displayName = 'SymptomTrackerOptimized';

export default SymptomTrackerOptimized;
