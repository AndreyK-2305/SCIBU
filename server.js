// Servidor proxy simple para desarrollo local
// Este servidor actúa como proxy para las API routes de Vercel
import cors from "cors";
import express from "express";
import { Resend } from "resend";

const app = express();
const PORT = 3000;

// API Key de Resend
const RESEND_API_KEY = "re_PnBd8X6G_KzHQ1T4fRpuinBexHJeKzyWr";
const FROM_EMAIL = "notificaciones@scibu.0025600.xyz";

const resend = new Resend(RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para enviar emails
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    console.log("Received email request:", {
      to,
      subject,
      htmlLength: html?.length,
    });

    // Validar campos requeridos
    if (!to || !subject || !html) {
      console.error("Missing required fields:", {
        to: !!to,
        subject: !!subject,
        html: !!html,
      });
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

    console.log("Sending email via Resend to:", to);

    // Enviar email usando Resend
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      html: html,
    });

    // La respuesta de Resend puede tener la estructura { data: { id: string } } o { id: string }
    const emailId = result.data?.id || result.id || "unknown";

    console.log("Email sent successfully:", emailId);

    return res.status(200).json({
      success: true,
      id: emailId,
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
