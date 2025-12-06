// src/contexts/CycleContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ref, set, get, push, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from './AuthContext';
import { 
  addDays, 
  differenceInDays, 
  format, 
  parseISO,
  isSameDay,
  subDays
} from 'date-fns';
import toast from 'react-hot-toast';
import { deepEqual, FirebaseUpdateManager } from '../utils/firebaseOptimizer';
import { getDatabase, ref as refDb, push as pushDb, set as setDb } from 'firebase/database';

const CycleContext = createContext();

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle debe ser usado dentro de CycleProvider');
  }
  return context;
};

const LOCAL_KEY_SHARE = 'cycle_share_settings';

export const CycleProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const dbAccessDeniedRef = useRef(false);
  const [cycleData, setCycleData] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Referencias para optimización
  const updateManagerRef = useRef(new FirebaseUpdateManager(2000)); // 2 segundos de throttling
  const lastPredictionsHashRef = useRef(null);

  // Configuración del ciclo
  const [cycleSettings, setCycleSettings] = useState({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lutealPhaseLength: 14
  });

  // Inicializar datos del ciclo
  const initializeCycleData = useCallback(async () => {
    if (!currentUser) return;
    if (dbAccessDeniedRef.current) {
      console.warn('Omitiendo initializeCycleData por permisos de DB denegados');
      return;
    }

    try {
      const cycleRef = ref(database, `cycles/${currentUser.uid}`);
      const snapshot = await get(cycleRef);
      
      if (!snapshot.exists()) {
        // Crear datos iniciales del ciclo
        const initialData = {
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
          settings: cycleSettings,
          lastUpdated: new Date().toISOString()
        };
        
        await set(cycleRef, initialData);
        setCycleData(initialData);
      } else {
        setCycleData(snapshot.val());
        if (snapshot.val().settings) {
          setCycleSettings(snapshot.val().settings);
        }
      }
    } catch (error) {
      console.error('Error inicializando datos del ciclo:', error);
      toast.error('Error al cargar datos del ciclo');
    }
  }, [currentUser, cycleSettings]);

  // Calcular predicciones (sin modificar estado ni Firebase automáticamente)
  const calculatePredictions = useCallback((periodsData, currentSettings) => {
    if (!periodsData.length) return null;

    try {
      const sortedPeriods = [...periodsData].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      let calculatedSettings = { ...currentSettings };
      
      // Calcular promedio de duración del ciclo basado en los últimos períodos
      if (sortedPeriods.length >= 2) {
        const cycleLengths = [];
        for (let i = 0; i < sortedPeriods.length - 1; i++) {
          const currentStart = parseISO(sortedPeriods[i].startDate);
          const previousStart = parseISO(sortedPeriods[i + 1].startDate);
          const cycleLength = differenceInDays(currentStart, previousStart);
          if (cycleLength > 0 && cycleLength < 60) {
            cycleLengths.push(cycleLength);
          }
        }
        
        if (cycleLengths.length > 0) {
          const avgCycleLength = Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length);
          calculatedSettings = { ...calculatedSettings, averageCycleLength: avgCycleLength };
        }
      }

      // Predecir próximo período
      const lastPeriod = sortedPeriods[0];
      const nextPeriodStart = addDays(parseISO(lastPeriod.startDate), calculatedSettings.averageCycleLength);
      const ovulationDate = subDays(nextPeriodStart, calculatedSettings.lutealPhaseLength);
      const fertileWindowStart = subDays(ovulationDate, 5);
      const fertileWindowEnd = addDays(ovulationDate, 1);

      return {
        nextPeriod: {
          startDate: format(nextPeriodStart, 'yyyy-MM-dd'),
          endDate: format(addDays(nextPeriodStart, calculatedSettings.averagePeriodLength - 1), 'yyyy-MM-dd')
        },
        ovulation: {
          date: format(ovulationDate, 'yyyy-MM-dd')
        },
        fertileWindow: {
          startDate: format(fertileWindowStart, 'yyyy-MM-dd'),
          endDate: format(fertileWindowEnd, 'yyyy-MM-dd')
        },
        calculatedSettings
      };

    } catch (error) {
      console.error('Error calculando predicciones:', error);
      return null;
    }
  }, []);

  // Actualizar predicciones solo cuando sea necesario
  const updatePredictions = useCallback(async (forceUpdate = false) => {
    if (!periods.length || !currentUser) return;

    try {
      const result = calculatePredictions(periods, cycleSettings);
      if (!result) return;

      const { calculatedSettings, ...newPredictions } = result;
      
      // Crear hash para comparación rápida
      const newPredictionsHash = JSON.stringify(newPredictions);
      
      // Solo actualizar si hay cambios significativos o se fuerza la actualización
      if (forceUpdate || lastPredictionsHashRef.current !== newPredictionsHash) {
        // Actualizar configuración si cambió
        if (!deepEqual(calculatedSettings, cycleSettings)) {
          setCycleSettings(calculatedSettings);
        }
        
        // Actualizar predicciones con timestamp solo si hay cambios reales
        const predictionsWithTime = {
          ...newPredictions,
          updatedAt: new Date().toISOString()
        };
        
        setPredictions(predictionsWithTime);
        lastPredictionsHashRef.current = newPredictionsHash;

        // Usar el gestor de actualizaciones para Firebase con throttling
        updateManagerRef.current.scheduleUpdate(
          'predictions',
          async (data) => {
            const predictionsRef = ref(database, `predictions/${currentUser.uid}`);
            await set(predictionsRef, data);
            console.log('📊 Predicciones actualizadas en Firebase:', new Date().toISOString());
          },
          predictionsWithTime
        );
      }

    } catch (error) {
      console.error('Error actualizando predicciones:', error);
    }
  }, [periods, currentUser, cycleSettings, calculatePredictions]);

  // Agregar período
  const addPeriod = useCallback(async (startDate, endDate = null, flow = 'medium') => {
    if (!currentUser) return;

    try {
      // Validar que startDate sea una fecha válida
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new Error('Fecha de inicio inválida');
      }

      // Validar endDate si existe
      let end = null;
      if (endDate) {
        end = endDate instanceof Date ? endDate : new Date(endDate);
        if (isNaN(end.getTime())) {
          throw new Error('Fecha de fin inválida');
        }
      }

      const periodData = {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: end ? format(end, 'yyyy-MM-dd') : null,
        flow,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid
      };

      const periodsRef = ref(database, `periods/${currentUser.uid}`);
      await push(periodsRef, periodData);
      
      // Actualizar predicciones solo cuando se agregue un período nuevo (cambio significativo)
      await updatePredictions(true); // Force update porque es un cambio importante
      
      toast.success('Período registrado correctamente');
    } catch (error) {
      console.error('Error agregando período:', error);
      toast.error('Error al registrar período');
    }
  }, [currentUser, updatePredictions]);

  // Agregar síntoma (estable, memoizado)
  const addSymptom = useCallback(async (payload) => {
    if (!currentUser) throw new Error('Usuario no autenticado');
    try {
      const db = getDatabase();
      // usar la misma ruta que los listeners: "symptoms/{uid}"
      const userRef = refDb(db, `symptoms/${currentUser.uid}`);
      const newRef = pushDb(userRef);
      const now = Date.now();
      await setDb(newRef, {
        ...payload,
        createdAt: now,
        createdAtISO: new Date(now).toISOString(),
        userId: currentUser.uid
      });
      return newRef.key;
    } catch (err) {
      console.error('addSymptom error:', err);
      throw err;
    }
  }, [currentUser]);
  
  // exportar/adjuntar addSymptom en el contexto si aún no está

  // Calcular fase del ciclo
  const calculateCyclePhase = useCallback((date, lastPeriodStart, cycleLength = 28) => {
    if (!lastPeriodStart) return 'unknown';
    
    const dayOfCycle = differenceInDays(date, parseISO(lastPeriodStart)) + 1;
    
    if (dayOfCycle <= 0) return 'unknown';
    if (dayOfCycle > cycleLength) return 'late';
    
    if (dayOfCycle <= cycleSettings.averagePeriodLength) {
      return 'menstruation';
    } else if (dayOfCycle <= cycleLength - cycleSettings.lutealPhaseLength - 5) {
      return 'follicular';
    } else if (dayOfCycle <= cycleLength - cycleSettings.lutealPhaseLength + 1) {
      return 'fertile';
    } else if (dayOfCycle === cycleLength - cycleSettings.lutealPhaseLength + 2) {
      return 'ovulation';
    } else {
      return 'luteal';
    }
  }, [cycleSettings.averagePeriodLength, cycleSettings.lutealPhaseLength]);

  // Obtener color de la fase
  const getPhaseColor = useCallback((phase) => {
    const colors = {
      menstruation: '#dc2626',
      follicular: '#16a34a',
      fertile: '#16a34a',
      ovulation: '#ca8a04',
      luteal: '#7c3aed',
      unknown: '#64748b',
      late: '#dc2626'
    };
    return colors[phase] || colors.unknown;
  }, []);

  // Obtener información de la fase
  const getPhaseInfo = useCallback((phase) => {
    const info = {
      menstruation: {
        name: 'Menstruación',
        description: 'Tu período menstrual',
        tips: ['Mantente hidratada', 'Descansa lo suficiente', 'Usa compresas o tampones']
      },
      follicular: {
        name: 'Fase Folicular',
        description: 'Tu cuerpo se prepara para la ovulación',
        tips: ['Buen momento para ejercitarse', 'Energía en aumento', 'Planifica actividades']
      },
      fertile: {
        name: 'Ventana Fértil',
        description: 'Días con mayor probabilidad de embarazo',
        tips: ['Usa protección si no planeas embarazarte', 'Observa cambios en el moco cervical']
      },
      ovulation: {
        name: 'Ovulación',
        description: 'Día de mayor fertilidad',
        tips: ['Pico de fertilidad', 'Posible aumento de temperatura corporal']
      },
      luteal: {
        name: 'Fase Lútea',
        description: 'Después de la ovulación',
        tips: ['Posibles síntomas premenstruales', 'Cuida tu alimentación']
      },
      unknown: {
        name: 'Desconocido',
        description: 'Necesitamos más datos para predecir',
        tips: ['Registra tu período para obtener predicciones']
      },
      late: {
        name: 'Período Tardío',
        description: 'Tu período se ha retrasado',
        tips: ['Considera hacer una prueba de embarazo', 'Consulta con tu médico si continúa']
      }
    };
    return info[phase] || info.unknown;
  }, []);

  // Obtener datos de un día específico
  const getDayData = useCallback((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Buscar período
    const period = periods.find(p => {
      const start = parseISO(p.startDate);
      const end = p.endDate ? parseISO(p.endDate) : addDays(start, cycleSettings.averagePeriodLength - 1);
      return date >= start && date <= end;
    });

    // Buscar síntomas
    const daySymptoms = symptoms.filter(s => s.date === dateStr);

    // Calcular fase
    const lastPeriod = periods.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
    const phase = lastPeriod ? calculateCyclePhase(date, lastPeriod.startDate) : 'unknown';

    return {
      date: dateStr,
      period,
      symptoms: daySymptoms,
      phase,
      phaseInfo: getPhaseInfo(phase),
      color: getPhaseColor(phase),
      isPredicted: predictions && (
        isSameDay(date, parseISO(predictions.nextPeriod.startDate)) ||
        isSameDay(date, parseISO(predictions.ovulation.date)) ||
        (date >= parseISO(predictions.fertileWindow.startDate) && date <= parseISO(predictions.fertileWindow.endDate))
      )
    };
  }, [periods, symptoms, cycleSettings.averagePeriodLength, predictions, calculateCyclePhase, getPhaseColor, getPhaseInfo]);

  // Cargar datos
  useEffect(() => {
    if (currentUser) {
      if (dbAccessDeniedRef.current) {
        console.warn('Acceso a Realtime Database denegado — listeners omitidos (CycleContext)');
        setLoading(false);
        return;
      }
      initializeCycleData();
      
      // Cargar períodos
      const periodsRef = ref(database, `periods/${currentUser.uid}`);
      let periodsUnsubscribe;
      periodsUnsubscribe = onValue(
        periodsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const periodsData = Object.entries(snapshot.val()).map(([id, data]) => ({
              id,
              ...data
            }));
            setPeriods(periodsData);
          } else {
            setPeriods([]);
          }
        },
        (error) => {
          console.warn('Firebase periods listener error', error);
          setPeriods([]);
          if (error && /permission_denied/i.test(error.message || error.code || '')) {
            dbAccessDeniedRef.current = true;
            toast.error('Acceso a la base de datos denegado. Revisa las reglas de Firebase.');
            try { if (typeof periodsUnsubscribe === 'function') periodsUnsubscribe(); } catch (e) {}
            try { if (typeof symptomsUnsubscribe === 'function') symptomsUnsubscribe(); } catch (e) {}
            try { if (typeof predictionsUnsubscribe === 'function') predictionsUnsubscribe(); } catch (e) {}
          }
        }
      );

      // Cargar síntomas
      const symptomsRef = ref(database, `symptoms/${currentUser.uid}`);
      let symptomsUnsubscribe;
      symptomsUnsubscribe = onValue(
        symptomsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const symptomsData = Object.entries(snapshot.val()).map(([id, data]) => ({
              id,
              ...data
            }));
            setSymptoms(symptomsData);
          } else {
            setSymptoms([]);
          }
        },
        (error) => {
          console.warn('Firebase symptoms listener error', error);
          setSymptoms([]);
          if (error && /permission_denied/i.test(error.message || error.code || '')) {
            dbAccessDeniedRef.current = true;
            toast.error('Acceso a la base de datos denegado. Revisa las reglas de Firebase.');
            try { if (typeof periodsUnsubscribe === 'function') periodsUnsubscribe(); } catch (e) {}
            try { if (typeof symptomsUnsubscribe === 'function') symptomsUnsubscribe(); } catch (e) {}
            try { if (typeof predictionsUnsubscribe === 'function') predictionsUnsubscribe(); } catch (e) {}
          }
        }
      );

      // Cargar predicciones
      const predictionsRef = ref(database, `predictions/${currentUser.uid}`);
      let predictionsUnsubscribe;
      predictionsUnsubscribe = onValue(
        predictionsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setPredictions(snapshot.val());
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firebase predictions listener error', error);
          setPredictions(null);
          setLoading(false);
          if (error && /permission_denied/i.test(error.message || error.code || '')) {
            dbAccessDeniedRef.current = true;
            toast.error('Acceso a la base de datos denegado. Revisa las reglas de Firebase.');
            try { if (typeof periodsUnsubscribe === 'function') periodsUnsubscribe(); } catch (e) {}
            try { if (typeof symptomsUnsubscribe === 'function') symptomsUnsubscribe(); } catch (e) {}
            try { if (typeof predictionsUnsubscribe === 'function') predictionsUnsubscribe(); } catch (e) {}
          }
        }
      );

      return () => {
        try {
          if (typeof periodsUnsubscribe === 'function') periodsUnsubscribe();
        } catch (e) {
          console.warn('Error al limpiar periods listener', e);
        }

        try {
          if (typeof symptomsUnsubscribe === 'function') symptomsUnsubscribe();
        } catch (e) {
          console.warn('Error al limpiar symptoms listener', e);
        }

        try {
          if (typeof predictionsUnsubscribe === 'function') predictionsUnsubscribe();
        } catch (e) {
          console.warn('Error al limpiar predictions listener', e);
        }
      };
    } else {
      setLoading(false);
    }
  }, [currentUser, initializeCycleData]);

  // Actualizar predicciones cuando cambien los períodos (con debounce)
  const periodsLength = useMemo(() => periods.length, [periods]);
  const periodsHash = useMemo(() => {
    return periods.map(p => `${p.startDate}-${p.endDate || 'ongoing'}-${p.flow}`).join('|');
  }, [periods]);
  
  useEffect(() => {
    if (periodsLength === 0) return;
    
    // Debounce para evitar actualizaciones excesivas
    const timeoutId = setTimeout(() => {
      updatePredictions();
    }, 500); // Esperar 500ms antes de actualizar
    
    return () => clearTimeout(timeoutId);
  }, [periodsHash, periodsLength, updatePredictions]); // Incluir periodsLength para ESLint

  // Actualizar configuración del ciclo
  const updateCycleSettings = useCallback(async (newSettings) => {
    if (!currentUser) return;

    try {
      console.log('Actualizando configuración del ciclo:', newSettings);
      
      const settingsToUpdate = {
        ...cycleSettings,
        ...newSettings
      };

      // Solo actualizar si hay cambios reales
      const hasChanges = JSON.stringify(cycleSettings) !== JSON.stringify(settingsToUpdate);
      if (!hasChanges && !newSettings.lastPeriodDate) {
        console.log('No hay cambios en la configuración');
        return;
      }

      const cycleRef = ref(database, `cycles/${currentUser.uid}/settings`);
      await set(cycleRef, settingsToUpdate);
      
      setCycleSettings(settingsToUpdate);
      
      // Si hay una fecha de último período, agregar el período
      if (newSettings.lastPeriodDate) {
        console.log('Agregando período inicial:', newSettings.lastPeriodDate);
        
        const startDate = new Date(newSettings.lastPeriodDate);
        const endDate = addDays(startDate, (newSettings.periodLength || 5) - 1);
        
        // Validar que las fechas sean válidas
        if (isNaN(startDate.getTime())) {
          throw new Error('Fecha de último período inválida');
        }
        
        await addPeriod(startDate, endDate, 'medium');
        console.log('Período inicial agregado correctamente');
      } else if (hasChanges) {
        // Solo actualizar predicciones si hubo cambios en configuración
        await updatePredictions(true);
      }
      
      toast.success('Configuración del ciclo actualizada');
    } catch (error) {
      console.error('Error actualizando configuración del ciclo:', error);
      toast.error('Error al actualizar la configuración');
      throw error;
    }
  }, [currentUser, cycleSettings, addPeriod, updatePredictions]);

  // --- Nuevo: settings de compartido (persistidos en localStorage) ---
  const [shareSettings, setShareSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY_SHARE);
      return raw
        ? JSON.parse(raw)
        : {
            // backward compatible single partnerId
            partnerId: null,
            // array of authorized partners: { email, permissions, addedAt }
            authorized: [],
            permissions: {
              periods: true,
              symptoms: true,
              mood: true,
              predictions: true,
              notes: false
            },
            lastUpdated: null
          };
    } catch (e) {
      return {
        partnerId: null,
        authorized: [],
        permissions: {
          periods: true,
          symptoms: true,
          mood: true,
          predictions: true,
          notes: false
        },
        lastUpdated: null
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY_SHARE, JSON.stringify(shareSettings));
    } catch (e) {
      // persist fail silent
    }
  }, [shareSettings]);

  // Persistir en Firebase (async) con fallback a localStorage si hay permisos denegados
  const persistShareSettingsToDb = useCallback(async (data) => {
    if (!currentUser) return;
    if (dbAccessDeniedRef.current) return;
    try {
      const shareRef = ref(database, `cycles/${currentUser.uid}/shareSettings`);
      await set(shareRef, data);
    } catch (err) {
      console.warn('Error guardando shareSettings en DB', err);
      if (err && /permission_denied/i.test(err.message || err.code || '')) {
        dbAccessDeniedRef.current = true;
        toast.error('No se pudo guardar configuraciones de compartido en la base de datos. Se usará almacenamiento local.');
      }
    }
  }, [currentUser]);

  const updateShareSettings = useCallback((patch) => {
    setShareSettings((prev) => {
      const merged = {
        ...prev,
        ...patch,
        // merge permissions safely
        permissions: { ...(prev.permissions || {}), ...(patch.permissions || {}) },
        // keep authorized array if provided, otherwise keep prev
        authorized: patch.authorized ? patch.authorized : prev.authorized,
        // maintain partnerId for backward compatibility
        partnerId: patch.partnerId !== undefined ? patch.partnerId : prev.partnerId,
        lastUpdated: new Date().toISOString()
      };
      try { localStorage.setItem(LOCAL_KEY_SHARE, JSON.stringify(merged)); } catch {}
      // intentar persistir en DB (no bloquear UI)
      persistShareSettingsToDb(merged);
      return merged;
    });
  }, [persistShareSettingsToDb]);

  // Añadir un correo autorizado (o actualizar permisos si ya existe)
  const addAuthorized = useCallback((email, permissions = null) => {
    if (!email) return;
    setShareSettings((prev) => {
      const existing = Array.isArray(prev.authorized) ? [...prev.authorized] : [];
      const idx = existing.findIndex(a => a.email === email);
      const now = new Date().toISOString();
      if (idx >= 0) {
        existing[idx] = {
          ...existing[idx],
          permissions: permissions ? permissions : existing[idx].permissions,
          updatedAt: now
        };
      } else {
        existing.push({ email, permissions: permissions || prev.permissions || {}, addedAt: now });
      }

      const merged = {
        ...prev,
        authorized: existing,
        partnerId: existing.length ? existing[0].email : null,
        lastUpdated: now
      };
      try { localStorage.setItem(LOCAL_KEY_SHARE, JSON.stringify(merged)); } catch {}
      // persistir en DB
      persistShareSettingsToDb(merged);
      return merged;
    });
  }, [persistShareSettingsToDb]);

  const removeAuthorized = useCallback((email) => {
    if (!email) return;
    setShareSettings((prev) => {
      const existing = Array.isArray(prev.authorized) ? prev.authorized.filter(a => a.email !== email) : [];
      const merged = {
        ...prev,
        authorized: existing,
        partnerId: existing.length ? existing[0].email : null,
        lastUpdated: new Date().toISOString()
      };
      try { localStorage.setItem(LOCAL_KEY_SHARE, JSON.stringify(merged)); } catch {}
      // persistir en DB
      persistShareSettingsToDb(merged);
      return merged;
    });
  }, [persistShareSettingsToDb]);

  // Escuchar cambios en la DB para shareSettings y sincronizar localmente
  useEffect(() => {
    if (!currentUser) return;
    if (dbAccessDeniedRef.current) return;

    let shareUnsubscribe;
    try {
      const shareRef = ref(database, `cycles/${currentUser.uid}/shareSettings`);
      shareUnsubscribe = onValue(
        shareRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setShareSettings((prev) => {
              const merged = { ...prev, ...data };
              try { localStorage.setItem(LOCAL_KEY_SHARE, JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        },
        (error) => {
          console.warn('Firebase shareSettings listener error', error);
          if (error && /permission_denied/i.test(error.message || error.code || '')) {
            dbAccessDeniedRef.current = true;
            toast.error('Acceso a configuraciones de compartido denegado. Usando almacenamiento local.');
            try { if (typeof shareUnsubscribe === 'function') shareUnsubscribe(); } catch (e) {}
          }
        }
      );
    } catch (e) {
      console.warn('No se pudo crear listener de shareSettings', e);
    }

    return () => {
      try { if (typeof shareUnsubscribe === 'function') shareUnsubscribe(); } catch (e) {}
    };
  }, [currentUser]);

  const getShareSettings = useCallback(() => shareSettings, [shareSettings]);

  // --- Nuevo: obtener datos "compartibles" filtrados según permisos ---
  // Se asume que en este contexto existen datos como `periods`, `symptoms`, `predictions`, `notes`.
  const getSharedData = useCallback((forPartnerId) => {
    const allowed = shareSettings && shareSettings.partnerId === forPartnerId
      ? (shareSettings.permissions || {})
      : {}; // si partnerId no coincide, no otorgar permisos

    // Construir payload usando únicamente los estados disponibles en este contexto
    const data = {
      periods: allowed.periods ? (Array.isArray(periods) ? periods : []) : [],
      symptoms: allowed.symptoms ? (Array.isArray(symptoms) ? symptoms : []) : [],
      // Estado de ánimo: si no hay entradas separadas, intentar inferir desde symptoms (fallback vacío)
      mood: allowed.mood ? (Array.isArray(cycleData?.mood) ? cycleData.mood : []) : [],
      // Predicciones: puede ser objeto o null; estandarizar a arreglo cuando se comparte
      predictions: allowed.predictions ? (predictions ? [predictions] : []) : [],
      // Notas: tomar de cycleData si existe
      notes: allowed.notes ? (Array.isArray(cycleData?.notes) ? cycleData.notes : []) : []
    };

    return data;
  }, [shareSettings, periods, symptoms, predictions, cycleData]);

  const value = useMemo(() => ({
    cycleData,
    periods,
    symptoms,
    predictions,
    cycleSettings,
    loading,
    addPeriod,
    addSymptom,
    getDayData,
    calculateCyclePhase,
    getPhaseColor,
    getPhaseInfo,
    updatePredictions,
    setCycleSettings,
    updateCycleSettings,
    // nuevo:
    shareSettings,
    updateShareSettings,
    getShareSettings,
    getSharedData,
    addAuthorized,
    removeAuthorized,
  }), [
    cycleData,
    periods,
    symptoms,
    predictions,
    cycleSettings,
    loading,
    addPeriod,
    addSymptom,
    getDayData,
    calculateCyclePhase,
    getPhaseColor,
    getPhaseInfo,
    updatePredictions,
    setCycleSettings,
    updateCycleSettings,
    // nuevo:
    shareSettings,
    updateShareSettings,
    getShareSettings,
    getSharedData,
    addAuthorized,
    removeAuthorized,
  ]);

  // Efecto de limpieza para el gestor de actualizaciones
  useEffect(() => {
    const updateManager = updateManagerRef.current;
    return () => {
      updateManager.cleanup();
    };
  }, []);

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
};
