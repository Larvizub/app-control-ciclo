// src/components/Layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import TopBar from './TopBar';
import useNotificationEvents from '../../hooks/useNotificationEvents';

const Layout = () => {
  // Activar listeners de eventos para notificaciones en tiempo real
  useNotificationEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50 bg-fixed">
      {/* Efectos de fondo decorativos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-secondary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-accent-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col z-30">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="md:pl-72 flex flex-col flex-1 relative z-10">
        {/* Top Bar con notificaciones */}
        <TopBar />
        
        <main className="flex-1 pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default Layout;
