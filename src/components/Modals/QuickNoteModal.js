import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const QuickNoteModal = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const elRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
    }
  }, [isOpen]);

  // Crear el nodo del portal en useLayoutEffect para evitar race condition
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
      if (elRef.current && root.contains(elRef.current)) root.removeChild(elRef.current);
      elRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev || 'unset'; };
    }
    return undefined;
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title: title.trim(), content: content.trim(), createdAt: new Date() };
    try {
      if (onSave) await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error guardando nota rápida:', err);
    }
  };

  // esperar a que el nodo del portal exista
  if (!isOpen || !elRef.current) return null;

  const modalContent = (
    <div className="fixed inset-0" style={{ zIndex: 99999, pointerEvents: 'auto' }} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black bg-opacity-40" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', pointerEvents: 'auto' }} onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto" onClick={(e)=>e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nueva Nota</h2>
              {selectedDate && (
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl" placeholder="Ej: Comprar test de embarazo" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contenido</label>
                <textarea value={content} onChange={(e)=>setContent(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl min-h-[100px]" placeholder="Escribe la nota..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold">Guardar nota</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, elRef.current);
};

export default QuickNoteModal;