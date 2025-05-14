import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Router from "./Router";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "./lib/config";
import { ADMIN_CREDENTIALS } from "./utils/adminInfo";

// Verificar la configuración de Firebase
const firebaseConfigCheck = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfigCheck)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error("⚠️ CONFIGURACIÓN DE FIREBASE INCOMPLETA ⚠️");
  console.error("Faltan las siguientes variables de entorno:");
  console.error(missingConfig.join(", "));
  console.error("Verifica tu archivo .env o .env.local");
} else {
  console.log("✓ Configuración de Firebase correcta");
}

// Capturar errores globales
window.addEventListener("error", (event) => {
  console.error("Error global capturado:", event.error);
});

// Escuchar errores de promesas no manejadas
window.addEventListener("unhandledrejection", (event) => {
  console.error("Promesa rechazada no manejada:", event.reason);
});

// Mostrar credenciales de admin en consola (solo desarrollo)
if (import.meta.env.DEV) {
  console.log(
    "%c 👑 Credenciales de Administrador 👑 ",
    "background: #4F46E5; color: white; padding: 5px; border-radius: 5px; font-weight: bold;",
  );
  console.log(
    `%c Email: ${ADMIN_CREDENTIALS.email}\n Password: ${ADMIN_CREDENTIALS.password}`,
    "color: #4F46E5; font-weight: bold;",
  );
  console.log("URL de configuración: [URL_BASE]/#/admin-setup");
}

// Renderizar la aplicación
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router />
    <Toaster />
  </StrictMode>,
);
