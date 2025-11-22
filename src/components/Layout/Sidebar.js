// src/components/Layout/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import {
  Home,
  Calendar,
  Activity,
  Users,
  User,
  Settings,
  LogOut,
  Heart,
  MessageCircle,
  Share2,
  FileText
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const location = useLocation();
  const { logout, userProfile } = useAuth();
  const { friendRequests, onlineUsers } = useSocial();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      name: 'Calendario',
      href: '/calendar',
      icon: Calendar
    },
    {
      name: 'Seguimiento',
      href: '/tracking',
      icon: Activity
    },
    {
      name: 'Social',
      href: '/social',
      icon: Users,
      badge: friendRequests.length > 0 ? friendRequests.length : null
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageCircle,
      badge: null // Aquí se puede agregar el conteo de mensajes no leídos
    },
    {
      name: 'Compartir Ciclo',
      href: '/share-cycle',
      icon: Share2
    },
    {
      name: 'Notas Compartidas',
      href: '/shared-notes',
      icon: FileText
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: User
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Logo y header */}
      <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-white" />
          <span className="text-xl font-bold text-white">CicloApp</span>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {userProfile?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userProfile?.name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">
              Tu compañera de salud
            </p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border-r-2 border-pink-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                className={clsx(
                  'mr-3 flex-shrink-0 h-5 w-5',
                  isActive
                    ? 'text-pink-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Estados de conexión */}
      {onlineUsers.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">
              {onlineUsers.length} amiga{onlineUsers.length > 1 ? 's' : ''} en línea
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
