// src/hooks/useSmartUpdate.js
import { useRef, useCallback } from 'react';

/**
 * Hook personalizado para memoización inteligente que evita actualizaciones innecesarias
 * @param {Function} updateFunction - La función que realiza la actualización
 * @param {Array} dependencies - Las dependencias a monitorear
 * @param {number} debounceMs - Tiempo de debounce en milisegundos (opcional)
 */
export const useSmartUpdate = (updateFunction, dependencies, debounceMs = 0) => {
  const lastDepsRef = useRef();
  const timeoutRef = useRef();

  const memoizedUpdate = useCallback((...args) => {
    // Comparar dependencias para evitar actualizaciones innecesarias
    const depsChanged = !lastDepsRef.current || 
      dependencies.some((dep, index) => 
        !Object.is(dep, lastDepsRef.current[index])
      );

    if (!depsChanged) {
      return;
    }

    // Guardar las nuevas dependencias
    lastDepsRef.current = dependencies;

    // Aplicar debounce si se especifica
    if (debounceMs > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        updateFunction(...args);
      }, debounceMs);
    } else {
      updateFunction(...args);
    }
  }, dependencies);

  return memoizedUpdate;
};

/**
 * Hook para comparación profunda de objetos
 * @param {*} value - El valor a memoizar
 */
export const useDeepMemo = (value) => {
  const ref = useRef();
  
  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
};

// Función auxiliar para comparación profunda
const deepEqual = (a, b) => {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  
  return false;
};
