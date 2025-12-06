// src/components/Settings/Settings.js
import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Smartphone, Users, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { logout, isFemaleUser, isMaleUser, setUserType } = useAuth();
  const [isChangingProfile, setIsChangingProfile] = useState(false);
  const [notifications, setNotifications] = useState({
    periodReminder: true,
    ovulationReminder: true,
    symptomsReminder: false,
    friendRequests: true,
    chatMessages: true
  });

  const [privacy, setPrivacy] = useState({
    shareWithPartner: false,
    allowFriendRequests: true,
    publicProfile: false,
    dataSharing: false
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'es',
    temperatureUnit: 'celsius'
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Tipo de Perfil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">Tipo de Perfil</h2>
            </div>
            
            <div className={`flex items-center gap-4 p-4 rounded-xl mb-4 ${isFemaleUser ? 'bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isFemaleUser ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                {isFemaleUser ? <Heart className="w-7 h-7 text-white" /> : <Users className="w-7 h-7 text-white" />}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-lg ${isFemaleUser ? 'text-pink-900' : 'text-blue-900'}`}>
                  {isFemaleUser ? 'Perfil Femenino' : 'Perfil Masculino'}
                </p>
                <p className={`text-sm ${isFemaleUser ? 'text-pink-700' : 'text-blue-700'}`}>
                  {isFemaleUser ? 'Seguimiento de ciclo menstrual' : 'Acompañante de pareja'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChangingProfile(true)}
              className="w-full px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Cambiar tipo de perfil
            </button>

            {/* Modal de cambio de perfil */}
            {isChangingProfile && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Cambiar tipo de perfil</h3>
                  <p className="text-gray-600 mb-6">
                    <strong>Advertencia:</strong> Cambiar tu tipo de perfil puede afectar tus datos y conexiones existentes.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={async () => {
                        await setUserType('female');
                        setIsChangingProfile(false);
                      }}
                      disabled={isFemaleUser}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${isFemaleUser ? 'border-pink-500 bg-pink-50 cursor-not-allowed' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'}`}
                    >
                      <Heart className={`w-8 h-8 mx-auto mb-2 ${isFemaleUser ? 'text-pink-500' : 'text-gray-400'}`} />
                      <p className="font-semibold text-gray-900">Femenino</p>
                      {isFemaleUser && <p className="text-xs text-pink-600 mt-1">Actual</p>}
                    </button>
                    
                    <button
                      onClick={async () => {
                        await setUserType('male');
                        setIsChangingProfile(false);
                      }}
                      disabled={isMaleUser}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${isMaleUser ? 'border-blue-500 bg-blue-50 cursor-not-allowed' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      <Users className={`w-8 h-8 mx-auto mb-2 ${isMaleUser ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className="font-semibold text-gray-900">Masculino</p>
                      {isMaleUser && <p className="text-xs text-blue-600 mt-1">Actual</p>}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setIsChangingProfile(false)}
                    className="w-full px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Recordatorio de período</p>
                  <p className="text-sm text-gray-600">Te avisamos cuando se acerque tu período</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.periodReminder}
                    onChange={() => handleNotificationChange('periodReminder')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Recordatorio de ovulación</p>
                  <p className="text-sm text-gray-600">Te avisamos durante tu ventana fértil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.ovulationReminder}
                    onChange={() => handleNotificationChange('ovulationReminder')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Recordatorio de síntomas</p>
                  <p className="text-sm text-gray-600">Te recordamos registrar tus síntomas diarios</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.symptomsReminder}
                    onChange={() => handleNotificationChange('symptomsReminder')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Solicitudes de amistad</p>
                  <p className="text-sm text-gray-600">Recibe notificaciones de nuevas solicitudes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.friendRequests}
                    onChange={() => handleNotificationChange('friendRequests')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mensajes de chat</p>
                  <p className="text-sm text-gray-600">Recibe notificaciones de nuevos mensajes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.chatMessages}
                    onChange={() => handleNotificationChange('chatMessages')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacidad */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">Privacidad y Seguridad</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Compartir con pareja</p>
                  <p className="text-sm text-gray-600">Permite que tu pareja vea tu ciclo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.shareWithPartner}
                    onChange={() => handlePrivacyChange('shareWithPartner')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Permitir solicitudes de amistad</p>
                  <p className="text-sm text-gray-600">Otras usuarias pueden enviarte solicitudes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.allowFriendRequests}
                    onChange={() => handlePrivacyChange('allowFriendRequests')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Perfil público</p>
                  <p className="text-sm text-gray-600">Permite que otras usuarias te encuentren</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.publicProfile}
                    onChange={() => handlePrivacyChange('publicProfile')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Compartir datos anónimos</p>
                  <p className="text-sm text-gray-600">Ayuda a mejorar la app compartiendo datos anónimos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.dataSharing}
                    onChange={() => handlePrivacyChange('dataSharing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferencias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">Preferencias</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema de la aplicación
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de temperatura
                </label>
                <select
                  value={preferences.temperatureUnit}
                  onChange={(e) => handlePreferenceChange('temperatureUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información de la app */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Smartphone className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">Información de la App</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Versión</span>
                <span className="font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Última actualización</span>
                <span className="font-medium text-gray-900">15 de junio, 2025</span>
              </div>
            </div>

            <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-gray-200">
              <button className="text-left text-pink-600 hover:text-pink-700 transition-colors">
                Términos y condiciones
              </button>
              <button className="text-left text-pink-600 hover:text-pink-700 transition-colors">
                Política de privacidad
              </button>
              <button className="text-left text-pink-600 hover:text-pink-700 transition-colors">
                Soporte y ayuda
              </button>
              <button className="text-left text-pink-600 hover:text-pink-700 transition-colors">
                Calificar la app
              </button>
            </div>
          </div>

          {/* Sesión */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sesión</h2>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium">
                Eliminar cuenta
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
