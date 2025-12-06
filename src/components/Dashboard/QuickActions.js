// src/components/Dashboard/QuickActions.js
import React, { useState } from 'react';
import { Plus, Droplet, MessageSquare } from 'lucide-react';
import PeriodModal from '../Modals/PeriodModal';

const QuickActions = ({ onOpenSymptom, onOpenQuickNote }) => {
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const actions = [
    {
      id: 'period',
      name: 'Registrar período',
      icon: Droplet,
      gradient: 'from-red-500 to-pink-600',
      shadowColor: 'shadow-red-500/30',
      onClick: () => setShowPeriodModal(true)
    },
    {
      id: 'symptoms',
      name: 'Agregar síntomas',
      icon: Plus,
      gradient: 'from-purple-500 to-indigo-600',
      shadowColor: 'shadow-purple-500/30',
      onClick: () => (onOpenSymptom ? onOpenSymptom() : console.log('Síntomas'))
    },
    {
      id: 'notes',
      name: 'Nota rápida',
      icon: MessageSquare,
      gradient: 'from-blue-500 to-cyan-600',
      shadowColor: 'shadow-blue-500/30',
      onClick: () => (onOpenQuickNote ? onOpenQuickNote() : console.log('Nota'))
    }
  ];

  return (
    <>
      <div className="flex items-center gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              data-action={action.id === 'symptoms' ? 'open-symptom-modal' : action.id === 'notes' ? 'open-note-modal' : undefined}
              aria-label={action.name}
              onClick={action.onClick}
              className={`group relative bg-gradient-to-br ${action.gradient} text-white p-3 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg ${action.shadowColor} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
              title={action.name}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              
              {/* Tooltip */}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg">
                {action.name}
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
              </span>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          );
        })}
      </div>

      {showPeriodModal && (
        <PeriodModal 
          isOpen={showPeriodModal}
          onClose={() => setShowPeriodModal(false)}
        />
      )}
    </>
  );
};

export default QuickActions;
