# 🔧 Solución para Error 404 en Vercel

## Problema
La ruta `/api/send-email` devuelve 404 en Vercel.

## Soluciones

### Solución 1: Verificar que el archivo esté en el repositorio

1. **Verifica que `api/send-email.ts` esté en GitHub:**
   - Ve a tu repositorio en GitHub
   - Verifica que exista la carpeta `api/` con el archivo `send-email.ts`
   - Si no está, haz commit y push

### Solución 2: Configuración en Vercel Dashboard

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Settings → General**
3. **Verifica:**
   - **Root Directory:** Debe estar vacío o ser `/`
   - **Build Command:** `pnpm build:prod` o `npm run build:prod`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install` o `npm install`

### Solución 3: Re-desplegar

1. **En Vercel Dashboard:**
   - Ve a tu proyecto
   - Haz clic en el último deployment
   - Haz clic en "Redeploy" o "Redeploy" con el mismo commit

### Solución 4: Verificar la estructura del proyecto

Asegúrate de que tu proyecto tenga esta estructura:

```
tu-proyecto/
├── api/
│   └── send-email.ts    ← Debe existir
├── src/
├── package.json
├── vercel.json
└── ...
```

### Solución 5: Usar configuración automática de Vercel

Si el `vercel.json` no funciona, elimínalo temporalmente y deja que Vercel detecte automáticamente:

1. **Renombra `vercel.json` a `vercel.json.backup`**
2. **Haz commit y push**
3. **Vercel detectará automáticamente:**
   - Las funciones en `api/` como serverless functions
   - Los archivos estáticos en `dist/`

### Solución 6: Verificar los logs

1. **En Vercel Dashboard:**
   - Ve a tu proyecto → Deployments → Selecciona el último
   - Ve a "Functions" o "Logs"
   - Busca errores relacionados con `api/send-email`

## Verificación Rápida

Después de aplicar las soluciones, verifica:

1. **Abre:** `https://scibu-xp9w.vercel.app/api/send-email` (GET)
   - Debería devolver: `{"error":"Method not allowed"}` ✅

2. **Prueba POST desde consola:**
```javascript
fetch('https://scibu-xp9w.vercel.app/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'test@ejemplo.com',
    subject: 'Test',
    html: '<h1>Test</h1>'
  })
})
.then(r => r.json())
.then(console.log)
```

## Si Nada Funciona

Crea un proyecto **nuevo** en Vercel solo para la API:

1. **Crea un nuevo proyecto en Vercel**
2. **Conecta el mismo repositorio**
3. **Configuración:**
   - Root Directory: `/` (raíz)
   - Framework: Other
   - Build Command: (vacío)
   - Output Directory: (vacío)
4. **Despliega**
5. **Copia la nueva URL y actualiza `notifications.ts`**

