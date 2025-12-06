// src/components/Auth/ProfileTypeSelector.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Users, Sparkles } from 'lucide-react';

const ProfileTypeSelector = () => {
  const { setUserType, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const handleSelectType = async (type) => {
    setSelectedType(type);
    setIsLoading(true);
    try {
      await setUserType(type);
    } catch (error) {
      console.error('Error seleccionando tipo de perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ¡Bienvenid{userProfile?.name ? 'a' : 'o'}, {userProfile?.name || 'Usuario'}!
          </h1>
          <p className="text-gray-600">
            Selecciona tu perfil para personalizar tu experiencia
          </p>
        </div>

        {/* Profile type cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Female profile */}
          <button
            onClick={() => handleSelectType('female')}
            disabled={isLoading}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedType === 'female'
                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-200/50'
                : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
              selectedType === 'female'
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg'
                : 'bg-gradient-to-br from-pink-100 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200'
            }`}>
              <Heart className={`w-8 h-8 ${selectedType === 'female' ? 'text-white' : 'text-pink-600'}`} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Soy Mujer</h3>
            <p className="text-sm text-gray-600 mb-4">
              Registra y monitorea tu ciclo menstrual, síntomas y bienestar
            </p>
            
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                Seguimiento de ciclo completo
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                Predicciones y recordatorios
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                Comparte con tu pareja
              </li>
            </ul>

            {selectedType === 'female' && isLoading && (
              <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>

          {/* Male profile */}
          <button
            onClick={() => handleSelectType('male')}
            disabled={isLoading}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedType === 'male'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
              selectedType === 'male'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
            }`}>
              <Users className={`w-8 h-8 ${selectedType === 'male' ? 'text-white' : 'text-blue-600'}`} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Soy Hombre</h3>
            <p className="text-sm text-gray-600 mb-4">
              Apoya a tu pareja entendiendo y acompañando su ciclo
            </p>
            
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Ve el ciclo de tu pareja
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Recibe recordatorios útiles
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Envía mensajes de apoyo
              </li>
            </ul>

            {selectedType === 'male' && isLoading && (
              <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400">
          Puedes cambiar esto más tarde en la configuración
        </p>
      </div>
    </div>
  );
};

export default ProfileTypeSelector;
