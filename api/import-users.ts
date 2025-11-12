import * as admin from "firebase-admin";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Inicializar Firebase Admin SDK
let adminInitialized = false;

if (!admin.apps.length) {
  try {
    // Intentar usar credenciales desde variable de entorno
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccount) {
      try {
        const credentials = JSON.parse(serviceAccount);
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
        adminInitialized = true;
        console.log("✅ Firebase Admin SDK inicializado con credenciales de servicio");
      } catch (parseError) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", parseError);
      }
    }
    
    // Si no se inicializó con credenciales, intentar Application Default Credentials
    if (!adminInitialized) {
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        adminInitialized = true;
        console.log("✅ Firebase Admin SDK inicializado con Application Default Credentials");
      } catch (adcError) {
        console.error("Error initializing with ADC:", adcError);
      }
    }
    
    // Si aún no está inicializado, intentar con projectId desde variables de entorno
    if (!adminInitialized && process.env.FIREBASE_PROJECT_ID) {
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        adminInitialized = true;
        console.log("✅ Firebase Admin SDK inicializado con projectId");
      } catch (projectError) {
        console.error("Error initializing with projectId:", projectError);
      }
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
} else {
  adminInitialized = true;
  console.log("✅ Firebase Admin SDK ya estaba inicializado");
}

// Verificar que esté inicializado antes de crear las instancias
if (!adminInitialized) {
  console.error("❌ Firebase Admin SDK no pudo ser inicializado");
}

interface CSVUserData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  email: string;
  code: string;
  program: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Configurar CORS headers PRIMERO, antes de cualquier otra cosa
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 horas

  // Manejar preflight request - DEBE retornar con los headers ya configurados
  if (req.method === "OPTIONS") {
    res.status(200);
    res.end();
    return;
  }

  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verificar que Firebase Admin esté inicializado
    if (!adminInitialized || !admin.apps.length) {
      console.error("Firebase Admin SDK no está inicializado");
      return res.status(500).json({
        error: "Firebase Admin SDK not initialized",
        message: "El servidor no está configurado correctamente. Por favor, configura FIREBASE_SERVICE_ACCOUNT en las variables de entorno de Vercel.",
      });
    }

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
      errorDetails: [] as Array<{ email: string; error: string }>,
    };

    // Procesar usuarios uno por uno
    for (const userData of users as CSVUserData[]) {
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
          status: "Estudiante", // Valor por defecto
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
      } catch (error: any) {
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
  } catch (error: any) {
    console.error("Error importing users:", error);
    return res.status(500).json({
      error: "Failed to import users",
      message: error.message || "Unknown error",
    });
  }
}

