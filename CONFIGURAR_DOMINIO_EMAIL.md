# 📧 Guía para Configurar Dominio de Email en Resend

## Situación Actual

Actualmente, el sistema está en **modo de prueba** (`TEST_MODE = true`). Esto significa que:
- ✅ **El sistema acepta CUALQUIER email** (Gmail, Hotmail, Yahoo, ufps.edu.co, etc.)
- ✅ Todos los emails se envían correctamente
- ⚠️ **Limitación temporal de Resend**: Todos los emails llegan a `kevinandreyjc@ufps.edu.co` (tu email) porque Resend en modo de prueba solo permite enviar al propietario de la cuenta
- ℹ️ El email muestra el destinatario original en un banner informativo

**IMPORTANTE**: El sistema NO está limitado a `ufps.edu.co`. Puede enviar a cualquier email válido. La limitación es solo de Resend en modo de prueba.

## ¿Por qué necesitas verificar un dominio?

Resend en modo de prueba solo permite enviar emails a la dirección del propietario de la cuenta. Para enviar emails a cualquier destinatario, necesitas verificar un dominio.

## Opciones para Obtener un Dominio

### Opción 1: Dominio Gratuito (Limitado)

**Freenom** ofrece dominios gratuitos (.tk, .ml, .ga, .cf):
- ✅ Gratis
- ⚠️ Pueden tener problemas de reputación
- ⚠️ Pueden ser bloqueados por filtros de spam
- ⚠️ Algunos proveedores no los aceptan

**Pasos:**
1. Ve a [Freenom.com](https://www.freenom.com)
2. Busca y registra un dominio gratuito
3. Configura los registros DNS que Resend te proporcione

### Opción 2: Dominio Barato (Recomendado)

**Proveedores recomendados:**
- **Namecheap**: ~$1-10/año (promociones frecuentes)
- **GoDaddy**: ~$1-15/año
- **Cloudflare Registrar**: Precios al costo (~$8-10/año)

**Pasos:**
1. Compra un dominio (ej: `tudominio.com`)
2. Configura los registros DNS que Resend te proporcione
3. Verifica el dominio en Resend

### Opción 3: Solicitar Acceso al Dominio Institucional

Si necesitas usar el dominio de la universidad:
1. Contacta al departamento de TI de la UFPS
2. Explica que es para un proyecto académico
3. Solicita que agreguen los registros DNS necesarios

## Cómo Verificar un Dominio en Resend

Una vez que tengas un dominio:

### Paso 1: Agregar Dominio en Resend
1. Ve a [resend.com/domains](https://resend.com/domains)
2. Haz clic en "Add Domain"
3. Ingresa tu dominio (ej: `tudominio.com`)

### Paso 2: Configurar Registros DNS
Resend te proporcionará registros DNS que debes agregar en tu proveedor de dominio:

**Ejemplo de registros:**
- **SPF**: `v=spf1 include:resend.com ~all`
- **DKIM**: Registros CNAME específicos
- **DMARC**: (opcional pero recomendado)

### Paso 3: Verificar el Dominio
1. Espera la propagación DNS (puede tardar minutos a 48 horas)
2. Haz clic en "Verify" en Resend
3. Una vez verificado, cambia `TEST_MODE = false` en los archivos

## Cambiar a Modo Producción

Una vez que tengas el dominio verificado:

### 1. Actualizar `FROM_EMAIL`
En `api/send-email.ts` y `server.js`, cambia:
```typescript
const FROM_EMAIL = "notificaciones@tudominio.com"; // Tu dominio verificado
```

### 2. Desactivar Modo de Prueba
En ambos archivos, cambia:
```typescript
const TEST_MODE = false; // Cambiar a false
```

### 3. Desplegar Cambios
- Si usas Vercel: los cambios se desplegarán automáticamente
- Si usas el servidor local: reinicia el servidor

## Estado Actual del Sistema

✅ **Funcionalidad completa**: El sistema funciona perfectamente en modo de prueba
✅ **Emails funcionando**: Todos los emails se envían y llegan correctamente
✅ **Información clara**: El destinatario original se muestra en cada email
⚠️ **Limitación temporal**: Los emails llegan a tu cuenta en lugar de a los usuarios

## Recomendación

**Para desarrollo/pruebas**: Mantén el modo de prueba activo (`TEST_MODE = true`)

**Para producción**: 
- Si es un proyecto académico pequeño: Considera mantener el modo de prueba
- Si necesitas enviar a usuarios reales: Obtén un dominio barato ($1-10/año) y verifícalo

## Archivos a Modificar

Cuando estés listo para cambiar a producción, modifica:
1. `api/send-email.ts` (líneas 6, 11)
2. `server.js` (líneas 12, 17)

## Soporte

- Documentación de Resend: [resend.com/docs](https://resend.com/docs)
- Soporte de Resend: [resend.com/support](https://resend.com/support)

