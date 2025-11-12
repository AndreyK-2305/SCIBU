import { Resend } from "resend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// API Key de Resend
const RESEND_API_KEY = "re_PnBd8X6G_KzHQ1T4fRpuinBexHJeKzyWr";
const FROM_EMAIL = "notificaciones@resend.dev";

const resend = new Resend(RESEND_API_KEY);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Configurar CORS headers
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://andreyk-2305.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  // Permitir cualquier origen en desarrollo o si está en la lista
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // En producción, permitir cualquier origen (ajusta según necesites)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Manejar preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Failed to send email",
      message: error.message || "Unknown error",
    });
  }
}

