// src/contexts/CycleContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ref, set, get, push, onValue, off } from 'firebase/database';
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

const CycleContext = createContext();

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle debe ser usado dentro de CycleProvider');
  }
  return context;
};

export const CycleProvider = ({ children }) => {
  const { currentUser } = useAuth();
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

  // Agregar síntoma
  const addSymptom = useCallback(async (date, symptoms, mood = null, notes = '') => {
    if (!currentUser) return;

    try {
      const symptomData = {
        date: format(date, 'yyyy-MM-dd'),
        symptoms,
        mood,
        notes,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid
      };

      const symptomsRef = ref(database, `symptoms/${currentUser.uid}`);
      await push(symptomsRef, symptomData);
      
      toast.success('Síntomas registrados');
    } catch (error) {
      console.error('Error agregando síntomas:', error);
      toast.error('Error al registrar síntomas');
    }
  }, [currentUser]);

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
      initializeCycleData();
      
      // Cargar períodos
      const periodsRef = ref(database, `periods/${currentUser.uid}`);
      const periodsUnsubscribe = onValue(periodsRef, (snapshot) => {
        if (snapshot.exists()) {
          const periodsData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));
          setPeriods(periodsData);
        } else {
          setPeriods([]);
        }
      });

      // Cargar síntomas
      const symptomsRef = ref(database, `symptoms/${currentUser.uid}`);
      const symptomsUnsubscribe = onValue(symptomsRef, (snapshot) => {
        if (snapshot.exists()) {
          const symptomsData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));
          setSymptoms(symptomsData);
        } else {
          setSymptoms([]);
        }
      });

      // Cargar predicciones
      const predictionsRef = ref(database, `predictions/${currentUser.uid}`);
      const predictionsUnsubscribe = onValue(predictionsRef, (snapshot) => {
        if (snapshot.exists()) {
          setPredictions(snapshot.val());
        }
        setLoading(false);
      });

      return () => {
        off(periodsRef, 'value', periodsUnsubscribe);
        off(symptomsRef, 'value', symptomsUnsubscribe);
        off(predictionsRef, 'value', predictionsUnsubscribe);
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
    updateCycleSettings
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
    updateCycleSettings
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
