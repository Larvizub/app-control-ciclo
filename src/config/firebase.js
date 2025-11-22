// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase desde variables de entorno
// Crea un archivo `.env` basado en `.env.example` y no lo subas al repositorio.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Configurar emuladores para desarrollo (opcional)
if (process.env.NODE_ENV === 'development' && !auth._delegateInitialized) {
  try {
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectDatabaseEmulator(database, 'localhost', 9000);
    // connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Emuladores ya conectados');
  }
}

export default app;
