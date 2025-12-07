# 🚀 Guía Completa de Deploy y Mejoras (Plan D)

## ✅ Progreso

- [x] Código actualizado con Google + Discord login
- [ ] Deploy a Vercel
- [ ] Configurar Google OAuth
- [ ] Configurar Discord OAuth
- [ ] Configurar Google Analytics
- [ ] Configurar Sentry (opcional)

---

## 📋 Paso 1: Deploy a Vercel (5 min)

### Comandos a Ejecutar:

```bash
# 1. Instala Vercel CLI (solo primera vez)
npm install -g vercel

# 2. Deploy
vercel
```

### Durante el Deploy:

1. **Login**: Te pedirá login (usa GitHub o Email)
2. **Set up and deploy?** → Yes
3. **Which scope?** → (tu cuenta personal)
4. **Link to existing project?** → No
5. **Project name?** → wow-class-helper
6. **In which directory?** → ./ (presiona Enter)
7. **Override settings?** → No

### Después del Deploy:

1. Te dará una URL: `https://wow-class-helper-xxx.vercel.app`
2. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
3. Selecciona tu proyecto **wow-class-helper**
4. Ve a **Settings** → **Environment Variables**
5. Agrega estas 3 variables (una por una):

```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyCfIomrRxtc6EimbThNr-mwYUdxLxKRasw

Name: VITE_SUPABASE_URL
Value: https://uotnswsjpempmsybfkrc.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdG5zd3NqcGVtcG1zeWJma3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDAwNjksImV4cCI6MjA3OTUxNjA2OX0.K5MWpUgRM60YFnm817BTtzYWrdATL2w34_eSkNwtnnA
```

6. Haz clic en **Deployments** → **Redeploy** (botón de 3 puntos)

✅ **Tu app estará en línea!**

---

## 📋 Paso 2: Configurar Google OAuth (10 min)

### 2.1 Crear Credenciales en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto nuevo:
   - Nombre: **WoW Class Helper**
   - Haz clic en **Create**
3. Espera ~30 segundos
4. Selecciona el proyecto (arriba a la izquierda)
5. En el menú lateral, ve a **APIs & Services** → **OAuth consent screen**
6. Selecciona **External** → **Create**
7. Completa el formulario:
   - App name: **WoW Class Helper**
   - User support email: (tu email)
   - Developer contact: (tu email)
   - Haz clic en **Save and Continue**
8. En "Scopes", haz clic en **Save and Continue** (sin agregar nada)
9. En "Test users", haz clic en **Save and Continue**
10. Haz clic en **Back to Dashboard**

### 2.2 Crear OAuth Client ID

1. Ve a **Credentials** (menú lateral)
2. Haz clic en **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: **WoW Class Helper Web**
5. **Authorized redirect URIs** → **+ Add URI**:
   ```
   https://uotnswsjpempmsybfkrc.supabase.co/auth/v1/callback
   ```
6. Haz clic en **Create**
7. **COPIA** el **Client ID** y **Client Secret** (los necesitarás)

### 2.3 Configurar en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/uotnswsjpempmsybfkrc)
2. Ve a **Authentication** → **Providers**
3. Busca **Google** en la lista
4. Activa el toggle **"Enable Sign in with Google"**
5. Pega:
   - **Client ID**: (el que copiaste)
   - **Client Secret**: (el que copiaste)
6. Haz clic en **Save**

✅ **Google Login funcionando!**

---

## 📋 Paso 3: Configurar Discord OAuth (10 min)

### 3.1 Crear Aplicación en Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz clic en **New Application**
3. Name: **WoW Class Helper**
4. Acepta los términos → **Create**
5. En el menú lateral, ve a **OAuth2**
6. **COPIA** el **Client ID** y **Client Secret**
7. En **Redirects**, haz clic en **Add Redirect**:
   ```
   https://uotnswsjpempmsybfkrc.supabase.co/auth/v1/callback
   ```
8. Haz clic en **Save Changes**

### 3.2 Configurar en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/uotnswsjpempmsybfkrc)
2. Ve a **Authentication** → **Providers**
3. Busca **Discord** en la lista
4. Activa el toggle **"Enable Sign in with Discord"**
5. Pega:
   - **Client ID**: (el que copiaste)
   - **Client Secret**: (el que copiaste)
6. Haz clic en **Save**

✅ **Discord Login funcionando!**

---

## 📋 Paso 4: Google Analytics (5 min)

