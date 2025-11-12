# 🚀 Guía de Despliegue a Producción

## Despliegue en Vercel

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Conectar el repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Haz clic en "Add New Project"
   - Selecciona tu repositorio `SCIBU`
   - Vercel detectará automáticamente la configuración

2. **Configurar Variables de Entorno (si es necesario):**
   - En la configuración del proyecto en Vercel
   - Ve a "Settings" → "Environment Variables"
   - Agrega las variables de Firebase si no están ya configuradas:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

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

## 🐛 Solución de Problemas

### Error: "Function not found"
- Verifica que `api/send-email.ts` esté en el repositorio
- Verifica que `vercel.json` tenga la configuración correcta

### Error: "CORS"
- En producción, esto no debería ocurrir porque la API route corre en el servidor
- Si ocurre, verifica que estés usando `/api/send-email` (ruta relativa)

### Error: "Failed to send email"
- Verifica que la API key de Resend sea válida
- Verifica que el email del remitente esté verificado en Resend
- Revisa los logs en Vercel Dashboard

## 🎉 ¡Listo!

Una vez desplegado, las notificaciones funcionarán automáticamente cuando:
- Se cree una cita
- Se modifique una cita
- Se elimine una cita

