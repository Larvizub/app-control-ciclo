// src/utils/firebaseOptimizer.js

/**
 * Utilidades para optimizar las operaciones de Firebase y evitar actualizaciones innecesarias
 */

/**
 * Comparador profundo para objetos
 * @param {any} obj1 
 * @param {any} obj2 
 * @returns {boolean}
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

/**
 * Crear un hash simple de un objeto para comparaciones rápidas
 * @param {any} obj 
 * @returns {string}
 */
export const createObjectHash = (obj) => {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return String(obj);
  
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

/**
 * Clase para gestionar actualizaciones de Firebase con throttling
 */
export class FirebaseUpdateManager {
  constructor(delay = 1000) {
    this.delay = delay;
    this.pendingUpdates = new Map();
    this.lastUpdateTimes = new Map();
  }

  /**
   * Programa una actualización con throttling
   * @param {string} key - Clave única para la actualización
   * @param {Function} updateFunction - Función que realiza la actualización
   * @param {any} data - Datos para la actualización
   */
  scheduleUpdate(key, updateFunction, data) {
    const now = Date.now();
    const lastUpdate = this.lastUpdateTimes.get(key) || 0;
    
    // Cancelar actualización pendiente anterior
    if (this.pendingUpdates.has(key)) {
      clearTimeout(this.pendingUpdates.get(key));
    }
    
    const executeUpdate = () => {
      this.lastUpdateTimes.set(key, Date.now());
      this.pendingUpdates.delete(key);
      updateFunction(data);
    };
    
    // Si ha pasado suficiente tiempo, ejecutar inmediatamente
    if (now - lastUpdate >= this.delay) {
      executeUpdate();
    } else {
      // Si no, programar para más tarde
      const timeoutId = setTimeout(executeUpdate, this.delay - (now - lastUpdate));
      this.pendingUpdates.set(key, timeoutId);
    }
  }

  /**
   * Cancelar todas las actualizaciones pendientes
   */
  cancelAllUpdates() {
    for (const timeoutId of this.pendingUpdates.values()) {
      clearTimeout(timeoutId);
    }
    this.pendingUpdates.clear();
  }

  /**
   * Limpiar el historial de actualizaciones
   */
  cleanup() {
    this.cancelAllUpdates();
    this.lastUpdateTimes.clear();
  }
}

/**
 * Crear un debouncer para funciones
 * @param {Function} func 
 * @param {number} delay 
 * @returns {Function}
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Crear un throttler para funciones
 * @param {Function} func 
 * @param {number} delay 
 * @returns {Function}
 */
export const throttle = (func, delay) => {
  let lastExec = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastExec >= delay) {
      lastExec = now;
      return func.apply(null, args);
    }
  };
};

/**
 * Validar si una actualización es necesaria comparando timestamps
 * @param {string} currentTimestamp 
 * @param {string} newTimestamp 
 * @param {number} minIntervalMs - Intervalo mínimo entre actualizaciones en ms
 * @returns {boolean}
 */
export const shouldUpdate = (currentTimestamp, newTimestamp, minIntervalMs = 5000) => {
  if (!currentTimestamp || !newTimestamp) return true;
  
  const current = new Date(currentTimestamp).getTime();
  const newTime = new Date(newTimestamp).getTime();
  
  return (newTime - current) >= minIntervalMs;
};

const firebaseOptimizer = {
  deepEqual,
  createObjectHash,
  FirebaseUpdateManager,
  debounce,
  throttle,
  shouldUpdate
};

export default firebaseOptimizer;
