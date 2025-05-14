import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  deleteDoc,
  type Firestore,
  setLogLevel,
} from "firebase/firestore";

import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from "./config";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

console.log("Initializing Firebase with config:", {
  ...firebaseConfig,
  apiKey: "HIDDEN",
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Habilitar logs detallados en modo desarrollo
if (import.meta.env.DEV) {
  setLogLevel("debug");
  console.log("Firebase logging level set to DEBUG");
}

// Configuración específica para Firestore
const firestoreSettings = {
  ignoreUndefinedProperties: true, // Ignorar propiedades undefined
  cacheSizeBytes: 1048576 * 100, // 100 MB
};

// Verificar si estamos en desarrollo
if (import.meta.env.DEV) {
  // Puedes descomentar esto si estás usando emuladores locales
  /*
  if (window.location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Using Firebase emulators for local development");
  }
  */
}

// Temporalmente comentado para solucionar problemas de conectividad
/*
// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.error('The current browser doesn\'t support persistence.');
    }
});
*/

console.log("Firebase initialized successfully");

// Exponer una función para verificar la conexión a Firestore
export async function testFirestoreConnection() {
  try {
    // Intentar acceder a una colección para verificar la conexión
    const testCollectionName = "_connection_test_" + Date.now();
    const testDocRef = doc(collection(db, testCollectionName), "test");
    await setDoc(testDocRef, { timestamp: new Date() });
    await deleteDoc(testDocRef);
    console.log("Firestore connection test successful");
    return true;
  } catch (error) {
    console.error("Firestore connection test failed:", error);
    return false;
  }
}

export { auth, db };
export default app;
