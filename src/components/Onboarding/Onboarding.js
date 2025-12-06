// src/components/Onboarding/Onboarding.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Heart, 
  Users, 
  Shield,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCycle } from '../../contexts/CycleContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    lastPeriodDate: '',
    cycleLength: 28,
    periodLength: 5,
    birthDate: '',
    notifications: true,
    shareWithPartner: false,
    goals: []
  });

  const { userProfile, updateUserProfile } = useAuth();
  const { updateCycleSettings } = useCycle();

  const steps = [
    {
      title: '¡Bienvenida a tu nueva compañera!',
      subtitle: 'Descubre una nueva forma de conocer tu ciclo',
      icon: Sparkles,
      content: 'welcome'
    },
    {
      title: 'Cuéntanos sobre tu último período',
      subtitle: 'Esta información nos ayuda a hacer predicciones precisas',
      icon: Calendar,
      content: 'period-info'
    },
    {
      title: 'Personaliza tu experiencia',
      subtitle: 'Configura recordatorios y preferencias',
      icon: Heart,
      content: 'preferences'
    },
    {
      title: 'Conecta con amigas y pareja',
      subtitle: 'Comparte y recibe apoyo de quien más confías',
      icon: Users,
      content: 'social'
    },
    {
      title: 'Tu privacidad es importante',
      subtitle: 'Controla qué información compartes y con quién',
      icon: Shield,
      content: 'privacy'
    },
    {
      title: '¡Todo listo!',
      subtitle: 'Comienza tu viaje hacia un mejor autoconocimiento',
      icon: CheckCircle,
      content: 'complete'
    }
  ];

  const goals = [
    { id: 'track-period', label: 'Seguir mi período', icon: '🩸' },
    { id: 'predict-ovulation', label: 'Predecir ovulación', icon: '🥚' },
    { id: 'track-symptoms', label: 'Registrar síntomas', icon: '💊' },
    { id: 'share-partner', label: 'Compartir con pareja', icon: '💕' },
    { id: 'connect-friends', label: 'Conectar con amigas', icon: '👭' },
    { id: 'health-insights', label: 'Obtener insights de salud', icon: '📊' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalToggle = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('Iniciando proceso de onboarding...', formData);
      
      // Actualizar perfil de usuario
      await updateUserProfile({
        ...userProfile,
        birthDate: formData.birthDate,
        onboardingCompleted: true,
        goals: formData.goals,
        preferences: {
          notifications: formData.notifications,
          shareWithPartner: formData.shareWithPartner
        }
      });

      console.log('Perfil actualizado correctamente');

      // Actualizar configuración del ciclo
      if (formData.lastPeriodDate) {
        console.log('Actualizando configuración del ciclo...', {
          lastPeriodDate: formData.lastPeriodDate,
          cycleLength: formData.cycleLength,
          periodLength: formData.periodLength
        });
        
        await updateCycleSettings({
          lastPeriodDate: formData.lastPeriodDate,
          cycleLength: formData.cycleLength,
          periodLength: formData.periodLength
        });
        
        console.log('Configuración del ciclo actualizada correctamente');
      }

      console.log('Onboarding completado exitosamente');
      
      // Redirigir al dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Mostrar mensaje de error al usuario
      alert('Error al completar la configuración inicial. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    const Icon = step.icon;

    switch (step.content) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Icon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Te ayudaremos a entender mejor tu cuerpo, predecir tu ciclo y conectar con otras mujeres que comparten tu experiencia.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>Seguimiento preciso</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Salud personalizada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span>Comunidad de apoyo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-pink-500" />
                  <span>Privacidad total</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'period-info':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuándo fue tu último período?
                </label>
                <input
                  type="date"
                  value={formData.lastPeriodDate}
                  onChange={(e) => handleInputChange('lastPeriodDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración del ciclo (días)
                  </label>
                  <select
                    value={formData.cycleLength}
                    onChange={(e) => handleInputChange('cycleLength', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    {Array.from({ length: 21 }, (_, i) => i + 21).map(day => (
                      <option key={day} value={day}>{day} días</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración del período (días)
                  </label>
                  <select
                    value={formData.periodLength}
                    onChange={(e) => handleInputChange('periodLength', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 3).map(day => (
                      <option key={day} value={day}>{day} días</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de nacimiento (opcional)
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esto nos ayudará a mejorar tu experiencia.
                </p>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ¿Qué objetivos tienes?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.goals.includes(goal.id)
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{goal.icon}</div>
                      <div className="text-sm font-medium">{goal.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Recordatorios</p>
                    <p className="text-sm text-gray-600">Recibe notificaciones sobre tu ciclo</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('notifications', !formData.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.notifications ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            </div>
            
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg text-gray-600">
                  Conecta con amigas y pareja para recibir apoyo y compartir experiencias.
                </p>
                <p className="text-sm text-gray-500">
                  Siempre puedes cambiar estas configuraciones más tarde.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Conecta con amigas</h4>
                      <p className="text-sm text-gray-600">
                        Chatea, comparte experiencias y recibe apoyo mutuo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Comparte con tu pareja</h4>
                      <p className="text-sm text-gray-600">
                        Mantén informada a tu pareja sobre tu ciclo
                      </p>
                    </div>
                    <button
                      onClick={() => handleInputChange('shareWithPartner', !formData.shareWithPartner)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.shareWithPartner ? 'bg-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.shareWithPartner ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            </div>
            
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg text-gray-600">
                  Tu información está protegida y tú decides qué compartir.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Encriptación end-to-end</p>
                      <p className="text-sm text-green-600">
                        Toda tu información se encripta antes de almacenarse
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Control total</p>
                      <p className="text-sm text-blue-600">
                        Decides exactamente qué información compartir y con quién
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">Anonimato opcional</p>
                      <p className="text-sm text-purple-600">
                        Puedes participar en la comunidad de forma anónima
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Icon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                ¡Perfecto! Ya tienes todo configurado para comenzar tu viaje hacia un mejor autoconocimiento.
              </p>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">¿Qué sigue?</h4>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Explora tu dashboard personalizado</li>
                  <li>• Registra síntomas y estados de ánimo</li>
                  <li>• Conecta con amigas en la sección Social</li>
                  <li>• Revisa las predicciones de tu ciclo</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-600">
                {steps[currentStep].subtitle}
              </p>
            </div>

            {/* Step content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Anterior</span>
            </button>

            <button
              onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
              disabled={(currentStep === 1 && !formData.lastPeriodDate) || isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>
                    {currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
