import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

// API Key de Resend
const RESEND_API_KEY = "re_PnBd8X6G_KzHQ1T4fRpuinBexHJeKzyWr";
const FROM_EMAIL = "notificaciones@scibu.0025600.xyz";

const resend = new Resend(RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const emailId = result.data?.id || (result as any).id || "unknown";

    console.log("Email sent successfully:", emailId);

    return res.status(200).json({
      success: true,
      id: emailId,
    });
  } catch (error: any) {
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
}
