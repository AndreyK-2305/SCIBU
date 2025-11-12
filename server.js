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

const resend = new Resend(RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para enviar emails
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    // Validar campos requeridos
    if (!to || !subject || !html) {
      return res.status(400).json({
        error: "Missing required fields: to, subject, html",
      });
    }

    // Enviar email usando Resend
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      html: html,
    });

    return res.status(200).json({
      success: true,
      id: data.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Failed to send email",
      message: error.message || "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy ejecutándose en http://localhost:${PORT}`);
  console.log(`📧 Endpoint de email: http://localhost:${PORT}/api/send-email`);
});

