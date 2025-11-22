// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Estilos
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <CycleProvider>
            <SocialProvider>
              <div className="App">
                <Routes>
                  {/* Rutas públicas */}
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/forgot-password" 
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    } 
                  />

                  {/* Rutas protegidas */}
                  <Route 
                    path="/onboarding" 
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="tracking" element={<Tracking />} />
                    <Route path="social" element={<Social />} />
                    <Route path="share-cycle" element={<ShareCycle />} />
                    <Route path="shared-notes" element={<SharedNotes />} />
                    <Route path="chat" element={<ChatList />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* Ruta por defecto */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>

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
      </Router>
    </HelmetProvider>
  );
}

export default App;
