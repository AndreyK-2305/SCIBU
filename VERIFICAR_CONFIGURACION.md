# 🔍 Guía de Verificación de Configuración - Vercel y GitHub Pages

Esta guía te ayudará a verificar si hay problemas de configuración en Vercel o GitHub Pages que puedan estar causando el error de CORS.

## 1. Verificar Deployment en Vercel

### 1.1 Verificar que la API Route existe
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Deployments**
3. Haz clic en el último deployment
4. Ve a la pestaña **Functions**
5. Verifica que aparezca `api/import-users.ts` en la lista

**Si NO aparece:**
- El archivo no se está desplegando correctamente
- Verifica que el archivo esté en la raíz del proyecto en la carpeta `api/`
- Verifica que el archivo tenga la extensión `.ts` (no `.js`)

### 1.2 Verificar logs del deployment
1. En el deployment, ve a la pestaña **Logs**
2. Busca errores relacionados con:
   - `import-users`
   - `firebase-admin`
   - `CORS`
   - `TypeError` o `Error`

**Si hay errores:**
- Copia el error completo
- Verifica que `firebase-admin` esté en `package.json`
- Verifica que no haya errores de sintaxis

### 1.3 Verificar variables de entorno
1. Ve a **Settings** → **Environment Variables**
2. Verifica que existan estas variables:
   - `FIREBASE_SERVICE_ACCOUNT` (opcional, pero necesaria para que funcione)
   - `FIREBASE_PROJECT_ID` (opcional)
   - Cualquier otra variable de Firebase que uses

**Si falta `FIREBASE_SERVICE_ACCOUNT`:**
- La API funcionará pero devolverá error 500
- Sigue las instrucciones en `CONFIGURAR_FIREBASE_ADMIN.md`

### 1.4 Probar la API directamente
Abre tu navegador o usa `curl` para probar la API:

```bash
# Probar el endpoint OPTIONS (preflight)
curl -X OPTIONS https://scibu-xp9w.vercel.app/api/import-users \
  -H "Origin: https://andreyk-2305.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Qué verificar en la respuesta:**
- Debe retornar `200 OK`
- Debe incluir el header `Access-Control-Allow-Origin: https://andreyk-2305.github.io`
- Debe incluir `Access-Control-Allow-Methods: POST, OPTIONS`
- Debe incluir `Access-Control-Allow-Headers: Content-Type, Authorization`

**Si NO aparecen estos headers:**
- El código no se ha desplegado correctamente
- Hay un error en el código que impide que se ejecute
- Vercel está cacheando una versión antigua

### 1.5 Verificar el código desplegado
1. En Vercel, ve a **Deployments**
2. Haz clic en el último deployment
3. Ve a **Source** o **View Source**
4. Verifica que el archivo `api/import-users.ts` tenga los headers de CORS configurados

**Busca estas líneas en el código:**
```typescript
res.setHeader("Access-Control-Allow-Origin", origin);
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
```

## 2. Verificar GitHub Pages

### 2.1 Verificar que el código esté actualizado
1. Ve a tu repositorio en GitHub
2. Verifica que el archivo `api/import-users.ts` exista
3. Verifica que tenga los headers de CORS configurados

**Nota:** GitHub Pages solo sirve archivos estáticos, no ejecuta código del servidor. La API debe estar en Vercel.

### 2.2 Verificar variables de entorno (si usas GitHub Actions)
1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions** → **Variables**
3. Verifica que `VITE_API_URL` esté configurada (si la usas)

## 3. Verificar desde el Navegador

### 3.1 Verificar en las DevTools
1. Abre tu aplicación en GitHub Pages
2. Abre las **DevTools** (F12)
3. Ve a la pestaña **Network**
4. Intenta importar usuarios
5. Busca la petición a `api/import-users`

**Verifica:**
- **Request Headers:**
  - `Origin: https://andreyk-2305.github.io`
  - `Content-Type: application/json`

- **Response Headers (si la petición se completa):**
  - `Access-Control-Allow-Origin: https://andreyk-2305.github.io` o `*`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

**Si la petición falla antes de llegar al servidor:**
- Es un problema de CORS en el preflight (OPTIONS)
- Verifica que Vercel esté respondiendo correctamente al OPTIONS

