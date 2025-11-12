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