### 4.1 Crear Propiedad en Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com)
2. Haz clic en **Admin** (engranaje abajo a la izquierda)
3. Haz clic en **+ Create Property**
4. Property name: **WoW Class Helper**
5. Timezone: (tu zona horaria)
6. Currency: EUR
7. Haz clic en **Next**
8. Business details: (completa según tu caso)
9. Haz clic en **Create**
10. Acepta los términos
11. En "Data streams", haz clic en **Web**
12. Website URL: (tu URL de Vercel)
13. Stream name: **WoW Class Helper Web**
14. Haz clic en **Create stream**
15. **COPIA** el **Measurement ID** (G-XXXXXXXXXX)

### 4.2 Agregar a tu App

Crea el archivo `public/ga.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Luego en `index.html`, agrega en el `<head>`:

```html
<script src="/ga.html"></script>
```

✅ **Analytics funcionando!**

---

## 📋 Paso 5: Sentry Error Tracking (10 min - Opcional)

### 5.1 Crear Proyecto en Sentry

1. Ve a [sentry.io](https://sentry.io/signup/)
2. Crea cuenta (gratis)
3. Crea proyecto:
   - Platform: **React**
   - Project name: **wow-class-helper**
4. **COPIA** el **DSN** (https://xxx@xxx.ingest.sentry.io/xxx)

### 5.2 Instalar Sentry

```bash
npm install @sentry/react
```

### 5.3 Configurar en tu App

En `main.tsx` o `index.tsx`, agrega al inicio:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'TU_DSN_AQUI',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

✅ **Error tracking funcionando!**

---

## 📋 Paso 6: Actualizar Supabase Redirect URLs

**IMPORTANTE:** Después del deploy, actualiza las redirect URLs:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/uotnswsjpempmsybfkrc)
2. Ve a **Authentication** → **URL Configuration**
3. En **Site URL**, agrega tu URL de Vercel:
   ```
   https://wow-class-helper-xxx.vercel.app
   ```
4. En **Redirect URLs**, agrega:
   ```
   https://wow-class-helper-xxx.vercel.app/**
   http://localhost:3001/**
   ```
5. Haz clic en **Save**

---

## 🎉 Checklist Final

### Deploy

- [ ] Vercel CLI instalado
- [ ] Deploy ejecutado
- [ ] Variables de entorno configuradas
- [ ] App accesible en URL de Vercel

### OAuth Providers

- [ ] Google OAuth configurado
- [ ] Discord OAuth configurado
- [ ] Redirect URLs actualizadas en Supabase
- [ ] Probado login con Google
- [ ] Probado login con Discord

### Analytics & Monitoring

- [ ] Google Analytics configurado
- [ ] Measurement ID agregado
- [ ] Sentry configurado (opcional)
- [ ] Errores siendo trackeados

### Testing

- [ ] App funciona en producción
- [ ] Login con email funciona
- [ ] Login con Google funciona
- [ ] Login con Discord funciona
- [ ] Admin dashboard accesible
- [ ] Datos se guardan correctamente

---

## 🚨 Troubleshooting

### "Redirect URI mismatch"

**Solución:** Verifica que las redirect URIs en Google/Discord coincidan exactamente con:

```
https://uotnswsjpempmsybfkrc.supabase.co/auth/v1/callback
```

### "Invalid client"

**Solución:** Verifica que copiaste correctamente el Client ID y Secret

### "Site URL not allowed"

**Solución:** Agrega tu URL de Vercel en Supabase → Authentication → URL Configuration

### Variables de entorno no funcionan

**Solución:** Asegúrate de hacer **Redeploy** después de agregar las variables

---

## 📊 Costos

```
Vercel:           0€/mes (Free Forever)
Supabase:         0€/mes (Free: 500MB, 50K users)
Google Cloud:     0€/mes (OAuth es gratis)
Discord:          0€/mes (OAuth es gratis)
Google Analytics: 0€/mes (Gratis)
Sentry:           0€/mes (Free: 5K events/month)

TOTAL:            0€/mes
```

---

## 🎯 Próximos Pasos (Opcional)

### Custom Domain (Gratis con Vercel)

1. Compra dominio (ej: namecheap.com ~10€/año)
2. En Vercel → Settings → Domains
3. Agrega tu dominio
4. Configura DNS según instrucciones

### Email Notifications

1. Usa Supabase Edge Functions (gratis)
2. O integra Resend (gratis: 3K emails/mes)

### Real-time Chat

1. Usa Supabase Realtime (incluido gratis)
2. Implementa chat entre usuarios

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección Troubleshooting
2. Verifica los logs en Vercel Dashboard
3. Revisa los logs en Supabase Dashboard
4. Verifica la consola del navegador (F12)

---

**¡Felicidades! Tu app está lista para producción con 0€ de coste!** 🎉
