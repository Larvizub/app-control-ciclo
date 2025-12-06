import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const SymptomModal = ({ isOpen, onClose, onSave }) => {
  const [selected, setSelected] = useState(new Set());
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const elRef = useRef(null);

  // lista que refleja el panel del dashboard (orden/emojis similar)
  const symptomsList = [
    { key: 'colicos', label: 'Cólicos', emoji: '😣' },
    { key: 'cefalea', label: 'Dolor de cabeza', emoji: '🤕' },
    { key: 'hinchazon', label: 'Hinchazón', emoji: '🤰' },
    { key: 'acne', label: 'Acné', emoji: '😬' },
    { key: 'sensibilidad', label: 'Sensibilidad en senos', emoji: '😖' },
    { key: 'fatiga', label: 'Fatiga', emoji: '😴' },
    { key: 'humor', label: 'Cambios de humor', emoji: '😵' },
    { key: 'antojos', label: 'Antojos', emoji: '🍫' },
    { key: 'nauseas', label: 'Náuseas', emoji: '🤢' },
    { key: 'dolor_espalda', label: 'Dolor de espalda', emoji: '😫' }
  ];

  const moods = [
    { key: 'happy', label: 'Feliz', emoji: '😊' },
    { key: 'sad', label: 'Triste', emoji: '😢' },
    { key: 'anxious', label: 'Ansiosa', emoji: '😰' },
    { key: 'irritated', label: 'Irritada', emoji: '😒' },
    { key: 'energetic', label: 'Energética', emoji: '⚡' },
    { key: 'calm', label: 'Calmada', emoji: '🙂' }
  ];

  // Crear el contenedor del portal antes del paint para evitar flash/warnings.
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return () => {};

    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }

    elRef.current = document.createElement('div');
    root.appendChild(elRef.current);

    return () => {
      if (elRef.current && root.contains(elRef.current)) {
        root.removeChild(elRef.current);
      }
      elRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bloquear scroll cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev || 'unset'; };
    }
    return undefined;
  }, [isOpen]);

  const toggle = (key) => {
    setSelected(prev => {
      const copy = new Set(prev);
      if (copy.has(key)) copy.delete(key); else copy.add(key);
      return copy;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      date: new Date(), // usar fecha actual
      symptoms: Array.from(selected),
      mood,
      notes: notes.trim()
    };
    try {
      if (onSave) await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error guardando síntoma', err);
    }
  };

  if (!isOpen || !elRef.current) return null;

  const modal = (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/30"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 bg-gradient-to-r from-primary-50 to-pink-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Registrar Síntomas</h3>
              <p className="text-sm text-gray-500">viernes, {format(new Date(), "d 'de' MMMM")}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={submit} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <section>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">¿Cómo te sientes?</h4>
              <div className="grid grid-cols-2 gap-3">
                {symptomsList.map(s => (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => toggle(s.key)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      selected.has(s.key) ? 'bg-pink-50 border-pink-200 shadow-sm' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="text-2xl">{s.emoji}</div>
                    <div className="text-sm text-gray-800">{s.label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Estado de ánimo</h4>
              <div className="grid grid-cols-3 gap-3">
                {moods.map(m => (
                  <button
                    type="button"
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${
                      mood === m.key ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="text-2xl">{m.emoji}</div>
                    <div className="text-sm text-gray-800">{m.label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notas adicionales</label>
              <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl min-h-[90px]" placeholder="¿Algo más que quieras recordar?" />
            </section>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-pink-600 text-white rounded-xl font-semibold">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, elRef.current);
};

export default SymptomModal;