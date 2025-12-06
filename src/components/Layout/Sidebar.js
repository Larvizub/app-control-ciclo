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
  FileText,
  Sparkles
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
      badge: null
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
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-soft-lg">
      {/* Logo y header con gradiente moderno */}
      <div className="relative h-20 px-6 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-90"></div>
        <div className="absolute inset-0 bg-mesh-gradient"></div>
        <div className="relative flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner-glow">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">CicloApp</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white/70" />
              <span className="text-xs text-white/70">Tu bienestar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del usuario con diseño moderno */}
      <div className="px-4 py-5 mx-3 mt-4 rounded-2xl bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 border border-white/60">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 rounded-xl flex items-center justify-center shadow-glow animate-pulse-glow">
              <span className="text-white font-bold text-lg">
                {userProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {userProfile?.name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              En línea
            </p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Indicador activo */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full"></div>
              )}
              
              <div className={clsx(
                'mr-3 p-2 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              )}>
                <Icon
                  className={clsx(
                    'h-4 w-4 transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-gray-500 group-hover:text-gray-700'
                  )}
                />
              </div>
              
              <span className="flex-1">{item.name}</span>
              
              {item.badge && (
                <span className="ml-3 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm animate-bounce-soft">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Estados de conexión con diseño mejorado */}
      {onlineUsers.length > 0 && (
        <div className="mx-3 mb-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs font-medium text-green-700">
              {onlineUsers.length} amiga{onlineUsers.length > 1 ? 's' : ''} en línea
            </span>
          </div>
        </div>
      )}

      {/* Footer con botón de logout */}
      <div className="p-3 border-t border-gray-100/80">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <div className="mr-3 p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
            <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
          </div>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
