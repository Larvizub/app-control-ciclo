// src/contexts/SocialContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ref, set, get, onValue, off, query, orderByChild, equalTo, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const SocialContext = createContext();

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial debe ser usado dentro de SocialProvider');
  }
  return context;
};

export const SocialProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sharedUsers] = useState([]);
  const [notes, setNotes] = useState([]);

  // Enviar solicitud de amistad
  const sendFriendRequest = useCallback(async (friendEmail) => {
    if (!currentUser) return;

    try {
      // Buscar usuario por email
      const usersRef = ref(database, 'users');
      const usersQuery = query(usersRef, orderByChild('email'), equalTo(friendEmail));
      const snapshot = await get(usersQuery);

      if (!snapshot.exists()) {
        toast.error('Usuario no encontrado');
        return;
      }

      const userData = Object.values(snapshot.val())[0];
      const friendId = userData.uid;

      if (friendId === currentUser.uid) {
        toast.error('No puedes enviarte una solicitud a ti misma');
        return;
      }

      // Verificar si ya son amigas
      const friendshipRef = ref(database, `friendships/${currentUser.uid}/${friendId}`);
      const friendshipSnapshot = await get(friendshipRef);

      if (friendshipSnapshot.exists()) {
        toast.error('Ya tienes una relación con esta usuaria');
        return;
      }

      // Crear solicitud de amistad
      const requestData = {
        from: currentUser.uid,
        to: friendId,
        fromName: userProfile.name,
        toName: userData.name,
        fromEmail: currentUser.email,
        toEmail: friendEmail,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const requestRef = ref(database, `friendRequests/${friendId}/${currentUser.uid}`);
      await set(requestRef, requestData);

      toast.success('Solicitud de amistad enviada');
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar solicitud');
    }
  }, [currentUser, userProfile?.name]);

  // Aceptar solicitud de amistad
  const acceptFriendRequest = useCallback(async (requestId, fromUserId) => {
    if (!currentUser) return;

    try {
      // Crear amistad bidireccional
      const friendshipData = {
        userId: fromUserId,
        status: 'accepted',
        createdAt: new Date().toISOString()
      };

      const reverseFriendshipData = {
        userId: currentUser.uid,
        status: 'accepted',
        createdAt: new Date().toISOString()
      };

      await set(ref(database, `friendships/${currentUser.uid}/${fromUserId}`), friendshipData);
      await set(ref(database, `friendships/${fromUserId}/${currentUser.uid}`), reverseFriendshipData);

      // Eliminar solicitud
      await remove(ref(database, `friendRequests/${currentUser.uid}/${fromUserId}`));

      // Crear chat inicial
      const chatId = uuidv4();
      const chatData = {
        id: chatId,
        participants: [currentUser.uid, fromUserId],
        createdAt: new Date().toISOString(),
        lastMessage: null,
        lastActivity: new Date().toISOString()
      };

      await set(ref(database, `chats/${chatId}`), chatData);

      toast.success('Solicitud aceptada');
    } catch (error) {
      console.error('Error aceptando solicitud:', error);
      toast.error('Error al aceptar solicitud');
    }
  }, [currentUser]);

  // Rechazar solicitud de amistad
  const rejectFriendRequest = useCallback(async (fromUserId) => {
    if (!currentUser) return;

    try {
      await remove(ref(database, `friendRequests/${currentUser.uid}/${fromUserId}`));
      toast.success('Solicitud rechazada');
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      toast.error('Error al rechazar solicitud');
    }
  }, [currentUser]);

  // Enviar mensaje
  const sendMessage = useCallback(async (chatId, message, type = 'text') => {
    if (!currentUser || !message.trim()) return;

    try {
      const messageData = {
        id: uuidv4(),
        senderId: currentUser.uid,
        senderName: userProfile.name,
        message: message.trim(),
        type,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Agregar mensaje al chat
      const messageRef = ref(database, `messages/${chatId}/${messageData.id}`);
      await set(messageRef, messageData);

      // Actualizar último mensaje del chat
      const chatRef = ref(database, `chats/${chatId}`);
      await update(chatRef, {
        lastMessage: message.trim(),
        lastActivity: new Date().toISOString(),
        lastSender: currentUser.uid
      });

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast.error('Error al enviar mensaje');
    }
  }, [currentUser, userProfile?.name]);

  // Compartir ciclo con usuario
  const shareCycleWith = useCallback(async (friendId) => {
    if (!currentUser) return;

    try {
      const shareData = {
        sharedBy: currentUser.uid,
        sharedWith: friendId,
        permissions: ['view_cycle', 'view_symptoms'],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await set(ref(database, `cycleSharing/${currentUser.uid}/${friendId}`), shareData);
      
      // Notificar al amigo
      const notificationData = {
        id: uuidv4(),
        from: currentUser.uid,
        fromName: userProfile.name,
        to: friendId,
        type: 'cycle_share',
        message: `${userProfile.name} ha compartido su ciclo contigo`,
        timestamp: new Date().toISOString(),
        read: false
      };

      await set(ref(database, `notifications/${friendId}/${notificationData.id}`), notificationData);

      toast.success('Ciclo compartido exitosamente');
    } catch (error) {
      console.error('Error compartiendo ciclo:', error);
      toast.error('Error al compartir ciclo');
    }
  }, [currentUser, userProfile?.name]);

  // Agregar nota compartida
  const addSharedNote = useCallback(async (date, note, sharedWith = []) => {
    if (!currentUser) return;

    try {
      const noteData = {
        id: uuidv4(),
        authorId: currentUser.uid,
        authorName: userProfile.name,
        date,
        note,
        sharedWith: [currentUser.uid, ...sharedWith],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(ref(database, `sharedNotes/${noteData.id}`), noteData);

      // Notificar a usuarios compartidos
      for (const userId of sharedWith) {
        const notificationData = {
          id: uuidv4(),
          from: currentUser.uid,
          fromName: userProfile.name,
          to: userId,
          type: 'shared_note',
          message: `${userProfile.name} agregó una nota compartida`,
          timestamp: new Date().toISOString(),
          read: false
        };

        await set(ref(database, `notifications/${userId}/${notificationData.id}`), notificationData);
      }

      toast.success('Nota agregada');
    } catch (error) {
      console.error('Error agregando nota:', error);
      toast.error('Error al agregar nota');
    }
  }, [currentUser, userProfile?.name]);

  // Actualizar estado en línea
  const updateOnlineStatus = useCallback(async (isOnline) => {
    if (!currentUser || !userProfile) return;

    try {
      const statusData = {
        userId: currentUser.uid,
        userName: userProfile.name || userProfile.email || 'Usuario',
        isOnline,
        lastSeen: new Date().toISOString()
      };

      await set(ref(database, `userStatus/${currentUser.uid}`), statusData);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  }, [currentUser, userProfile]);

  // Cargar datos cuando el usuario esté autenticado
  useEffect(() => {
    if (currentUser) {
      // Actualizar estado en línea
      updateOnlineStatus(true);

      // Listener para amigas
      const friendshipsRef = ref(database, `friendships/${currentUser.uid}`);
      const friendshipsUnsubscribe = onValue(friendshipsRef, async (snapshot) => {
        if (snapshot.exists()) {
          const friendshipsData = snapshot.val();
          const friendIds = Object.keys(friendshipsData);
          
          // Obtener datos de las amigas
          const friendsData = [];
          for (const friendId of friendIds) {
            const friendRef = ref(database, `users/${friendId}`);
            const friendSnapshot = await get(friendRef);
            if (friendSnapshot.exists()) {
              friendsData.push({
                id: friendId,
                ...friendSnapshot.val(),
                friendship: friendshipsData[friendId]
              });
            }
          }
          
          setFriends(friendsData);
        } else {
          setFriends([]);
        }
      });

      // Listener para solicitudes de amistad
      const requestsRef = ref(database, `friendRequests/${currentUser.uid}`);
      const requestsUnsubscribe = onValue(requestsRef, (snapshot) => {
        if (snapshot.exists()) {
          const requestsData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));
          setFriendRequests(requestsData);
        } else {
          setFriendRequests([]);
        }
      });

      // Listener para chats
      const chatsRef = ref(database, 'chats');
      const chatsQuery = query(chatsRef, orderByChild('participants'));
      const chatsUnsubscribe = onValue(chatsQuery, (snapshot) => {
        if (snapshot.exists()) {
          const chatsData = [];
          snapshot.forEach((childSnapshot) => {
            const chat = childSnapshot.val();
            if (chat.participants && chat.participants.includes(currentUser.uid)) {
              chatsData.push({
                id: childSnapshot.key,
                ...chat
              });
            }
          });
          setChats(chatsData);
        } else {
          setChats([]);
        }
      });

      // Listener para usuarios en línea
      const statusRef = ref(database, 'userStatus');
      const statusUnsubscribe = onValue(statusRef, (snapshot) => {
        if (snapshot.exists()) {
          const statusData = Object.values(snapshot.val()).filter(user => 
            user.isOnline && user.userId !== currentUser.uid
          );
          setOnlineUsers(statusData);
        } else {
          setOnlineUsers([]);
        }
      });

      // Listener para notas compartidas
      const notesRef = ref(database, 'sharedNotes');
      const notesUnsubscribe = onValue(notesRef, (snapshot) => {
        if (snapshot.exists()) {
          const notesData = [];
          snapshot.forEach((childSnapshot) => {
            const note = childSnapshot.val();
            if (note.sharedWith && note.sharedWith.includes(currentUser.uid)) {
              notesData.push({
                id: childSnapshot.key,
                ...note
              });
            }
          });
          setNotes(notesData);
        } else {
          setNotes([]);
        }
      });

      // Cleanup al desmontar
      return () => {
        updateOnlineStatus(false);
        off(friendshipsRef, 'value', friendshipsUnsubscribe);
        off(requestsRef, 'value', requestsUnsubscribe);
        off(chatsRef, 'value', chatsUnsubscribe);
        off(statusRef, 'value', statusUnsubscribe);
        off(notesRef, 'value', notesUnsubscribe);
      };
    }
  }, [currentUser, userProfile?.name, updateOnlineStatus]);

  // Listener para mensajes del chat activo
  useEffect(() => {
    if (activeChat) {
      const messagesRef = ref(database, `messages/${activeChat}`);
      const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = Object.values(snapshot.val()).sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(messagesData);
        } else {
          setMessages([]);
        }
      });

      return () => {
        off(messagesRef, 'value', messagesUnsubscribe);
      };
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const value = useMemo(() => ({
    friends,
    friendRequests,
    chats,
    activeChat,
    messages,
    onlineUsers,
    sharedUsers,
    notes,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    sendMessage,
    shareCycleWith,
    addSharedNote,
    setActiveChat,
    updateOnlineStatus
  }), [
    friends,
    friendRequests,
    chats,
    activeChat,
    messages,
    onlineUsers,
    sharedUsers,
    notes,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    sendMessage,
    shareCycleWith,
    addSharedNote,
    updateOnlineStatus
  ]);

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
};
