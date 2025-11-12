import { getAuth } from "firebase/auth";

import { Appointment } from "@/types/appointment";
import { getUserData } from "./user";

// ============================================
// CONFIGURACIÓN DE API
// ============================================
// Las notificaciones se envían a través de una API route de Vercel
// para evitar problemas de CORS desde el navegador
// ============================================

// URL de la API
// En desarrollo: usa el servidor proxy local (server.js)
// En GitHub Pages: necesita una URL externa (Vercel)
// En Vercel: usa la ruta relativa automáticamente
function getApiUrl(): string {
  // Si hay una variable de entorno configurada, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Detectar si estamos en GitHub Pages
  const isGitHubPages =
    window.location.hostname.includes("github.io") ||
    window.location.hostname.includes("github.com");

  if (isGitHubPages) {
    // Si estás en GitHub Pages, necesitas desplegar la API en Vercel
    // y configurar VITE_API_URL con la URL de tu API de Vercel
    // Ejemplo: "https://tu-proyecto-api.vercel.app/api/send-email"
    console.warn(
      "⚠️ GitHub Pages detectado. Necesitas configurar VITE_API_URL con la URL de tu API de Vercel",
    );
    // Retornar una URL por defecto (debes configurarla)
    return "https://scibu-xp9w.vercel.app/api/send-email"; // Esto fallará, pero al menos no romperá el build
  }

  // En desarrollo local, detectar si estamos en localhost
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  if (isLocalhost) {
    // En desarrollo local, usar el proxy de Vite que redirige a localhost:3000
    // O usar directamente la API de Vercel si el servidor proxy no está corriendo
    return "/api/send-email";
  }

  // En Vercel, usar ruta relativa
  return "/api/send-email";
}

const API_URL = getApiUrl();

/**
 * Envía un email a través de la API route
 */
async function sendEmailViaAPI(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      const errorDetails = errorData.details ? ` Details: ${JSON.stringify(errorData.details)}` : "";
      console.error("Error response from API:", errorData);
      throw new Error(`${errorMessage}${errorDetails}`);
    }

    const data = await response.json();
    console.log("Email enviado exitosamente:", data.id);
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}

/**
 * Obtiene el email del usuario desde Firestore o Firebase Auth
 */
async function getUserEmail(userId: string | undefined): Promise<string | null> {
  if (!userId) {
    console.warn("getUserEmail: No se proporcionó userId");
    return null;
  }

  try {
    // Primero intentar obtener el email de Firestore
    console.log("getUserEmail: Intentando obtener email de Firestore para userId:", userId);
    const userData = await getUserData(userId);
    console.log("getUserEmail: Datos del usuario obtenidos:", {
      exists: !!userData,
      email: userData?.email,
      fullName: userData?.fullName,
    });
    
    if (userData?.email) {
      console.log("getUserEmail: Email encontrado en Firestore:", userData.email);
      return userData.email;
    }

    // Si no se encuentra en Firestore, intentar obtenerlo de Firebase Auth
    console.log("getUserEmail: Email no encontrado en Firestore, intentando Firebase Auth");
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    // Si el userId coincide con el usuario actual, usar su email
    if (currentUser && currentUser.uid === userId && currentUser.email) {
      console.log("getUserEmail: Email encontrado en Firebase Auth:", currentUser.email);
      return currentUser.email;
    }

    // Si no es el usuario actual, intentar buscar el usuario por ID
    // Nota: Firebase Auth no permite buscar usuarios por ID directamente desde el cliente
    // Por lo tanto, si no está en Firestore y no es el usuario actual, no podemos obtenerlo
    console.warn("getUserEmail: No se pudo obtener el email para userId:", userId);
    return null;
  } catch (error) {
    console.error("Error obteniendo email del usuario:", error);
    return null;
  }
}

/**
 * Formatea la fecha para el email
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Obtiene el label del estado en español
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pendiente: "Pendiente",
    realizado: "Realizado",
    cancelado: "Cancelado",
  };
  return statusMap[status] || status;
}

/**
 * Envía notificación de cita creada
 */
