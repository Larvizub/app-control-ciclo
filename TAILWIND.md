# Configuración de Tailwind CSS

## ✅ Estado de la Configuración

**Tailwind CSS está correctamente configurado y funcionando** en la aplicación de control del ciclo menstrual.

## 📁 Archivos de Configuración

### 1. **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        cycle: {
          menstruation: '#dc2626',
          fertile: '#16a34a',
          ovulation: '#ca8a04',
          luteal: '#7c3aed',
          safe: '#64748b',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'ring': '0 0 0 3px rgba(59, 130, 246, 0.5)',
        'ring-offset': '0 0 0 2px #ffffff, 0 0 0 4px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Plugin personalizado para scrollbar
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}
```

### 2. **postcss.config.js**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}
```

### 3. **src/index.css**
El archivo incluye:
- Directivas principales de Tailwind (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- Capas organizadas (`@layer base`, `@layer components`)
- Estilos personalizados para componentes específicos
- Animaciones personalizadas
- Estilos para react-calendar

## 🎨 Colores Personalizados

### Paleta Principal
- **Primary (Rosa/Magenta)**: Para acciones principales y elementos destacados
- **Secondary (Azul)**: Para acciones secundarias y enlaces
- **Cycle Colors**: Colores específicos para cada fase del ciclo menstrual

### Uso de Colores
```jsx
// Ejemplos de uso
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Botón Principal
</button>

<div className="text-cycle-menstruation">
  Fase de Menstruación
</div>
```

## 🔧 Componentes Personalizados

### Botones
```jsx
// Botón primario
<button className="btn-primary">
  Mi Botón
</button>

// Tarjeta
<div className="card">
  Contenido de la tarjeta
</div>
```

### Animaciones
```jsx
// Animaciones disponibles
<div className="animate-fade-in">Aparece gradualmente</div>
<div className="animate-slide-up">Se desliza hacia arriba</div>
<div className="animate-pulse-slow">Pulso lento</div>
```

## 📦 Dependencias Instaladas

```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32"
}
```

## ✅ Verificación de Funcionamiento

### Pruebas Realizadas:
1. ✅ **Build de producción**: `npm run build` - Sin errores
2. ✅ **Servidor de desarrollo**: `npm start` - Funcionando en http://localhost:3000
3. ✅ **Procesamiento de CSS**: Tailwind se procesa correctamente
4. ✅ **Clases personalizadas**: Todas las clases funcionan correctamente

### Errores Solucionados:
- ❌ Eliminadas directivas `@apply` problemáticas
- ❌ Reemplazadas propiedades no estándar (ring, ring-offset) por box-shadow
- ❌ Convertido CSS personalizado a formato compatible

## 🚀 Rendimiento

### Optimizaciones:
- **PurgeCSS**: Habilitado automáticamente en producción
- **CSS minificado**: Con cssnano en producción
- **Autoprefixer**: Para compatibilidad con navegadores
- **Hot reload**: Funciona correctamente en desarrollo

## 📝 Notas Adicionales

1. **Compatibilidad**: Compatible con React 18 y Create React App 5
2. **Responsive**: Todas las clases responsive de Tailwind funcionan
3. **Dark mode**: Configurado para soporte futuro
4. **Componentes**: Integrado con @headlessui/react para componentes accesibles

## 🐛 Solución de Problemas

Si encuentras problemas:

1. **Reinicia el servidor de desarrollo**:
   ```bash
   npm start
   ```

2. **Limpia la caché**:
   ```bash
   rm -rf node_modules/.cache
   npm start
   ```

3. **Verifica que las clases estén en el content del config**:
   ```javascript
   content: ["./src/**/*.{js,jsx,ts,tsx}"]
   ```

---

**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**  
**Última actualización**: 15 de junio de 2025  
**Versión**: Tailwind CSS 3.4.0
