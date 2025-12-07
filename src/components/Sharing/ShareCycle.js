// src/components/Sharing/ShareCycle.js
import React, { useState, useEffect } from 'react';
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
  Bell,
  UserCheck,
  UserX,
  Link2,
  Unlink,
  Key,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { useCycle } from '../../contexts/CycleContext';
import { useAuth } from '../../contexts/AuthContext';
import { ref, set, get } from 'firebase/database';
import { database } from '../../config/firebase';
import toast from 'react-hot-toast';

const ShareCycle = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sharedWith, setSharedWith] = useState([]);
  const [linkCode, setLinkCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [localShareSettings, setLocalShareSettings] = useState({
    periods: true,
    symptoms: true,
    mood: true,
    predictions: true,
    notes: false
  });

  const { friends, shareCycleWith, sharedUsers } = useSocial();
  const { currentPhase, nextPeriodDate, shareSettings: contextShareSettings, removeAuthorized } = useCycle();
  const { currentUser, userProfile, isMaleUser, stopSharingWithPartner } = useAuth();

  // Cargar código existente al montar
  useEffect(() => {
    const loadExistingCode = async () => {
      try {
        const userRef = ref(database, `users/${currentUser.uid}/linkCode`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setLinkCode(snapshot.val());
        }
      } catch (err) {
        console.error('Error cargando código:', err);
      }
    };

    if (currentUser && !isMaleUser) {
      loadExistingCode();
    }
  }, [currentUser, isMaleUser]);

  // Generar código de vinculación
  const generateLinkCode = async () => {
    setGeneratingCode(true);
    try {
      // Generar código aleatorio de 6 caracteres
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const now = new Date().toISOString();
      const codeData = {
        code,
        odwifeId: currentUser.uid,
        odwifeName: userProfile?.name || currentUser?.displayName || 'Usuario',
        odwifeEmail: currentUser.email,
        createdAt: now,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      // Guardar código en la base de datos
      await set(ref(database, `linkCodes/${code}`), codeData);
      
      // Guardar código en el perfil del usuario
      await set(ref(database, `users/${currentUser.uid}/linkCode`), code);

      setLinkCode(code);
      toast.success('¡Código generado! Compártelo con tu pareja');
    } catch (err) {
      console.error('Error generando código:', err);
      toast.error('Error al generar código');
    } finally {
      setGeneratingCode(false);
    }
  };

  // Copiar código al portapapeles
  const copyCode = () => {
    navigator.clipboard.writeText(linkCode);
    toast.success('Código copiado al portapapeles');
  };

  // Cargar datos compartidos desde sharedUsers
  useEffect(() => {
    if (sharedUsers && sharedUsers.length > 0) {
      setSharedWith(sharedUsers.map(u => ({ friendId: u.id, settings: localShareSettings })));
    }
  }, [sharedUsers, localShareSettings]);

  const handleShareToggle = async (friendId, isSharing) => {
    try {
        if (isSharing) {
        await shareCycleWith(friendId);
        setSharedWith(prev => [...prev, { friendId, settings: localShareSettings }]);
      } else {
        // Remover compartir - por ahora solo actualizamos el estado local
        setSharedWith(prev => prev.filter(s => s.friendId !== friendId));
      }
    } catch (error) {
      console.error('Error toggling share:', error);
    }
  };

  const handleUpdateShareSettings = async (friendId, newSettings) => {
    // Actualizar configuración localmente
    setSharedWith(prev => prev.map(s => 
      s.friendId === friendId ? { ...s, settings: newSettings } : s
    ));
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

      {/* Personas con acceso (autorizados) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Compartido con</h3>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {Array.isArray(contextShareSettings?.authorized) ? contextShareSettings.authorized.length : 0} personas
          </span>
        </div>

        {Array.isArray(contextShareSettings?.authorized) && contextShareSettings.authorized.length > 0 ? (
          <div className="space-y-3">
            {contextShareSettings.authorized.map((a) => (
              <div key={a.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{a.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{a.email}</p>
                    <p className="text-sm text-gray-600">{a.permissions ? Object.keys(a.permissions).filter(k => a.permissions[k]).length : 0} categorías</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-500" />
                  <button
                    onClick={() => removeAuthorized && removeAuthorized(a.email)}
                    className="text-sm text-red-600 underline"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
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
                  onClick={() => setLocalShareSettings(prev => ({
                    ...prev,
                    [category.id]: !prev[category.id]
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localShareSettings[category.id] ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localShareSettings[category.id] ? 'translate-x-6' : 'translate-x-1'
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

  const renderPartner = () => {
    const hasPartner = userProfile?.partnerId;
    
    // La función de invitación por correo fue retirada; utilizar la opción "Autorizar".
    
    const handleUnlinkPartner = async () => {
      if (window.confirm('¿Estás seguro de que deseas desvincular a tu pareja? Ella ya no podrá ver tu ciclo.')) {
        try {
          await stopSharingWithPartner();
          toast.success('Pareja desvinculada correctamente');
        } catch (error) {
          console.error('Error desvinculando:', error);
          toast.error('Error al desvincular');
        }
      }
    };
    
    // Vista para usuarios masculinos
    if (isMaleUser) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Conexión con tu pareja
              </h3>
            </div>
            
            {hasPartner ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {userProfile?.partnerName?.charAt(0) || '♀'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{userProfile?.partnerName || 'Tu pareja'}</p>
                        <p className="text-sm text-gray-600">{userProfile?.partnerEmail}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Link2 className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">Vinculados</span>
                        </div>
                      </div>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Estás conectado con tu pareja. Puedes ver su ciclo en el Dashboard y Calendario.
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">No estás vinculado</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Tu pareja debe invitarte desde su perfil usando tu correo electrónico para que puedas ver su ciclo.
                </p>
                <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
                  <strong>Tu correo:</strong> {userProfile?.email}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Vista para usuarios femeninos
    return (
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
          
          {hasPartner ? (
            // Pareja ya vinculada
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {userProfile?.partnerName?.charAt(0) || '♂'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userProfile?.partnerName || 'Tu pareja'}</p>
                      <p className="text-sm text-gray-600">{userProfile?.partnerEmail}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Eye className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Puede ver tu ciclo</span>
                      </div>
                    </div>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Tu pareja puede ver:
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Fechas de tu período</li>
                  <li>• Fase actual del ciclo</li>
                  <li>• Predicciones del próximo período</li>
                  <li>• Síntomas registrados</li>
                </ul>
              </div>
              
              <button
                onClick={handleUnlinkPartner}
                className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                <Unlink className="w-4 h-4" />
                Desvincular pareja
              </button>
            </div>
          ) : (
            // Sin pareja vinculada - Sistema de código de vinculación
            <>
              <div className="bg-white rounded-lg p-4 border border-red-200 mb-6">
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
                    <span>Consejos personalizados para él según tu fase</span>
                  </li>
                </ul>
              </div>
              
              {/* NUEVO: Sistema de código de vinculación */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-500" />
                  Generar código de vinculación
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Genera un código único y compártelo con tu pareja. Él lo ingresará en su app para conectarse contigo.
                </p>

                {linkCode ? (
                  // Mostrar código generado
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-6 border-2 border-dashed border-purple-300 text-center">
                      <p className="text-sm text-gray-500 mb-2">Tu código de vinculación:</p>
                      <div className="text-4xl font-mono font-bold tracking-[0.3em] text-purple-600 mb-2">
                        {linkCode}
                      </div>
                      <p className="text-xs text-gray-400">Válido por 24 horas</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={copyCode}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-100 text-purple-700 py-3 px-4 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar código
                      </button>
                      <button
                        onClick={generateLinkCode}
                        disabled={generatingCode}
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${generatingCode ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                      <strong>Instrucciones para tu pareja:</strong>
                      <ol className="mt-2 space-y-1 list-decimal list-inside">
                        <li>Abre CicloApp en su celular</li>
                        <li>Va al Dashboard</li>
                        <li>Ingresa el código <strong>{linkCode}</strong></li>
                        <li>¡Listo! Estarán conectados</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  // Botón para generar código
                  <button
                    onClick={generateLinkCode}
                    disabled={generatingCode}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    {generatingCode ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5" />
                        <span>Generar código de vinculación</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

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