export async function sendAppointmentCreatedNotification(
  appointment: Appointment,
): Promise<void> {
  try {
    console.log("sendAppointmentCreatedNotification: Appointment data:", {
      id: appointment.id,
      userId: appointment.userId,
      requesterName: appointment.requesterName,
    });

    const userEmail = await getUserEmail(appointment.userId);

    if (!userEmail) {
      console.warn(
        "No se pudo obtener el email del usuario para enviar notificación. Appointment userId:",
        appointment.userId,
      );
      return;
    }

    console.log("sendAppointmentCreatedNotification: Enviando email a:", userEmail);

    // Validar que el email sea válido antes de enviar
    if (!userEmail || !userEmail.includes("@")) {
      console.error("Email inválido o vacío:", userEmail);
      throw new Error(`Email inválido: ${userEmail}`);
    }

    const emailSubject = "Cita Agendada Exitosamente";
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4f46e5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .info-row {
              margin: 15px 0;
              padding: 10px;
              background-color: white;
              border-radius: 4px;
            }
            .label {
              font-weight: bold;
              color: #4f46e5;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Cita Agendada Exitosamente</h1>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${appointment.requesterName}</strong>,</p>
              <p>Su cita ha sido agendada exitosamente. A continuación encontrará los detalles:</p>
              
              <div class="info-row">
                <span class="label">Fecha:</span> ${formatDate(appointment.date)}
              </div>
              <div class="info-row">
                <span class="label">Hora:</span> ${appointment.time}
              </div>
              <div class="info-row">
                <span class="label">Servicio:</span> ${appointment.serviceType}
              </div>
              <div class="info-row">
                <span class="label">Especialista:</span> ${appointment.specialistName}
              </div>
              <div class="info-row">
                <span class="label">Estado:</span> ${getStatusLabel(appointment.status)}
              </div>
              ${appointment.reason ? `<div class="info-row"><span class="label">Motivo:</span> ${appointment.reason}</div>` : ""}
              
              <p style="margin-top: 20px;">Por favor, asegúrese de asistir puntualmente a su cita.</p>
              
              <div class="footer">
                <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmailViaAPI(userEmail, emailSubject, emailHtml);

    console.log("Notificación de cita creada enviada a:", userEmail);
  } catch (error) {
    console.error("Error enviando notificación de cita creada:", error);
    // No lanzamos el error para que no afecte el flujo principal
  }
}

/**
 * Envía notificación de cita modificada
 */
export async function sendAppointmentUpdatedNotification(
  appointment: Appointment,
  changes?: { date?: Date; time?: string; status?: string },
): Promise<void> {
  try {
    const userEmail = await getUserEmail(appointment.userId);

    if (!userEmail) {
      console.warn(
        "No se pudo obtener el email del usuario para enviar notificación",
      );
      return;
    }

    const emailSubject = "Cita Actualizada";
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f59e0b;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .info-row {
              margin: 15px 0;
              padding: 10px;
              background-color: white;
              border-radius: 4px;
            }
            .label {
              font-weight: bold;
              color: #f59e0b;
            }
            .changes {
              background-color: #fef3c7;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Cita Actualizada</h1>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${appointment.requesterName}</strong>,</p>
              <p>Su cita ha sido actualizada. A continuación encontrará los detalles actualizados:</p>
              
              <div class="info-row">
                <span class="label">Fecha:</span> ${formatDate(appointment.date)}
              </div>
              <div class="info-row">
                <span class="label">Hora:</span> ${appointment.time}
              </div>
              <div class="info-row">
                <span class="label">Servicio:</span> ${appointment.serviceType}
              </div>
              <div class="info-row">
                <span class="label">Especialista:</span> ${appointment.specialistName}
              </div>
              <div class="info-row">
                <span class="label">Estado:</span> ${getStatusLabel(appointment.status)}
              </div>
              
              ${changes ? `
                <div class="changes">
                  <strong>Cambios realizados:</strong>
                  <ul>
                    ${changes.date ? `<li>Fecha actualizada</li>` : ""}
                    ${changes.time ? `<li>Hora actualizada</li>` : ""}
                    ${changes.status ? `<li>Estado actualizado a: ${getStatusLabel(changes.status)}</li>` : ""}
                  </ul>
                </div>
              ` : ""}
              
              ${appointment.recommendations ? `
                <div class="info-row">
                  <span class="label">Recomendaciones:</span> ${appointment.recommendations}
                </div>
              ` : ""}
              
              <p style="margin-top: 20px;">Por favor, tome nota de los cambios realizados.</p>
              
              <div class="footer">
                <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmailViaAPI(userEmail, emailSubject, emailHtml);

    console.log("Notificación de cita actualizada enviada a:", userEmail);
  } catch (error) {
    console.error("Error enviando notificación de cita actualizada:", error);
    // No lanzamos el error para que no afecte el flujo principal
  }
}

/**
 * Envía notificación de cita eliminada
 */
export async function sendAppointmentDeletedNotification(
  appointment: Appointment,
): Promise<void> {
  try {
    const userEmail = await getUserEmail(appointment.userId);

    if (!userEmail) {
      console.warn(
        "No se pudo obtener el email del usuario para enviar notificación",
      );
      return;
    }

    const emailSubject = "Cita Cancelada";
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #ef4444;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .info-row {
              margin: 15px 0;
              padding: 10px;
              background-color: white;
              border-radius: 4px;
            }
            .label {
              font-weight: bold;
              color: #ef4444;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Cita Cancelada</h1>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${appointment.requesterName}</strong>,</p>
              <p>Le informamos que su cita ha sido cancelada. A continuación encontrará los detalles de la cita cancelada:</p>
              
              <div class="info-row">
                <span class="label">Fecha:</span> ${formatDate(appointment.date)}
              </div>
              <div class="info-row">
                <span class="label">Hora:</span> ${appointment.time}
              </div>
              <div class="info-row">
                <span class="label">Servicio:</span> ${appointment.serviceType}
              </div>
              <div class="info-row">
                <span class="label">Especialista:</span> ${appointment.specialistName}
              </div>
              
              <p style="margin-top: 20px;">Si necesita agendar una nueva cita, por favor acceda al sistema.</p>
              
              <div class="footer">
                <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmailViaAPI(userEmail, emailSubject, emailHtml);

    console.log("Notificación de cita eliminada enviada a:", userEmail);
  } catch (error) {
    console.error("Error enviando notificación de cita eliminada:", error);
    // No lanzamos el error para que no afecte el flujo principal
  }
}

