// src/components/Layout/TopBar.js
import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  Trash2, 
  X, 
  UserPlus, 
  Heart, 
  MessageCircle, 
  Calendar,
  AlertCircle,
  CheckCheck
} from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

const TopBar = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isOpen, 
    toggleNotifications, 
    closeNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();
  
  const panelRef = useRef(null);

  // Obtener título de la página actual
  const getPageTitle = () => {
    const titles = {
      '/dashboard': 'Inicio',
      '/calendar': 'Calendario',
      '/tracking': 'Registro',
      '/social': 'Social',
      '/profile': 'Mi Perfil',
      '/settings': 'Ajustes',
      '/share': 'Compartir Ciclo',
      '/chat': 'Chat'
    };
    return titles[location.pathname] || 'Ciclo';
  };

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeNotifications]);

  // Icono según tipo de notificación
  const getNotificationIcon = (type) => {
    const iconProps = { className: 'w-5 h-5' };
    
    switch (type) {
      case NOTIFICATION_TYPES.FRIEND_REQUEST:
        return <UserPlus {...iconProps} className="w-5 h-5 text-blue-500" />;
      case NOTIFICATION_TYPES.FRIEND_ACCEPTED:
        return <Check {...iconProps} className="w-5 h-5 text-green-500" />;
      case NOTIFICATION_TYPES.PARTNER_LINKED:
        return <Heart {...iconProps} className="w-5 h-5 text-pink-500" />;
      case NOTIFICATION_TYPES.PARTNER_UNLINKED:
        return <Heart {...iconProps} className="w-5 h-5 text-gray-400" />;
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        return <MessageCircle {...iconProps} className="w-5 h-5 text-purple-500" />;
      case NOTIFICATION_TYPES.CYCLE_UPDATE:
      case NOTIFICATION_TYPES.PERIOD_STARTED:
        return <Calendar {...iconProps} className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle {...iconProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  // Formatear tiempo relativo
  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
    } catch {
      return 'hace un momento';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Título de la página */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Saludo (solo desktop) */}
            <span className="hidden sm:block text-sm text-gray-600">
              Hola, <span className="font-medium text-gray-900">{userProfile?.name?.split(' ')[0] || 'Usuario'}</span>
            </span>

            {/* Botón de notificaciones */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={toggleNotifications}
                className={clsx(
                  'relative p-2.5 sm:p-3 rounded-xl transition-all duration-200',
                  isOpen 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                )}
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                
                {/* Badge de notificaciones no leídas */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Panel de notificaciones */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {/* Header del panel */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <>
                          <button
                            onClick={markAllAsRead}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                            title="Marcar todas como leídas"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={clearAllNotifications}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                            title="Eliminar todas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={closeNotifications}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors sm:hidden"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de notificaciones */}
                  <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No hay notificaciones</p>
                        <p className="text-sm text-gray-400 mt-1">Te avisaremos cuando haya algo nuevo</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={clsx(
                            'flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors cursor-pointer',
                            notification.read 
                              ? 'bg-white hover:bg-gray-50' 
                              : 'bg-primary-50/50 hover:bg-primary-50'
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          {/* Icono */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <p className={clsx(
                              'text-sm',
                              notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                            )}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Acciones */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <Link
                        to="/settings"
                        onClick={closeNotifications}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Configurar notificaciones →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar del usuario (solo desktop) */}
            <Link 
              to="/profile"
              className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 items-center justify-center text-white font-bold text-base shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              {userProfile?.name?.charAt(0) || 'U'}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
