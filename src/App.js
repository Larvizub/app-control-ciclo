// src/App.js
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CycleProvider } from './contexts/CycleContext';
import { SocialProvider } from './contexts/SocialContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';

// Pages
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import Calendar from './components/Calendar/Calendar';
import Tracking from './components/Tracking/Tracking';
import Social from './components/Social/Social';
import Profile from './components/Profile/Profile';
import Settings from './components/Settings/Settings';
import Onboarding from './components/Onboarding/Onboarding';
import ShareCycle from './components/Sharing/ShareCycle';
import SharedNotes from './components/Sharing/SharedNotes';
import ChatList from './components/Chat/ChatList';
import ProfileTypeSelector from './components/Auth/ProfileTypeSelector';

// Estilos
import './index.css';

function App() {
  const router = createBrowserRouter([
    {
      path: '/login',
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: '/register',
      element: (
        <PublicRoute>
          <Register />
        </PublicRoute>
      ),
    },
    {
      path: '/forgot-password',
      element: (
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      ),
    },
    {
      path: '/select-profile',
      element: (
        <ProtectedRoute skipProfileCheck>
          <ProfileTypeSelector />
        </ProtectedRoute>
      ),
    },
    {
      path: '/onboarding',
      element: (
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      ),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'calendar', element: <Calendar /> },
        { path: 'tracking', element: <Tracking /> },
        { path: 'social', element: <Social /> },
        { path: 'share-cycle', element: <ShareCycle /> },
        { path: 'shared-notes', element: <SharedNotes /> },
        { path: 'chat', element: <ChatList /> },
        { path: 'profile', element: <Profile /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ]);

  return (
    <HelmetProvider>
      <AuthProvider>
        <CycleProvider>
          <SocialProvider>
            <div className="App">
              <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />

              {/* Notificaciones Toast */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '14px',
                  },
                  success: {
                    style: {
                      background: '#10b981',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#10b981',
                    },
                  },
                  error: {
                    style: {
                      background: '#ef4444',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#ef4444',
                    },
                  },
                }}
              />
            </div>
          </SocialProvider>
        </CycleProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
