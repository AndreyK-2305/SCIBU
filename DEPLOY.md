# 🚀 Guía de Despliegue a Producción

## Despliegue en Vercel

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Conectar el repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Haz clic en "Add New Project"
   - Selecciona tu repositorio `SCIBU`
   - Vercel detectará automáticamente la configuración

2. **Configurar Variables de Entorno:**
   - En la configuración del proyecto en Vercel
   - Ve a "Settings" → "Environment Variables"
   - Agrega las **mismas variables** que tienes en GitHub Pages:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET` (si la usas)
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_BACKEND_BASE_URL` (si la usas)
   
   **Nota:** Puedes copiar los valores directamente desde GitHub Pages → Settings → Secrets and variables → Actions → Variables

3. **Desplegar:**
   - Vercel desplegará automáticamente cuando hagas push a la rama principal
   - O haz clic en "Deploy" manualmente

### Opción 2: Despliegue desde CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión:**
   ```bash
   vercel login
   ```

3. **Desplegar:**
   ```bash
   vercel --prod
   ```

## ✅ Verificación Post-Despliegue

### 1. Verificar que la API Route funciona

Después del despliegue, prueba el endpoint:

```bash
curl -X POST https://tu-dominio.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu-email@ejemplo.com",
    "subject": "Test",
    "html": "<h1>Test</h1>"
  }'
```

O desde el navegador, abre la consola y ejecuta:

```javascript
fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'tu-email@ejemplo.com',
    subject: 'Test',
    html: '<h1>Test</h1>'
  })
}).then(r => r.json()).then(console.log)
```

### 2. Verificar las notificaciones

1. Crea una cita en la aplicación
2. Verifica que llegue el email
3. Revisa los logs en Vercel Dashboard → Functions → Logs

### 3. Monitoreo

- **Logs de Vercel:** Dashboard → Tu Proyecto → Functions → Logs
- **Logs de Resend:** [resend.com/emails](https://resend.com/emails)

## 🔧 Configuración Importante

### API Route (`api/send-email.ts`)

La API route ya está configurada con:
- ✅ API Key de Resend
- ✅ Email del remitente
- ✅ Manejo de errores
- ✅ Validación de campos

### Notificaciones (`src/services/notifications.ts`)

El servicio de notificaciones está configurado para:
- ✅ Usar `/api/send-email` automáticamente en producción
- ✅ Funcionar con el servidor proxy en desarrollo local

## 📝 Notas Importantes

1. **No necesitas el servidor proxy en producción:** Solo se usa en desarrollo local (`server.js`)

2. **La API route se detecta automáticamente:** Vercel detecta las funciones en la carpeta `api/` automáticamente

3. **Las rutas están configuradas:** El `vercel.json` ya está configurado para manejar las API routes correctamente

4. **Variables de entorno:** Si necesitas cambiar la API key de Resend, edita `api/send-email.ts` directamente (según tus requisitos de seguridad)

## 📦 Despliegue en GitHub Pages

Si estás usando **GitHub Pages** en lugar de Vercel, necesitas desplegar la API por separado:

### Opción A: Desplegar API en Vercel (Recomendado)

1. **Desplegar solo la API en Vercel:**
   - Crea un nuevo proyecto en Vercel
   - O usa el mismo repositorio pero solo despliega la carpeta `api/`
   - Obtén la URL de tu API (ej: `https://tu-api.vercel.app`)

2. **Configurar la variable de entorno:**
   - En GitHub: Settings → Secrets and variables → Actions → Variables
   - Agrega: `VITE_API_URL` = `https://tu-api.vercel.app/api/send-email`
   - Esto hará que el build use esa URL

3. **Alternativa: Configurar en el código:**
   - Edita `src/services/notifications.ts`
   - Cambia la URL por defecto para GitHub Pages

### Opción B: Usar Firebase Cloud Functions

Si prefieres usar Firebase (ya que usas Firebase en el proyecto):

1. Instalar Firebase CLI: `npm i -g firebase-tools`
2. Crear función en `functions/src/sendEmail.ts`
3. Desplegar: `firebase deploy --only functions`
4. Configurar `VITE_API_URL` con la URL de la función

## 🐛 Solución de Problemas

### Error: "405 Method Not Allowed" en GitHub Pages
- **Causa:** GitHub Pages no soporta funciones serverless
- **Solución:** Despliega la API en Vercel y configura `VITE_API_URL`

### Error: "Function not found"
- Verifica que `api/send-email.ts` esté en el repositorio
- Verifica que `vercel.json` tenga la configuración correcta

### Error: "CORS"
- En producción, esto no debería ocurrir porque la API route corre en el servidor
- Si ocurre, verifica que estés usando la URL completa de la API

### Error: "Failed to send email"
- Verifica que la API key de Resend sea válida
- Verifica que el email del remitente esté verificado en Resend
- Revisa los logs en Vercel Dashboard

## 🎉 ¡Listo!

Una vez desplegado, las notificaciones funcionarán automáticamente cuando:
- Se cree una cita
- Se modifique una cita
- Se elimine una cita

