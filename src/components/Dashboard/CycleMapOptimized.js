// src/components/Dashboard/CycleMapOptimized.js
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useCycle } from '../../contexts/CycleContext';
import { 
  addDays, 
  subDays, 
  format, 
  differenceInDays,
  isSameDay,
  startOfDay
} from 'date-fns';

const CycleMapOptimized = React.memo(() => {
  const canvasRef = useRef(null);
  const { getDayData, periods } = useCycle();

  // Memoizar las fechas de rango para evitar recálculos innecesarios
  const dateRange = useMemo(() => {
    const startDate = subDays(new Date(), 90);
    const endDate = addDays(new Date(), 30);
    const totalDays = differenceInDays(endDate, startDate);
    return { startDate, endDate, totalDays };
  }, []);

  // Memoizar datos del día actual
  const todayData = useMemo(() => {
    return getDayData(new Date());
  }, [getDayData]);

  const drawCycleMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Configuración usando dateRange memoizado
    const { startDate, totalDays } = dateRange;
    const dayWidth = width / totalDays;
    const today = startOfDay(new Date());

    // Dibujar días
    for (let i = 0; i < totalDays; i++) {
      const currentDate = addDays(startDate, i);
      const dayData = getDayData(currentDate);
      const x = i * dayWidth;
      const y = 0;
      const w = dayWidth;
      const h = height - 40; // Dejar espacio para la leyenda

      // Color basado en la fase
      let color = dayData.color;
      let alpha = 0.6;

      // Destacar día actual
      if (isSameDay(currentDate, today)) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        alpha = 0.8;
      }

      // Dibujar día
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x, y, w, h);

      // Destacar períodos confirmados
      if (dayData.period) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x, y, w, h);
      }

      // Marcar predicciones
      if (dayData.isPredicted) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x, h - 5, w, 5);
      }
    }

    // Dibujar leyenda
    const legendY = height - 25;
    const legendItems = [
      { color: '#dc2626', label: 'Menstruación' },
      { color: '#16a34a', label: 'Folicular' },
      { color: '#ca8a04', label: 'Ovulación' },
      { color: '#7c3aed', label: 'Lútea' }
    ];

    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    const itemWidth = width / legendItems.length;

    legendItems.forEach((item, index) => {
      const x = index * itemWidth + itemWidth / 2;
      
      // Dibujar círculo de color
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x, legendY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Dibujar etiqueta
      ctx.fillStyle = '#374151';
      ctx.fillText(item.label, x, legendY + 15);
    });
  }, [dateRange, getDayData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Configurar tamaño del canvas
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = 200;
      
      drawCycleMap();
    }
  }, [drawCycleMap]);

  // Redimensionar canvas cuando cambie el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = 200;
        drawCycleMap();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCycleMap]);

  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = canvas.width;
    
    const { startDate, totalDays } = dateRange;
    const dayWidth = width / totalDays;
    
    const clickedDayIndex = Math.floor(x / dayWidth);
    const clickedDate = addDays(startDate, clickedDayIndex);
    const dayData = getDayData(clickedDate);

    // Mostrar información del día clickeado
    console.log('Día clickeado:', {
      date: format(clickedDate, 'yyyy-MM-dd'),
      phase: dayData.phase,
      phaseInfo: dayData.phaseInfo
    });
  }, [dateRange, getDayData]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full cursor-pointer rounded-lg"
        style={{ height: '200px' }}
      />
      
      {/* Información adicional */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>3 meses atrás</span>
        <span className="font-medium">HOY</span>
        <span>1 mes adelante</span>
      </div>

      {/* Información de hoy */}
      {periods.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Fase actual:
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {todayData.phaseInfo.name}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {todayData.phaseInfo.description}
          </p>
        </div>
      )}
    </div>
  );
});

CycleMapOptimized.displayName = 'CycleMapOptimized';

export default CycleMapOptimized;
