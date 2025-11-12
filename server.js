// Servidor proxy simple para desarrollo local
// Este servidor actúa como proxy para las API routes de Vercel
import express from "express";
import cors from "cors";
import { Resend } from "resend";
import * as admin from "firebase-admin";

const app = express();
const PORT = 3000;

// API Key de Resend
const RESEND_API_KEY = "re_PnBd8X6G_KzHQ1T4fRpuinBexHJeKzyWr";
const FROM_EMAIL = "notificaciones@resend.dev";
// Email del propietario para modo de prueba (Resend solo permite enviar a este email en modo de prueba)
const OWNER_EMAIL = "kevinandreyjc@ufps.edu.co";
// Modo de prueba: si es true, enviará al email del propietario en lugar del destinatario original
// NOTA: El sistema acepta CUALQUIER email (Gmail, Hotmail, Yahoo, etc.)
// La limitación es solo de Resend en modo de prueba, no del sistema
// Cambia a false una vez que verifiques un dominio en Resend
const TEST_MODE = true;

const resend = new Resend(RESEND_API_KEY);

// Inicializar Firebase Admin SDK si está disponible
let adminInitialized = false;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    adminInitialized = true;
    console.log("✅ Firebase Admin SDK inicializado");
  } catch (error) {
    console.error("⚠️ Error inicializando Firebase Admin SDK:", error.message);
    console.log("⚠️ La importación de usuarios no funcionará en desarrollo local");
    console.log("⚠️ Para habilitarla, configura FIREBASE_SERVICE_ACCOUNT en .env");
  }
} else {
  console.log("⚠️ FIREBASE_SERVICE_ACCOUNT no configurado");
  console.log("⚠️ La importación de usuarios redirigirá a la API de Vercel");
}

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para enviar emails
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    console.log("Received email request:", { to, subject, htmlLength: html?.length });

    // Validar campos requeridos
    if (!to || !subject || !html) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, html: !!html });
      return res.status(400).json({
        error: "Missing required fields: to, subject, html",
        details: { to: !!to, subject: !!subject, html: !!html },
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error("Invalid email format:", to);
      return res.status(400).json({
        error: "Invalid email format",
        email: to,
      });
    }

    // En modo de prueba, enviar al email del propietario
    // Una vez que verifiques un dominio en Resend, cambia TEST_MODE a false
    let recipientEmail = TEST_MODE ? OWNER_EMAIL : to;
    let finalSubject = subject;
    let finalHtml = html;
    
    if (TEST_MODE && recipientEmail !== to) {
      console.log(`⚠️ MODO DE PRUEBA: Enviando a ${OWNER_EMAIL} en lugar de ${to}`);
      // Modificar el HTML para indicar que es una prueba
      finalHtml = html.replace(
        /<body>/,
        `<body><div style="background-color: #fef3c7; padding: 20px; margin: 20px; border-left: 4px solid #f59e0b; border-radius: 4px; font-family: Arial, sans-serif;">
          <h3 style="margin-top: 0; color: #92400e;">⚠️ MODO DE PRUEBA ACTIVO</h3>
          <p style="margin: 10px 0;"><strong>Destinatario original:</strong> <code style="background: #fef3c7; padding: 2px 6px; border-radius: 3px;">${to}</code></p>
          <p style="margin: 10px 0;"><strong>Email recibido por:</strong> ${OWNER_EMAIL}</p>
          <p style="margin: 15px 0 0 0; font-size: 14px; color: #78350f;">
            Este email se envió a tu dirección porque Resend está en modo de prueba. 
            Para enviar emails directamente a los usuarios, necesitas verificar un dominio en 
            <a href="https://resend.com/domains" style="color: #d97706; font-weight: bold;">resend.com/domains</a>
          </p>
        </div>`
      );
      finalSubject = `[PRUEBA - Destinatario: ${to}] ${subject}`;
    }

    console.log("Sending email via Resend to:", recipientEmail);

    // Enviar email usando Resend
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: finalSubject,
      html: finalHtml,
    });

    console.log("Email sent successfully:", data.id);

    return res.status(200).json({
      success: true,
      id: data.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      response: error.response?.data,
    });
    
    return res.status(500).json({
      error: "Failed to send email",
      message: error.message || "Unknown error",
      details: error.response?.data || error.toString(),
    });
  }
});

