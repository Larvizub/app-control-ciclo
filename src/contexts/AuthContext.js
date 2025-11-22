// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { ref, set, get } from 'firebase/database';
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
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    loading,
    loadUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
