// src/hooks/useThrottledUpdate.js
import { useCallback, useRef } from 'react';

/**
 * Hook para evitar actualizaciones excesivas usando throttling
 * @param {Function} callback - Función a ejecutar
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Function} Función throttled
 */
export const useThrottledUpdate = (callback, delay = 1000) => {
  const lastExecution = useRef(0);
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    
    // Si han pasado suficientes milisegundos desde la última ejecución
    if (now - lastExecution.current >= delay) {
      lastExecution.current = now;
      callback(...args);
    } else {
      // Si no, programar para ejecutar después del delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastExecution.current = Date.now();
        callback(...args);
      }, delay - (now - lastExecution.current));
    }
  }, [callback, delay]);
};

/**
 * Hook para comparar valores profundos y evitar re-renders innecesarios
 * @param {any} value - Valor a comparar
 * @returns {any} Valor memoizado
 */
export const useDeepCompareMemo = (value) => {
  const ref = useRef();
  
  if (!ref.current || JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current;
};

export default useThrottledUpdate;
