// src/components/Auth/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileTypeSelector from './ProfileTypeSelector';

const ProtectedRoute = ({ children, skipProfileCheck = false }) => {
  const { currentUser, userProfile, loading, needsProfileTypeSelection } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Si el usuario no ha seleccionado su tipo de perfil (hombre/mujer)
  // Saltar esta verificación si estamos en la página de selección de perfil
  if (needsProfileTypeSelection && !skipProfileCheck) {
    return <ProfileTypeSelector />;
  }

  // Si el usuario no ha completado el onboarding y no está en la página de onboarding
  // Solo aplicar onboarding para usuarios femeninos
  if (userProfile && userProfile.userType === 'female' && !userProfile.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

export default ProtectedRoute;
