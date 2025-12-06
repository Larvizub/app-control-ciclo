import React, { useState, useEffect, useMemo } from 'react';
import { useCycle } from '../../contexts/CycleContext';

const ShareCycleSettings = () => {
  const { shareSettings, addAuthorized, removeAuthorized } = useCycle();
  const [local, setLocal] = useState({
    partnerEmail: '',
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
      // If there is at least one authorized, default input to first authorized email
      const firstAuth = Array.isArray(shareSettings.authorized) && shareSettings.authorized.length > 0
        ? shareSettings.authorized[0].email
        : shareSettings.partnerId || '';
      setLocal({
        partnerEmail: firstAuth,
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

  const isValidEmail = useMemo(() => {
    const email = (local.partnerEmail || '').trim();
    // validación básica
    return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [local.partnerEmail]);

  const handleAuthorize = () => {
    if (typeof addAuthorized !== 'function') {
      console.warn('addAuthorized no disponible');
      return;
    }

    if (local.partnerEmail && !isValidEmail) {
      console.warn('Correo no válido');
      return;
    }

    // Añadir a la lista de autorizados con permisos seleccionados
    addAuthorized(local.partnerEmail ? local.partnerEmail.trim() : '', local.permissions);
    // actualizar input
    setLocal(prev => ({ ...prev, partnerEmail: '' }));
    console.log('Correo autorizado:', local.partnerEmail);
  };

  const handleRemove = (email) => {
    if (typeof removeAuthorized !== 'function') {
      console.warn('removeAuthorized no disponible');
      return;
    }
    removeAuthorized(email);
    setLocal(prev => ({ ...prev, partnerEmail: '' }));
    console.log('Autorización eliminada:', email);
  };

  const resetToSaved = () => {
    setLocal({
      partnerEmail: shareSettings?.partnerId || '',
      permissions: { ...(shareSettings?.permissions || {}) }
    });
  };

  const shareLink = useMemo(() => {
    try {
      const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
      return local.partnerEmail ? `${origin}/#/shared/${encodeURIComponent(local.partnerEmail)}` : null;
    } catch {
      return null;
    }
  }, [local.partnerEmail]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h4 className="font-semibold mb-2">Autorizar a tu pareja</h4>

      <p className="text-xs text-gray-500 mb-3">
        Ingresa el correo que estará autorizado para ver la información que selecciones. No se enviará ningún correo ni notificación automática.
      </p>

      <label className="block text-xs text-gray-600 mb-1">Correo autorizado</label>
      <input
        value={local.partnerEmail}
        onChange={(e) => setLocal(prev => ({ ...prev, partnerEmail: e.target.value }))}
        placeholder="correo@pareja.com (opcional)"
        className="w-full mb-2 px-3 py-2 border rounded"
      />
      {!isValidEmail && (
        <p className="text-xs text-red-600 mb-2">Correo con formato inválido.</p>
      )}

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
        <button
          onClick={handleAuthorize}
          disabled={!isValidEmail}
          className={`px-4 py-2 rounded text-white ${isValidEmail ? 'bg-pink-600' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Autorizar
        </button>
        <button onClick={resetToSaved} className="px-4 py-2 border rounded">Cancelar</button>
      </div>

      {shareLink && (
        <p className="mt-3 text-xs text-gray-600">
          Vista pública local (si deseas abrirla manualmente): <code className="text-blue-600 break-all">{shareLink}</code>
        </p>
      )}

      <div className="mt-6">
        <h5 className="font-medium mb-2">Autorizados</h5>
        {Array.isArray(shareSettings?.authorized) && shareSettings.authorized.length > 0 ? (
          <div className="space-y-2">
            {shareSettings.authorized.map((a) => (
              <div key={a.email} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="text-sm text-gray-800">{a.email}</div>
                  <div className="text-xs text-gray-500">{a.addedAt ? `Autorizado: ${new Date(a.addedAt).toLocaleString()}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLocal(prev => ({ ...prev, partnerEmail: a.email, permissions: a.permissions || prev.permissions }))}
                    className="px-3 py-1 text-sm border rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleRemove(a.email)}
                    className="px-3 py-1 text-sm border rounded text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No hay correos autorizados.</p>
        )}
      </div>
    </div>
  );
};

export default ShareCycleSettings;