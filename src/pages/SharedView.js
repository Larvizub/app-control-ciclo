import React from 'react';
import { useParams } from 'react-router-dom';
import { useCycle } from '../contexts/CycleContext';

const SharedView = () => {
  const { partnerId } = useParams();
  const { getSharedData, getShareSettings } = useCycle();

  // obtener datos filtrados según permisos (si partnerId no coincide, estará vacío)
  const shared = getSharedData(partnerId);
  const settings = getShareSettings();

  // permitir que `partnerId` en la URL sea UID o email; validar contra shareSettings
  const isAuthorizedPartner = !!(settings && (
    settings.partnerId === partnerId ||
    settings.partnerEmail === partnerId ||
    (Array.isArray(settings.authorized) && settings.authorized.some(a => a.email === partnerId || a.uid === partnerId))
  ));

  // si partnerId no coincide con configurado, mostrar mensaje
  if (!isAuthorizedPartner) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Acceso no autorizado</h2>
        <p className="text-sm text-gray-600 mt-2">La usuaria no ha compartido su ciclo con este ID.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Información compartida</h2>

      {/* Períodos */}
      {settings.permissions.periods && (
        <section className="mb-4">
          <h3 className="font-semibold">Períodos</h3>
          {shared.periods && shared.periods.length > 0 ? (
            <ul className="list-disc ml-6">
              {shared.periods.map((p, i) => (
                <li key={i}>
                  {p.startDate ? `${p.startDate}` : (p.start || 'fecha inicio')} - {p.endDate ? `${p.endDate}` : (p.end || 'fecha fin')}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-600">No hay registros de período compartidos.</p>}
        </section>
      )}

      {/* Síntomas */}
      {settings.permissions.symptoms && (
        <section className="mb-4">
          <h3 className="font-semibold">Síntomas</h3>
          {shared.symptoms && shared.symptoms.length > 0 ? (
            <ul className="list-disc ml-6">
              {shared.symptoms.map((s, i) => (
                <li key={i}>
                  <strong>{s.date || s.createdAtISO || s.day}</strong>: {Array.isArray(s.items) ? s.items.join(', ') : s.note || s.text || JSON.stringify(s)}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-600">No hay síntomas compartidos.</p>}
        </section>
      )}

      {/* Estado de ánimo */}
      {settings.permissions.mood && (
        <section className="mb-4">
          <h3 className="font-semibold">Estado de ánimo</h3>
          {shared.mood && shared.mood.length > 0 ? (
            <ul className="list-disc ml-6">
              {shared.mood.map((m, i) => (
                <li key={i}>{m.date || m.createdAt || m.day}: {m.mood || m.value || JSON.stringify(m)}</li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-600">No hay registros de ánimo compartidos.</p>}
        </section>
      )}

      {/* Predicciones */}
      {settings.permissions.predictions && (
        <section className="mb-4">
          <h3 className="font-semibold">Predicciones</h3>
          {shared.predictions && shared.predictions.length > 0 ? (
            <ul className="list-disc ml-6">
              {shared.predictions.map((pred, i) => (
                <li key={i}>{pred.nextPeriod?.startDate || pred.date || pred.start || JSON.stringify(pred)}</li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-600">No hay predicciones compartidas.</p>}
        </section>
      )}

      {/* Notas */}
      {settings.permissions.notes && (
        <section className="mb-4">
          <h3 className="font-semibold">Notas</h3>
          {shared.notes && shared.notes.length > 0 ? (
            <ul className="list-disc ml-6">
              {shared.notes.map((n, i) => (
                <li key={i}><strong>{n.date || n.createdAt}</strong>: {n.text || n.body || JSON.stringify(n)}</li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-600">No hay notas compartidas.</p>}
        </section>
      )}
    </div>
  );
};

export default SharedView;