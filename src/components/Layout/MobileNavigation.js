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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex flex-col items-center justify-center px-1 py-2 text-xs relative',
                isActive
                  ? 'text-pink-600'
                  : 'text-gray-500'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <span className="truncate w-full text-center">
                {item.name}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-pink-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
