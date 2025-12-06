// src/components/Layout/MobileNavigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSocial } from '../../contexts/SocialContext';
import {
  Home,
  Calendar,
  Activity,
  Users,
  User
} from 'lucide-react';
import clsx from 'clsx';

const MobileNavigation = () => {
  const location = useLocation();
  const { friendRequests } = useSocial();

  const navigation = [
    {
      name: 'Inicio',
      href: '/dashboard',
      icon: Home
    },
    {
      name: 'Calendario',
      href: '/calendar',
      icon: Calendar
    },
    {
      name: 'Registro',
      href: '/tracking',
      icon: Activity
    },
    {
      name: 'Social',
      href: '/social',
      icon: Users,
      badge: friendRequests.length > 0
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: User
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Efecto de blur del fondo */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-soft-lg"></div>
      
      <div className="relative grid grid-cols-5 h-18 safe-area-bottom">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-2 transition-all duration-200 relative group',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )}
            >
              {/* Indicador activo con glow */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-b-full shadow-glow"></div>
              )}
              
              <div className={clsx(
                'relative p-2 rounded-xl transition-all duration-200',
                isActive 
                  ? 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10' 
                  : 'group-hover:bg-gray-100'
              )}>
                <Icon className={clsx(
                  'h-5 w-5 transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                )} />
                
                {/* Badge de notificación */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-sm">
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
              
              <span className={clsx(
                'text-2xs font-medium mt-1 transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
