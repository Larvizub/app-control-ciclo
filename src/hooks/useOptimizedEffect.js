// src/hooks/useOptimizedEffect.js
import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado que optimiza useEffect al comparar dependencias de manera más inteligente
 * Solo ejecuta el efecto si las dependencias realmente han cambiado
 */
export const useOptimizedEffect = (effect, dependencies) => {
  const prevDepsRef = useRef();
  const hasChanged = useRef(true);

  // Comparar dependencias
  if (prevDepsRef.current) {
    hasChanged.current = dependencies.some((dep, index) => {
      const prevDep = prevDepsRef.current[index];
      
      // Comparación profunda para objetos y arrays
      if (typeof dep === 'object' && dep !== null && typeof prevDep === 'object' && prevDep !== null) {
        return JSON.stringify(dep) !== JSON.stringify(prevDep);
      }
      
      // Comparación estricta para valores primitivos
      return !Object.is(dep, prevDep);
    });
  }

  prevDepsRef.current = dependencies;

  useEffect(() => {
    if (hasChanged.current) {
      return effect();
    }
  }, dependencies);
};

/**
 * Hook para debounce de funciones
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para memoización con limpieza automática
 */
export const useSmartMemo = (factory, deps, maxCacheSize = 10) => {
  const cache = useRef(new Map());
  const cacheKeys = useRef([]);

  const key = JSON.stringify(deps);
  
  if (cache.current.has(key)) {
    return cache.current.get(key);
  }

  const value = factory();
  
  // Limpiar cache si excede el tamaño máximo
  if (cache.current.size >= maxCacheSize) {
    const oldestKey = cacheKeys.current.shift();
    cache.current.delete(oldestKey);
  }
  
  cache.current.set(key, value);
  cacheKeys.current.push(key);
  
  return value;
};

export default useOptimizedEffect;
