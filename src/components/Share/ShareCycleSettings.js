import React, { useState, useEffect, useMemo } from 'react';
import { useCycle } from '../../contexts/CycleContext';

const ShareCycleSettings = () => {
  const { shareSettings, updateShareSettings } = useCycle();
  const [local, setLocal] = useState({
    partnerId: '',
    permissions: {
      periods: true,
      symptoms: true,
      mood: true,
      predictions: true,
      notes: false
    }
  });

  useEffect(() => {
    if (shareSettings) {
      setLocal({
        partnerId: shareSettings.partnerId || '',
        permissions: { ...(shareSettings.permissions || {}) }
      });
    }
  }, [shareSettings]);

  const toggle = (key) => {
    setLocal(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  const handleSave = () => {
    if (typeof updateShareSettings !== 'function') {
      console.warn('updateShareSettings no disponible');
      return;
    }
    updateShareSettings({
      partnerId: local.partnerId || null,
      permissions: local.permissions
    });
    // feedback mínimo
    console.log('Configuración de compartido guardada');
  };

  const resetToSaved = () => {
    setLocal({
      partnerId: shareSettings?.partnerId || '',
      permissions: { ...(shareSettings?.permissions || {}) }
    });
  };

  const shareLink = useMemo(() => {
    try {
      const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
      return local.partnerId ? `${origin}/#/shared/${encodeURIComponent(local.partnerId)}` : null;
    } catch {
      return null;
    }
  }, [local.partnerId]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h4 className="font-semibold mb-2">Compartir mi ciclo</h4>

      <label className="block text-xs text-gray-600 mb-1">ID/Email de la pareja</label>
      <input
        value={local.partnerId}
        onChange={(e) => setLocal(prev => ({ ...prev, partnerId: e.target.value }))}
        placeholder="email@pareja.com o partnerId"
        className="w-full mb-3 px-3 py-2 border rounded"
      />

      <div className="grid grid-cols-1 gap-2 mb-3">
        <label className="flex items-center justify-between">
          <span>Períodos</span>
          <input type="checkbox" checked={!!local.permissions.periods} onChange={() => toggle('periods')} />
        </label>
        <label className="flex items-center justify-between">
          <span>Síntomas</span>
          <input type="checkbox" checked={!!local.permissions.symptoms} onChange={() => toggle('symptoms')} />
        </label>
        <label className="flex items-center justify-between">
          <span>Estado de ánimo</span>
          <input type="checkbox" checked={!!local.permissions.mood} onChange={() => toggle('mood')} />
        </label>
        <label className="flex items-center justify-between">
          <span>Predicciones</span>
          <input type="checkbox" checked={!!local.permissions.predictions} onChange={() => toggle('predictions')} />
        </label>
        <label className="flex items-center justify-between">
          <span>Notas privadas</span>
          <input type="checkbox" checked={!!local.permissions.notes} onChange={() => toggle('notes')} />
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="px-4 py-2 bg-pink-600 text-white rounded">Guardar</button>
        <button onClick={resetToSaved} className="px-4 py-2 border rounded">Cancelar</button>
      </div>

      {shareLink && (
        <p className="mt-3 text-xs text-gray-600">
          Vista pública local: <code className="text-blue-600">{shareLink}</code>
        </p>
      )}
    </div>
  );
};

export default ShareCycleSettings;