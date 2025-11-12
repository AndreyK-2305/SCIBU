// Servidor proxy simple para desarrollo local
// Este servidor actúa como proxy para las API routes de Vercel
import express from "express";
import cors from "cors";
import { Resend } from "resend";

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

app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy ejecutándose en http://localhost:${PORT}`);
  console.log(`📧 Endpoint de email: http://localhost:${PORT}/api/send-email`);
});

