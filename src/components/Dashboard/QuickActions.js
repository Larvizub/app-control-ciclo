// src/components/Dashboard/QuickActions.js
import React, { useState } from 'react';
import { Plus, Droplet, MessageSquare } from 'lucide-react';
import PeriodModal from '../Modals/PeriodModal';

const QuickActions = () => {
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const actions = [
    {
      id: 'period',
      name: 'Registrar período',
      icon: Droplet,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => setShowPeriodModal(true)
    },
    {
      id: 'symptoms',
      name: 'Agregar síntomas',
      icon: Plus,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('Síntomas')
    },
    {
      id: 'notes',
      name: 'Nota rápida',
      icon: MessageSquare,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Nota')
    }
  ];

  return (
    <>
      <div className="flex items-center space-x-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`${action.color} text-white p-2 rounded-lg transition-colors shadow-sm hover:shadow-md`}
              title={action.name}
            >
              <Icon className="w-5 h-5" />
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
