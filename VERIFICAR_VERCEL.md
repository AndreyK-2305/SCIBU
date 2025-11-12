# ✅ Cómo Verificar que el Despliegue en Vercel fue Exitoso

## 1. Verificar en el Dashboard de Vercel

1. **Ve a [vercel.com/dashboard](https://vercel.com/dashboard)**
2. **Busca tu proyecto** (debería aparecer en la lista)
3. **Verifica el estado:**
   - ✅ **"Ready"** (verde) = Despliegue exitoso
   - ⏳ **"Building"** = Aún está desplegando
   - ❌ **"Error"** (rojo) = Hubo un error

## 2. Verificar que la API Route Funciona

### Opción A: Desde el Navegador

1. **Abre tu navegador** y ve a:
   ```
   https://scibu-xp9w.vercel.app/api/send-email
   ```

2. **Deberías ver:**
   - Si es GET: `{"error":"Method not allowed"}` ✅ (Esto es correcto, solo acepta POST)
   - Si hay error 404: La ruta no existe ❌

### Opción B: Probar con curl (Terminal)

```bash
curl -X POST https://scibu-xp9w.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu-email@ejemplo.com",
    "subject": "Test",
    "html": "<h1>Test</h1>"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "id": "abc123..."
}
```

### Opción C: Desde la Consola del Navegador

1. **Abre la consola** (F12)
2. **Ejecuta:**

```javascript
fetch('https://scibu-xp9w.vercel.app/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'tu-email@ejemplo.com',
    subject: 'Test',
    html: '<h1>Test</h1>'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Deberías ver:**
```json
{ success: true, id: "..." }
```

## 3. Verificar los Logs

1. **En Vercel Dashboard:**
   - Ve a tu proyecto
   - Haz clic en **"Functions"** o **"Deployments"**
   - Selecciona el último despliegue
   - Ve a **"Logs"** o **"Function Logs"**

2. **Busca:**
   - ✅ Sin errores = Todo bien
   - ❌ Errores en rojo = Hay problemas

## 4. Verificar desde tu Aplicación en GitHub Pages

1. **Abre tu aplicación** en GitHub Pages
2. **Abre la consola** (F12)
3. **Crea una cita**
4. **Verifica en la consola:**
   - ✅ `"Email enviado exitosamente: [id]"` = Funciona
   - ❌ `"Error enviando email"` = Hay problema

## 5. Checklist de Verificación

- [ ] El proyecto aparece en Vercel Dashboard con estado "Ready"
- [ ] La URL `https://scibu-xp9w.vercel.app/api/send-email` responde (aunque sea con error de método)
- [ ] El test con POST devuelve `{ success: true, id: "..." }`
- [ ] Los logs no muestran errores
- [ ] Desde GitHub Pages, crear una cita no da error 405
- [ ] Llega el email de notificación

## 🐛 Si Algo No Funciona

### Error 404: "Function not found"
- Verifica que `api/send-email.ts` esté en el repositorio
- Verifica que el despliegue esté completo

### Error 500: "Internal Server Error"
- Revisa los logs en Vercel
- Verifica que la API key de Resend sea válida

### Error CORS
- Normalmente no debería pasar
- Verifica que estés usando la URL completa de Vercel

### No llegan los emails
- Verifica los logs de Resend: [resend.com/emails](https://resend.com/emails)
- Verifica que el email del remitente esté verificado en Resend

