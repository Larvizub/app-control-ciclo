// src/hooks/useNotificationEvents.js
// Hook para escuchar eventos de Firebase y crear notificaciones en tiempo real
import { useEffect, useRef } from 'react';
import { ref, onValue, onChildAdded, off } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications, NOTIFICATION_TYPES } from '../contexts/NotificationContext';

const useNotificationEvents = () => {
  const { currentUser } = useAuth();
  const { createNotification } = useNotifications();
  const previousFriendRequestsRef = useRef(new Set());
  const previousMessagesRef = useRef(new Set());
  const initialLoadDoneRef = useRef({ friendRequests: false, messages: false, partnership: false });

  // Escuchar nuevas solicitudes de amistad
  useEffect(() => {
    if (!currentUser) return;

    const requestsRef = ref(database, `friendRequests/${currentUser.uid}`);
    
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      if (!snapshot.exists()) {
        previousFriendRequestsRef.current = new Set();
        initialLoadDoneRef.current.friendRequests = true;
        return;
      }

      const data = snapshot.val();
      const currentIds = new Set(Object.keys(data));

      // Solo crear notificaciones después de la carga inicial
      if (initialLoadDoneRef.current.friendRequests) {
        // Encontrar nuevas solicitudes
        currentIds.forEach(id => {
          if (!previousFriendRequestsRef.current.has(id)) {
            const request = data[id];
            createNotification(
              currentUser.uid,
              NOTIFICATION_TYPES.FRIEND_REQUEST,
              `${request.fromName || 'Alguien'} te envió una solicitud de amistad`,
              { fromUserId: request.from, requestId: id }
            );
          }
        });
      }

      previousFriendRequestsRef.current = currentIds;
      initialLoadDoneRef.current.friendRequests = true;
    });

    return () => unsubscribe();
  }, [currentUser, createNotification]);

  // Escuchar cambios en el partnership (vinculación de pareja)
  useEffect(() => {
    if (!currentUser) return;

    const partnershipRef = ref(database, `partnerships/${currentUser.uid}`);
    
    const unsubscribe = onValue(partnershipRef, (snapshot) => {
      if (!initialLoadDoneRef.current.partnership) {
        initialLoadDoneRef.current.partnership = true;
        return;
      }

      if (snapshot.exists()) {
        const data = snapshot.val();
        // Solo notificar si es una vinculación nueva (tiene maleId o femaleId diferente al usuario actual)
        const partnerId = data.maleId === currentUser.uid ? data.femaleId : data.maleId;
        const partnerName = data.femaleName || data.maleName || 'Tu pareja';
        
        if (partnerId) {
          createNotification(
            currentUser.uid,
            NOTIFICATION_TYPES.PARTNER_LINKED,
            `¡Te has vinculado con ${partnerName}!`,
            { partnerId }
          );
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, createNotification]);

  // Escuchar nuevos mensajes en los chats
  useEffect(() => {
    if (!currentUser) return;

    const chatsRef = ref(database, `chats`);
    
    const messageListeners = {};

    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      if (!snapshot.exists()) return;

      const chats = snapshot.val();
      
      // Filtrar chats donde el usuario es participante
      Object.entries(chats).forEach(([chatId, chat]) => {
        if (!chat.participants?.includes(currentUser.uid)) return;
        
        // Escuchar nuevos mensajes en este chat. Registramos el callback para poder removerlo luego.
        const messagesRef = ref(database, `messages/${chatId}`);

        if (!messageListeners[chatId]) {
          const childAddedCallback = (msgSnapshot) => {
            const message = msgSnapshot.val();
            const messageId = msgSnapshot.key;

            // No notificar propios mensajes ni mensajes ya vistos
            if (message.senderId === currentUser.uid) return;
            if (previousMessagesRef.current.has(messageId)) return;

            // Solo notificar mensajes recientes (últimos 10 segundos)
            const messageTime = new Date(message.timestamp).getTime();
            const now = Date.now();

            if (now - messageTime < 10000) {
              createNotification(
                currentUser.uid,
                NOTIFICATION_TYPES.NEW_MESSAGE,
                `${message.senderName || 'Alguien'}: ${message.message?.substring(0, 50)}${message.message?.length > 50 ? '...' : ''}`,
                { chatId, messageId, senderId: message.senderId }
              );
            }

            previousMessagesRef.current.add(messageId);
          };

          onChildAdded(messagesRef, childAddedCallback);
          messageListeners[chatId] = { ref: messagesRef, cb: childAddedCallback };
        }
      });
    });

    // Cleanup: remover listeners de mensajes y el listener principal de chats
    return () => {
      Object.values(messageListeners).forEach(({ ref: mRef, cb }) => {
        try { off(mRef, 'child_added', cb); } catch (e) { /* ignore */ }
      });
      try { unsubscribe(); } catch (e) { /* ignore */ }
    };
  }, [currentUser, createNotification]);

  return null;
};

export default useNotificationEvents;