// Endpoint para importar usuarios (solo si Firebase Admin está configurado)
app.post("/api/import-users", async (req, res) => {
  if (!adminInitialized) {
    // Si no está configurado, redirigir a Vercel
    console.log("⚠️ Firebase Admin no configurado localmente, redirigiendo a Vercel...");
    try {
      const vercelResponse = await fetch("https://scibu-xp9w.vercel.app/api/import-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
      
      const data = await vercelResponse.json();
      
      if (!vercelResponse.ok) {
        console.error("❌ Error en API de Vercel:", data);
        return res.status(vercelResponse.status).json({
          error: data.error || "Error from Vercel API",
          message: data.message || "La API de Vercel no está configurada correctamente. Por favor, configura FIREBASE_SERVICE_ACCOUNT en las variables de entorno de Vercel.",
          details: data,
        });
      }
      
      return res.status(vercelResponse.status).json(data);
    } catch (error) {
      console.error("❌ Error al redirigir a Vercel:", error);
      return res.status(500).json({
        error: "Failed to import users",
        message: error.message || "No se pudo conectar con la API de Vercel. Por favor, configura FIREBASE_SERVICE_ACCOUNT en las variables de entorno de Vercel o en tu archivo .env local.",
        details: {
          localError: error.message,
          suggestion: "Para desarrollo local, agrega FIREBASE_SERVICE_ACCOUNT a tu archivo .env",
        },
      });
    }
  }

  try {
    const { users, password = "123456" } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Users array is required",
      });
    }

    const db = admin.firestore();
    const auth = admin.auth();

    const results = {
      total: users.length,
      success: 0,
      errors: 0,
      errorDetails: [],
    };

    // Procesar usuarios uno por uno
    for (const userData of users) {
      try {
        // Validar datos requeridos
        if (
          !userData.email ||
          !userData.fullName ||
          !userData.documentType ||
          !userData.documentNumber ||
          !userData.code ||
          !userData.program
        ) {
          results.errors++;
          results.errorDetails.push({
            email: userData.email || "unknown",
            error: "Missing required fields",
          });
          continue;
        }

        // Crear usuario en Firebase Auth usando Admin SDK
        const userRecord = await auth.createUser({
          email: userData.email,
          password: password,
          displayName: userData.fullName,
        });

        const userId = userRecord.uid;

        // Crear datos del usuario en Firestore
        const now = admin.firestore.Timestamp.now();
        await db.collection("users").doc(userId).set({
          email: userData.email,
          fullName: userData.fullName,
          documentType: userData.documentType,
          documentNumber: userData.documentNumber,
          code: userData.code,
          program: userData.program,
          status: "Estudiante",
          birthDate: "",
          phone: "",
          gender: "",
          populationGroups: [],
          socialPrograms: [],
          role: "beneficiario",
          createdAt: now,
          updatedAt: now,
          isProfileComplete: false,
        });

        results.success++;
      } catch (error) {
        results.errors++;
        results.errorDetails.push({
          email: userData.email || "unknown",
          error:
            error.code === "auth/email-already-in-use"
              ? "El email ya está registrado"
              : error.message || "Error desconocido",
        });
      }
    }

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error importing users:", error);
    return res.status(500).json({
      error: "Failed to import users",
      message: error.message || "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy ejecutándose en http://localhost:${PORT}`);
  console.log(`📧 Endpoint de email: http://localhost:${PORT}/api/send-email`);
  console.log(`👥 Endpoint de importación: http://localhost:${PORT}/api/import-users`);
});