### 3.2 Verificar errores en la consola
1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Busca errores relacionados con:
   - `CORS policy`
   - `Failed to fetch`
   - `Access-Control-Allow-Origin`

## 4. Verificar Configuración de Vercel

### 4.1 Verificar vercel.json
Verifica que `vercel.json` tenga la configuración correcta:

```json
{
  "buildCommand": "pnpm build:prod",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Si falta la configuración de rewrites:**
- Las rutas `/api/*` no se redirigirán correctamente
- Agrega la configuración de rewrites

### 4.2 Verificar que Vercel detecte las API routes
1. Ve a **Settings** → **General**
2. Verifica que **Framework Preset** sea correcto (o "Other")
3. Verifica que **Root Directory** sea correcto (generalmente `/` o vacío)

## 5. Checklist de Verificación Rápida

Marca cada item cuando lo verifiques:

- [ ] El archivo `api/import-users.ts` existe en el repositorio
- [ ] El archivo tiene los headers de CORS configurados
- [ ] El deployment en Vercel se completó sin errores
- [ ] La función `api/import-users` aparece en Vercel Functions
- [ ] La petición OPTIONS retorna 200 con headers de CORS
- [ ] `FIREBASE_SERVICE_ACCOUNT` está configurada en Vercel (opcional)
- [ ] `vercel.json` tiene la configuración de rewrites correcta
- [ ] El código en Vercel es la versión más reciente
- [ ] No hay errores en los logs de Vercel

## 6. Soluciones Comunes

### Problema: "No 'Access-Control-Allow-Origin' header"
**Causa:** El código no se ha desplegado o hay un error que impide que se ejecute
**Solución:**
1. Verifica que el código esté en el repositorio
2. Haz un nuevo deployment en Vercel
3. Espera a que el deployment se complete
4. Limpia la caché del navegador

### Problema: "Failed to fetch"
**Causa:** La API no existe o hay un error 500
**Solución:**
1. Verifica los logs de Vercel para ver el error
2. Verifica que `firebase-admin` esté instalado
3. Verifica que las variables de entorno estén configuradas

### Problema: El deployment no incluye la API route
**Causa:** Vercel no detecta el archivo o hay un problema con la estructura
**Solución:**
1. Verifica que el archivo esté en `api/import-users.ts` (no en `src/api/`)
2. Verifica que tenga la extensión `.ts`
3. Verifica que `vercel.json` esté configurado correctamente

## 7. Comandos Útiles para Verificar

### Probar la API desde la terminal:
```bash
# Probar OPTIONS (preflight)
curl -X OPTIONS https://scibu-xp9w.vercel.app/api/import-users \
  -H "Origin: https://andreyk-2305.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Probar POST (debe fallar sin datos, pero verificar headers)
curl -X POST https://scibu-xp9w.vercel.app/api/import-users \
  -H "Origin: https://andreyk-2305.github.io" \
  -H "Content-Type: application/json" \
  -d '{"users":[]}' \
  -v
```

### Verificar que el archivo existe en Vercel:
```bash
# Ver el contenido del deployment (si tienes acceso)
# O verifica en el dashboard de Vercel
```

## 8. Contacto y Soporte

Si después de verificar todo lo anterior el problema persiste:

1. **Revisa los logs de Vercel** para ver errores específicos
2. **Compara con `api/send-email.ts`** que funciona correctamente
3. **Verifica que ambos archivos tengan la misma estructura de CORS**
4. **Intenta hacer un redeploy forzado** en Vercel

## 9. Verificación Final

Una vez que hayas verificado todo:

1. ✅ El código está en el repositorio
2. ✅ Vercel ha desplegado la última versión
3. ✅ La API responde correctamente al OPTIONS
4. ✅ Los headers de CORS están presentes
5. ✅ No hay errores en los logs

Si todo está correcto pero aún hay problemas, puede ser:
- **Caché del navegador:** Limpia la caché o usa modo incógnito
- **Caché de Vercel:** Espera unos minutos o haz un redeploy
- **Problema temporal de red:** Intenta desde otra conexión

