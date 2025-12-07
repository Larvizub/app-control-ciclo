// src/contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  PARTNER_LINKED: 'partner_linked',
  PARTNER_UNLINKED: 'partner_unlinked',
  NEW_MESSAGE: 'new_message',
  CYCLE_UPDATE: 'cycle_update',
  PERIOD_STARTED: 'period_started',
  REMINDER: 'reminder',
  SYSTEM: 'system'
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const notificationsRef = ref(database, `notifications/${currentUser.uid}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notificationsList = Object.entries(data)
          .map(([id, notification]) => ({
            id,
            ...notification
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setNotifications(notificationsList);
        
        const unread = notificationsList.filter(n => !n.read).length;
        setUnreadCount(unread);

        // Mostrar toast para notificaciones nuevas (últimos 5 segundos)
        const now = Date.now();
        notificationsList.forEach(n => {
          if (!n.read && !n.toastShown && (now - new Date(n.createdAt).getTime()) < 5000) {
            showNotificationToast(n);
            // Marcar como mostrado en toast
            update(ref(database, `notifications/${currentUser.uid}/${n.id}`), {
              toastShown: true
            });
          }
        });
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Mostrar toast según tipo de notificación
  const showNotificationToast = (notification) => {
    const iconMap = {
      [NOTIFICATION_TYPES.FRIEND_REQUEST]: '👋',
      [NOTIFICATION_TYPES.FRIEND_ACCEPTED]: '🎉',
      [NOTIFICATION_TYPES.PARTNER_LINKED]: '💕',
      [NOTIFICATION_TYPES.PARTNER_UNLINKED]: '💔',
      [NOTIFICATION_TYPES.NEW_MESSAGE]: '💬',
      [NOTIFICATION_TYPES.CYCLE_UPDATE]: '🔄',
      [NOTIFICATION_TYPES.PERIOD_STARTED]: '🌸',
      [NOTIFICATION_TYPES.REMINDER]: '⏰',
      [NOTIFICATION_TYPES.SYSTEM]: 'ℹ️'
    };

    const icon = iconMap[notification.type] || '🔔';
    
    toast(notification.message, {
      icon,
      duration: 4000,
      style: {
        borderRadius: '12px',
        background: '#fff',
        color: '#333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }
    });
  };

  // Crear una notificación para un usuario
  const createNotification = useCallback(async (userId, type, message, data = {}) => {
    if (!userId) return null;

    try {
      const notificationsRef = ref(database, `notifications/${userId}`);
      const newNotificationRef = push(notificationsRef);
      
      const notification = {
        type,
        message,
        data,
        read: false,
        toastShown: false,
        createdAt: new Date().toISOString()
      };

      await set(newNotificationRef, notification);
      return newNotificationRef.key;
    } catch (error) {
      console.error('Error creando notificación:', error);
      return null;
    }
  }, []);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    if (!currentUser || !notificationId) return;

    try {
      const notificationRef = ref(database, `notifications/${currentUser.uid}/${notificationId}`);
      await update(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }, [currentUser]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    if (!currentUser || notifications.length === 0) return;

    try {
      const updates = {};
      notifications.forEach(n => {
        if (!n.read) {
          updates[`notifications/${currentUser.uid}/${n.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  }, [currentUser, notifications]);

  // Eliminar una notificación
  const deleteNotification = useCallback(async (notificationId) => {
    if (!currentUser || !notificationId) return;

    try {
      const notificationRef = ref(database, `notifications/${currentUser.uid}/${notificationId}`);
      await remove(notificationRef);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  }, [currentUser]);

  // Eliminar todas las notificaciones
  const clearAllNotifications = useCallback(async () => {
    if (!currentUser) return;

    try {
      const notificationsRef = ref(database, `notifications/${currentUser.uid}`);
      await remove(notificationsRef);
    } catch (error) {
      console.error('Error eliminando notificaciones:', error);
    }
  }, [currentUser]);

  // Toggle panel de notificaciones
  const toggleNotifications = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = {
    notifications,
    unreadCount,
    isOpen,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    toggleNotifications,
    closeNotifications,
    NOTIFICATION_TYPES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
