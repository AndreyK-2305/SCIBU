# 🔧 Solución para GitHub Pages

## Problema
GitHub Pages solo sirve archivos estáticos y **no puede ejecutar funciones serverless**. Por eso obtienes el error `405 Method Not Allowed`.

## Solución: Desplegar API en Vercel

### Paso 1: Desplegar la API en Vercel

1. **Ve a [vercel.com](https://vercel.com)** e inicia sesión

2. **Crea un nuevo proyecto:**
   - Haz clic en "Add New Project"
   - Conecta el mismo repositorio de GitHub
   - O crea un proyecto nuevo solo para la API

3. **Configuración del proyecto:**
   - **Root Directory:** Deja vacío o pon `/` (raíz)
   - **Framework Preset:** Otro
   - **Build Command:** (vacío, no necesitas build)
   - **Output Directory:** (vacío)

4. **Variables de entorno:** No necesitas ninguna (la API key está en el código)

5. **Despliega** y copia la URL que te da Vercel
   - Ejemplo: `https://scibu-api.vercel.app`

### Paso 2: Configurar la URL en GitHub

1. **Ve a tu repositorio en GitHub:**
   - Settings → Secrets and variables → Actions → Variables

2. **Agrega una nueva variable:**
   - **Nombre:** `VITE_API_URL`
   - **Valor:** `https://tu-proyecto-api.vercel.app/api/send-email`
   - (Reemplaza `tu-proyecto-api.vercel.app` con tu URL real de Vercel)

3. **Guarda** la variable

### Paso 3: Re-desplegar en GitHub Pages

1. Haz un nuevo commit (cualquier cambio pequeño)
2. Push a tu rama principal
3. GitHub Actions desplegará automáticamente con la nueva variable

### Paso 4: Verificar

1. Abre tu aplicación en GitHub Pages
2. Crea una cita
3. Debería funcionar sin errores

## Alternativa Rápida: Configurar URL directamente

Si no quieres usar variables de entorno, puedes editar directamente el código:

1. **Edita `src/services/notifications.ts`**
2. **Busca la función `getApiUrl()`**
3. **Reemplaza la línea 34 con tu URL de Vercel:**

```typescript
if (isGitHubPages) {
  return "https://tu-proyecto-api.vercel.app/api/send-email";
}
```

4. **Commit y push**

## ⚠️ Nota Importante

- La API debe estar desplegada en Vercel **antes** de configurar la URL
- Asegúrate de que `api/send-email.ts` esté en el repositorio que despliegas en Vercel
- La API key de Resend ya está configurada en `api/send-email.ts`

