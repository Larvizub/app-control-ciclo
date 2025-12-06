// src/components/Profile/Profile.js
import React, { useState } from 'react';
import { User, Edit3, Save, Camera, Heart, Calendar, Activity, Users, Mail, X, Check, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCycle } from '../../contexts/CycleContext';

const Profile = () => {
  const { userProfile, currentUser, isFemaleUser, isMaleUser, shareWithPartner, stopSharingWithPartner, partnerProfile } = useAuth();
  const { periods, symptoms, cycleSettings } = useCycle();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: userProfile?.name || '',
    birthDate: userProfile?.birthDate || '',
    bio: userProfile?.bio || ''
  });
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSave = async () => {
    // Aquí implementarías la lógica para guardar el perfil
    console.log('Guardar perfil:', editedProfile);
    setIsEditing(false);
  };

  const handleShareWithPartner = async () => {
    if (!partnerEmail.trim()) return;
    setIsSharing(true);
    try {
      await shareWithPartner(partnerEmail.trim());
      setPartnerEmail('');
      setShowShareModal(false);
    } catch (error) {
      console.error('Error compartiendo:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleStopSharing = async () => {
    if (window.confirm('¿Estás segura de que quieres dejar de compartir tu ciclo con tu pareja?')) {
      try {
        await stopSharingWithPartner();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const getAge = () => {
    if (!userProfile?.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(userProfile.birthDate);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getNextMilestone = () => {
    if (periods.length < 12) {
      return {
        title: 'Registra 12 períodos',
        progress: (periods.length / 12) * 100,
        description: 'Para obtener predicciones más precisas'
      };
    } else if (symptoms.length < 30) {
      return {
        title: 'Registra 30 síntomas',
        progress: (symptoms.length / 30) * 100,
        description: 'Para insights personalizados'
      };
    } else {
      return {
        title: '¡Experta en seguimiento!',
        progress: 100,
        description: 'Has completado todos los hitos'
      };
    }
  };

  const milestone = getNextMilestone();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Guardar' : 'Editar'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información básica */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {userProfile?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="text-2xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-pink-500 outline-none"
                        placeholder="Tu nombre"
                      />
                      <input
                        type="date"
                        value={editedProfile.birthDate}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="text-gray-600 bg-transparent border-b border-gray-300 focus:border-pink-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {userProfile?.name || 'Usuario'}
                      </h2>
                      <p className="text-gray-600 mb-1">{currentUser?.email}</p>
                      {getAge() && (
                        <p className="text-gray-600">{getAge()} años</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Acerca de mí</h3>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Cuéntanos algo sobre ti..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userProfile?.bio || 'No has agregado una descripción aún.'}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Guardar cambios
                  </button>
                </div>
              )}
            </div>

            {/* Logros y progreso */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Progreso y Logros</h3>
              
              {/* Próximo hito */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-purple-900">{milestone.title}</h4>
                  <span className="text-sm text-purple-700">{Math.round(milestone.progress)}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${milestone.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-purple-700">{milestone.description}</p>
              </div>

              {/* Logros */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{periods.length}</p>
                  <p className="text-sm text-red-700">Períodos registrados</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{symptoms.length}</p>
                  <p className="text-sm text-blue-700">Síntomas registrados</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(0, Math.floor((Date.now() - new Date(userProfile?.createdAt || Date.now())) / (1000 * 60 * 60 * 24)))}
                  </p>
                  <p className="text-sm text-green-700">Días en la app</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🏆</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {periods.length >= 12 ? '12+' : periods.length >= 6 ? '6+' : periods.length >= 3 ? '3+' : '0'}
                  </p>
                  <p className="text-sm text-yellow-700">Nivel alcanzado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tipo de usuario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Perfil</h3>
              <div className={`flex items-center gap-3 p-4 rounded-xl ${isFemaleUser ? 'bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isFemaleUser ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                  {isFemaleUser ? <Heart className="w-6 h-6 text-white" /> : <Users className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <p className={`font-semibold ${isFemaleUser ? 'text-pink-900' : 'text-blue-900'}`}>
                    {isFemaleUser ? 'Perfil Femenino' : 'Perfil Masculino'}
                  </p>
                  <p className={`text-sm ${isFemaleUser ? 'text-pink-700' : 'text-blue-700'}`}>
                    {isFemaleUser ? 'Seguimiento de ciclo' : 'Acompañante de pareja'}
                  </p>
                </div>
              </div>
            </div>

            {/* Compartir con pareja - Solo para mujeres */}
            {isFemaleUser && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-pink-500" />
                  Compartir con Pareja
                </h3>
                
                {userProfile?.partnerId ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">Compartiendo con</p>
                        <p className="text-sm text-green-700">{userProfile.partnerEmail}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleStopSharing}
                      className="w-full px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm font-medium"
                    >
                      Dejar de compartir
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Comparte tu ciclo con tu pareja para que pueda entenderte y apoyarte mejor.
                    </p>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Invitar a mi pareja
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Info de pareja - Solo para hombres */}
            {isMaleUser && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Mi Pareja
                </h3>
                
                {partnerProfile ? (
                  <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {partnerProfile.name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-pink-900">{partnerProfile.name || 'Pareja'}</p>
                      <p className="text-sm text-pink-700">{partnerProfile.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Tu pareja aún no ha compartido su ciclo contigo.</p>
                    <p className="text-xs mt-2">Pídele que te invite desde su perfil.</p>
                  </div>
                )}
              </div>
            )}

            {/* Configuración del ciclo - Solo para mujeres */}
            {isFemaleUser && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mi Ciclo</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duración promedio</span>
                    <span className="font-semibold text-gray-900">
                      {cycleSettings.averageCycleLength} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Período promedio</span>
                    <span className="font-semibold text-gray-900">
                      {cycleSettings.averagePeriodLength} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fase lútea</span>
                    <span className="font-semibold text-gray-900">
                      {cycleSettings.lutealPhaseLength} días
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actividad reciente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {periods.slice(0, 3).map((period, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Período registrado</p>
                      <p className="text-xs text-gray-500">
                        {new Date(period.startDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {symptoms.slice(0, 2).map((symptom, index) => (
                  <div key={index + periods.length} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Síntomas registrados</p>
                      <p className="text-xs text-gray-500">
                        {new Date(symptom.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}

                {periods.length === 0 && symptoms.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay actividad reciente
                  </p>
                )}
              </div>
            </div>

            {/* Insignias */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Insignias</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className={`text-center p-3 rounded-lg ${periods.length >= 1 ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  <span className="text-2xl block mb-1">🎯</span>
                  <span className="text-xs font-medium text-gray-700">Primer registro</span>
                </div>
                <div className={`text-center p-3 rounded-lg ${periods.length >= 6 ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  <span className="text-2xl block mb-1">📊</span>
                  <span className="text-xs font-medium text-gray-700">Seguimiento</span>
                </div>
                <div className={`text-center p-3 rounded-lg ${periods.length >= 12 ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  <span className="text-2xl block mb-1">👑</span>
                  <span className="text-xs font-medium text-gray-700">Experta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para compartir con pareja */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Invitar a tu pareja</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Ingresa el correo electrónico de tu pareja. Debe tener una cuenta con perfil masculino.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo de tu pareja
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="pareja@ejemplo.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleShareWithPartner}
                disabled={!partnerEmail.trim() || isSharing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSharing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Compartiendo...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Compartir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
