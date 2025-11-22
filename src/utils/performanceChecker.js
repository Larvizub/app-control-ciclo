// src/utils/performanceChecker.js
import React from 'react';

/**
 * Utilidad para verificar el rendimiento y detectar posibles problemas
 */

export class PerformanceChecker {
  constructor() {
    this.renderCounts = new Map();
    this.lastRenderTime = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Registrar un render de componente
  trackRender(componentName) {
    if (!this.isEnabled) return;

    const now = Date.now();
    const count = this.renderCounts.get(componentName) || 0;
    const lastTime = this.lastRenderTime.get(componentName) || 0;

    this.renderCounts.set(componentName, count + 1);
    this.lastRenderTime.set(componentName, now);

    // Detectar renders muy frecuentes (posible bucle)
    if (now - lastTime < 100 && count > 5) {
      console.warn(`⚠️ Posible render loop detectado en ${componentName}:`, {
        renderCount: count,
        timeSinceLastRender: now - lastTime
      });
    }

    // Log cada 10 renders para componentes activos
    if (count % 10 === 0) {
      console.log(`📊 ${componentName} ha renderizado ${count} veces`);
    }
  }

  // Verificar optimizaciones de contexto
  checkContextOptimization(contextName, value) {
    if (!this.isEnabled) return;

    const prevValue = this.lastContextValues?.get(contextName);
    if (prevValue && JSON.stringify(prevValue) === JSON.stringify(value)) {
      console.warn(`⚠️ ${contextName} está pasando el mismo valor. Considera usar useMemo.`);
    }

    if (!this.lastContextValues) {
      this.lastContextValues = new Map();
    }
    this.lastContextValues.set(contextName, value);
  }

  // Verificar dependencias de useEffect
  checkEffectDependencies(componentName, dependencies) {
    if (!this.isEnabled) return;

    dependencies.forEach((dep, index) => {
      if (typeof dep === 'object' && dep !== null) {
        console.warn(`⚠️ ${componentName}: Dependencia de objeto en useEffect (índice ${index}). Considera usar propiedades específicas.`);
      }
    });
  }

  // Mostrar estadísticas de rendimiento
  showStats() {
    if (!this.isEnabled) return;

    console.group('📊 Estadísticas de Rendimiento');
    this.renderCounts.forEach((count, component) => {
      console.log(`${component}: ${count} renders`);
    });
    console.groupEnd();
  }

  // Limpiar estadísticas
  clearStats() {
    this.renderCounts.clear();
    this.lastRenderTime.clear();
    this.lastContextValues?.clear();
  }
}

// Instancia global del checker
export const performanceChecker = new PerformanceChecker();

// Hook para usar en componentes
export const usePerformanceTracker = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    performanceChecker.trackRender(componentName);
  }
};

// HOC para trackear renders automáticamente
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  const TrackedComponent = (props) => {
    usePerformanceTracker(componentName || WrappedComponent.name);
    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `Tracked(${componentName || WrappedComponent.name})`;
  return TrackedComponent;
};

export default performanceChecker;
