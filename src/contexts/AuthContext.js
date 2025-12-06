// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { auth, database } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null); // Perfil de la pareja (para hombres)

  // Verificar si el usuario necesita seleccionar tipo de perfil
  const needsProfileTypeSelection = userProfile && !userProfile.userType;
  
  // Verificar si es usuario masculino
  const isMaleUser = userProfile?.userType === 'male';
  
  // Verificar si es usuario femenino
  const isFemaleUser = userProfile?.userType === 'female';

  // Crear cuenta
  const signup = async (email, password, userData) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil
      await updateProfile(result.user, {
        displayName: userData.name
      });

      // Crear perfil en la base de datos
      const userRef = ref(database, `users/${result.user.uid}`);
      await set(userRef, {
        uid: result.user.uid,
        email: email,
        name: userData.name,
        birthDate: userData.birthDate,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        onboardingCompleted: false,
        settings: {
          notifications: true,
          shareData: false,
          theme: 'light',
          language: 'es'
        },
        privacy: {
          shareWithPartner: false,
          allowFriendRequests: true,
          publicProfile: false
        }
      });

      toast.success('¡Cuenta creada exitosamente!');
      return result;
    } catch (error) {
      console.error('Error en signup:', error);
      toast.error(getErrorMessage(error.code));
      throw error;
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Actualizar último login
      const userRef = ref(database, `users/${result.user.uid}/lastLogin`);
      await set(userRef, new Date().toISOString());
      
      toast.success('¡Bienvenida de vuelta!');
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(getErrorMessage(error.code));
      throw error;
    }
  };

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Verificar si es un usuario nuevo
      const userRef = ref(database, `users/${result.user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // Crear perfil para usuario nuevo de Google
        await set(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          settings: {
            notifications: true,
            shareData: false,
            theme: 'light',
            language: 'es'
          },
          privacy: {
            shareWithPartner: false,
            allowFriendRequests: true,
            publicProfile: false
          }
        });
      } else {
        // Actualizar último login
        await set(ref(database, `users/${result.user.uid}/lastLogin`), new Date().toISOString());
      }
      
      toast.success('¡Bienvenida!');
      return result;
    } catch (error) {
      console.error('Error en login con Google:', error);
      toast.error(getErrorMessage(error.code));
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Recuperar contraseña
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Correo de recuperación enviado');
    } catch (error) {
      console.error('Error en reset password:', error);
      toast.error(getErrorMessage(error.code));
      throw error;
    }
  };

  // Cargar perfil del usuario
  const loadUserProfile = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserProfile(snapshot.val());
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  // Actualizar perfil del usuario
  const updateUserProfile = async (profileData) => {
    try {
      if (!currentUser) throw new Error('No hay usuario autenticado');
      
      const userRef = ref(database, `users/${currentUser.uid}`);
      await set(userRef, {
        ...userProfile,
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      setUserProfile(prev => ({
        ...prev,
        ...profileData,
        updatedAt: new Date().toISOString()
      }));
      
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error('Error al actualizar el perfil');
      throw error;
    }
  };

  // Establecer tipo de usuario (male/female)
  const setUserType = async (userType) => {
    try {
      if (!currentUser) throw new Error('No hay usuario autenticado');
      
      const userRef = ref(database, `users/${currentUser.uid}`);
      await update(userRef, {
        userType,
        updatedAt: new Date().toISOString()
      });
      
      setUserProfile(prev => ({
        ...prev,
        userType,
        updatedAt: new Date().toISOString()
      }));
      
      toast.success(userType === 'female' ? '¡Perfil femenino configurado!' : '¡Perfil masculino configurado!');
    } catch (error) {
      console.error('Error estableciendo tipo de usuario:', error);
      toast.error('Error al configurar el perfil');
      throw error;
    }
  };

  // Compartir ciclo con pareja (solo mujeres)
  const shareWithPartner = async (partnerEmail) => {
    try {
      if (!currentUser) throw new Error('No hay usuario autenticado');
      if (!isFemaleUser) throw new Error('Solo usuarios femeninos pueden compartir su ciclo');
      
      // Buscar usuario por email
      const usersRef = ref(database, 'users');
      const usersQuery = query(usersRef, orderByChild('email'), equalTo(partnerEmail));
      const snapshot = await get(usersQuery);
      
      if (!snapshot.exists()) {
        toast.error('Usuario no encontrado. Asegúrate de que tu pareja tenga cuenta.');
        return null;
      }
      
      const partnerData = Object.values(snapshot.val())[0];
      const partnerId = partnerData.uid;
      
      if (partnerId === currentUser.uid) {
        toast.error('No puedes compartir contigo mismo');
        return null;
      }
      
      if (partnerData.userType !== 'male') {
        toast.error('Solo puedes compartir con usuarios masculinos');
        return null;
      }
      
      // Crear relación de pareja
      const partnershipData = {
        odwifeId: currentUser.uid,
        odwifeName: userProfile.name || userProfile.email,
        odwifeEmail: currentUser.email,
        partnerId: partnerId,
        partnerName: partnerData.name || partnerData.email,
        partnerEmail: partnerData.email,
        sharedAt: new Date().toISOString(),
        status: 'active',
        permissions: ['view_cycle', 'view_calendar', 'view_symptoms', 'send_messages']
      };
      
      // Guardar en ambos usuarios
      await set(ref(database, `partnerships/${currentUser.uid}`), partnershipData);
      await set(ref(database, `partnerships/${partnerId}`), partnershipData);
      
      // Actualizar perfil de la mujer
      await update(ref(database, `users/${currentUser.uid}`), {
        partnerId: partnerId,
        partnerEmail: partnerData.email,
        'privacy/shareWithPartner': true
      });
      
      // Actualizar perfil del hombre
      await update(ref(database, `users/${partnerId}`), {
        partnerId: currentUser.uid,
        partnerEmail: currentUser.email
      });
      
      setUserProfile(prev => ({
        ...prev,
        partnerId: partnerId,
        partnerEmail: partnerData.email,
        privacy: { ...prev?.privacy, shareWithPartner: true }
      }));
      
      toast.success(`¡Ciclo compartido con ${partnerData.name || partnerData.email}!`);
      return partnerData;
    } catch (error) {
      console.error('Error compartiendo con pareja:', error);
      toast.error('Error al compartir con tu pareja');
      throw error;
    }
  };

  // Dejar de compartir con pareja
  const stopSharingWithPartner = async () => {
    try {
      if (!currentUser || !userProfile?.partnerId) return;
      
      const partnerId = userProfile.partnerId;
      
      // Eliminar relación
      await set(ref(database, `partnerships/${currentUser.uid}`), null);
      await set(ref(database, `partnerships/${partnerId}`), null);
      
      // Actualizar perfiles
      await update(ref(database, `users/${currentUser.uid}`), {
        partnerId: null,
        partnerEmail: null,
        'privacy/shareWithPartner': false
      });
      
      await update(ref(database, `users/${partnerId}`), {
        partnerId: null,
        partnerEmail: null
      });
      
      setUserProfile(prev => ({
        ...prev,
        partnerId: null,
        partnerEmail: null,
        privacy: { ...prev?.privacy, shareWithPartner: false }
      }));
      
      setPartnerProfile(null);
      
      toast.success('Se dejó de compartir el ciclo');
    } catch (error) {
      console.error('Error dejando de compartir:', error);
      toast.error('Error al dejar de compartir');
      throw error;
    }
  };

  // Cargar perfil de la pareja (para usuarios masculinos)
  const loadPartnerProfile = useCallback(async (partnerId) => {
    try {
      const partnerRef = ref(database, `users/${partnerId}`);
      const snapshot = await get(partnerRef);
      if (snapshot.exists()) {
        setPartnerProfile(snapshot.val());
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error cargando perfil de pareja:', error);
      return null;
    }
  }, []);

  // Obtener mensaje de error en español
  const getErrorMessage = (errorCode) => {
    const messages = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión'
    };
    return messages[errorCode] || 'Error desconocido';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setPartnerProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Cargar perfil de pareja cuando el usuario masculino tiene partnerId
  useEffect(() => {
    if (isMaleUser && userProfile?.partnerId) {
      loadPartnerProfile(userProfile.partnerId);
    }
  }, [isMaleUser, userProfile?.partnerId, loadPartnerProfile]);

  const value = {
    currentUser,
    userProfile,
    partnerProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    loading,
    loadUserProfile,
    updateUserProfile,
    setUserType,
    shareWithPartner,
    stopSharingWithPartner,
    loadPartnerProfile,
    needsProfileTypeSelection,
    isMaleUser,
    isFemaleUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
