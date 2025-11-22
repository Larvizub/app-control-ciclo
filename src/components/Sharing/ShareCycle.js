// src/components/Sharing/ShareCycle.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Share2, 
  Users, 
  Heart, 
  Shield, 
  Settings,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Activity,
  Smile,
  Bell
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { useCycle } from '../../contexts/CycleContext';

const ShareCycle = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sharedWith, setSharedWith] = useState([]);
  const [shareSettings, setShareSettings] = useState({
    periods: true,
    symptoms: true,
    mood: true,
    predictions: true,
    notes: false
  });

  const { friends, shareDataWith, getSharedData, updateShareSettings } = useSocial();
  const { currentPhase, nextPeriodDate } = useCycle();

  const loadSharedData = useCallback(async () => {
    try {
      const shared = await getSharedData();
      setSharedWith(shared);
    } catch (error) {
      console.error('Error loading shared data:', error);
    }
  }, [getSharedData]);

  useEffect(() => {
    loadSharedData();
  }, [loadSharedData]);

  const handleShareToggle = async (friendId, isSharing) => {
    try {
      if (isSharing) {
        await shareDataWith(friendId, shareSettings);
        setSharedWith(prev => [...prev, { friendId, settings: shareSettings }]);
      } else {
        // Remover compartir
        setSharedWith(prev => prev.filter(s => s.friendId !== friendId));
      }
    } catch (error) {
      console.error('Error toggling share:', error);
    }
  };

  const handleUpdateShareSettings = async (friendId, newSettings) => {
    try {
      await updateShareSettings(friendId, newSettings);
      setSharedWith(prev => prev.map(s => 
        s.friendId === friendId ? { ...s, settings: newSettings } : s
      ));
    } catch (error) {
      console.error('Error updating share settings:', error);
    }
  };

  const shareCategories = [
    {
      id: 'periods',
      name: 'Períodos',
      description: 'Fechas de inicio y fin del período',
      icon: Calendar,
      color: 'text-red-500'
    },
    {
      id: 'symptoms',
      name: 'Síntomas',
      description: 'Dolores, cólicos y otros síntomas físicos',
      icon: Activity,
      color: 'text-orange-500'
    },
    {
      id: 'mood',
      name: 'Estado de ánimo',
      description: 'Emociones y cambios de humor',
      icon: Smile,
      color: 'text-yellow-500'
    },
    {
      id: 'predictions',
      name: 'Predicciones',
      description: 'Fechas estimadas del próximo período',
      icon: Bell,
      color: 'text-blue-500'
    },
    {
      id: 'notes',
      name: 'Notas privadas',
      description: 'Notas personales y observaciones',
      icon: Shield,
      color: 'text-purple-500'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: Share2 },
    { id: 'friends', name: 'Amigas', icon: Users },
    { id: 'partner', name: 'Pareja', icon: Heart },
    { id: 'settings', name: 'Configuración', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estado actual */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tu Estado Actual
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Fase actual</p>
            <p className="font-semibold text-gray-900">{currentPhase}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Próximo período</p>
            <p className="font-semibold text-gray-900">
              {nextPeriodDate ? new Date(nextPeriodDate).toLocaleDateString('es-ES') : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Personas con acceso */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Compartido con
          </h3>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {sharedWith.length} personas
          </span>
        </div>
        
        {sharedWith.length > 0 ? (
          <div className="space-y-3">
            {sharedWith.map((share) => {
              const friend = friends.find(f => f.id === share.friendId);
              if (!friend) return null;
              
              return (
                <div key={share.friendId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {friend.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{friend.name}</p>
                      <p className="text-sm text-gray-600">
                        {Object.keys(share.settings).filter(key => share.settings[key]).length} categorías
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Activo</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No has compartido tu ciclo con nadie aún</p>
            <p className="text-sm">Ve a las otras pestañas para comenzar a compartir</p>
          </div>
        )}
      </div>

      {/* Configuración rápida */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ¿Qué compartir por defecto?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shareCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${category.color}`} />
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareSettings(prev => ({
                    ...prev,
                    [category.id]: !prev[category.id]
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shareSettings[category.id] ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shareSettings[category.id] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFriends = () => (
    <div className="space-y-4">
      {friends.length > 0 ? (
        friends.map((friend) => {
          const isShared = sharedWith.some(s => s.friendId === friend.id);
          const sharedSettings = sharedWith.find(s => s.friendId === friend.id)?.settings || {};
          
          return (
            <div key={friend.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {friend.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                    <p className="text-sm text-gray-600">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleShareToggle(friend.id, !isShared)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isShared
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isShared ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{isShared ? 'Dejar de compartir' : 'Compartir'}</span>
                </button>
              </div>

              {isShared && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">¿Qué puede ver?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {shareCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-4 h-4 ${category.color}`} />
                            <span className="text-sm font-medium text-gray-900">
                              {category.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUpdateShareSettings(friend.id, {
                              ...sharedSettings,
                              [category.id]: !sharedSettings[category.id]
                            })}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              sharedSettings[category.id] ? 'bg-pink-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                sharedSettings[category.id] ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No tienes amigas aún
          </h3>
          <p className="text-gray-500 mb-4">
            Agrega amigas en la sección Social para poder compartir tu ciclo
          </p>
        </div>
      )}
    </div>
  );

  const renderPartner = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-8 h-8 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Compartir con tu pareja
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          Mantén a tu pareja informada sobre tu ciclo para una mejor comprensión y apoyo mutuo.
        </p>
        
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <h4 className="font-semibold text-gray-900 mb-3">Beneficios de compartir:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Mayor comprensión y empatía</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Planificación de actividades juntos</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Apoyo emocional en momentos difíciles</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Mejor comunicación en la relación</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          Invitar a tu pareja
        </h4>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="correo@pareja.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200">
            Enviar invitación
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de privacidad
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Compartir automáticamente</p>
              <p className="text-sm text-gray-600">
                Comparte nuevos datos automáticamente con personas autorizadas
              </p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notificar cambios</p>
              <p className="text-sm text-gray-600">
                Envía notificaciones cuando compartas o dejes de compartir datos
              </p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Permitir screenshots</p>
              <p className="text-sm text-gray-600">
                Permite que las personas con acceso tomen capturas de pantalla
              </p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h4 className="font-semibold text-red-800 mb-2">Zona de peligro</h4>
        <p className="text-sm text-red-600 mb-4">
          Estas acciones no se pueden deshacer.
        </p>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          Revocar todos los accesos
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Share2 className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Compartir Ciclo</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-6 py-4 text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'friends' && renderFriends()}
            {activeTab === 'partner' && renderPartner()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareCycle;
