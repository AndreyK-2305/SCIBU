# 🔧 Configurar Firebase Admin SDK para Importación de Usuarios

## Problema Actual

El error 500 que estás viendo se debe a que Firebase Admin SDK no está configurado correctamente. Firebase Admin SDK requiere credenciales de servicio para crear usuarios sin afectar la sesión del administrador.

## Solución: Configurar Credenciales de Servicio

### Paso 1: Obtener las Credenciales de Servicio

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Haz clic en **Generate New Private Key**
5. Se descargará un archivo JSON con las credenciales

### Paso 2: Configurar en Vercel

1. Ve a tu proyecto en [Vercel](https://vercel.com/)
2. Ve a **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Pega el contenido completo del archivo JSON que descargaste
   - **Environments**: Selecciona Production, Preview, y Development
4. Guarda los cambios

### Paso 3: Redesplegar

Después de agregar la variable de entorno, necesitas redesplegar tu aplicación en Vercel:

1. Ve a **Deployments** en Vercel
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **Redeploy**

O simplemente haz un push a tu repositorio para que Vercel redesplegue automáticamente.

## Configuración para Desarrollo Local (Opcional)

Si quieres probar la importación de usuarios en desarrollo local:

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega la variable:
   ```
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```
   (Reemplaza con el contenido completo del JSON, pero como una sola línea)

3. Reinicia el servidor proxy local:
   ```bash
   pnpm dev:all
   ```

## Verificación

Después de configurar las credenciales:

1. Intenta importar usuarios nuevamente
2. Si funciona correctamente, verás el progreso y los usuarios se crearán sin afectar tu sesión
3. Si aún hay errores, revisa los logs de Vercel para ver detalles específicos

## Nota de Seguridad

⚠️ **IMPORTANTE**: Las credenciales de servicio dan acceso completo a tu proyecto de Firebase. Nunca las compartas públicamente ni las subas a repositorios públicos. Vercel encripta estas variables de entorno, así que es seguro almacenarlas allí.

## Alternativa Temporal

Si no puedes configurar las credenciales ahora mismo, puedes usar temporalmente el método anterior (crear usuarios directamente desde el cliente), pero esto cambiará tu sesión. Para hacerlo:

1. Revertir los cambios en `ImportUsersModal.tsx` para usar `createUserFromCSV` directamente
2. Aceptar que la sesión cambiará durante la importación

Pero la solución recomendada es configurar Firebase Admin SDK como se describe arriba.

