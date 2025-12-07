# 🚀 Quick Start - Phase 6 (5 minutos)

## ⚡ Inicio Rápido

### 1️⃣ Crear Proyecto Supabase (2 min)

1. Ve a [supabase.com](https://supabase.com) → **Start your project**
2. Crea nuevo proyecto:
   - Nombre: `wow-class-helper`
   - Password: (guárdala)
   - Región: más cercana a ti

### 2️⃣ Aplicar Schema (1 min)

1. En Supabase → **SQL Editor** → **New query**
2. Copia todo el contenido de `supabase-schema.sql`
3. Pega y haz clic en **Run**
4. ✅ Verás: "Success. No rows returned"

### 3️⃣ Obtener API Keys (1 min)

1. En Supabase → **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...`

### 4️⃣ Configurar Variables (30 seg)

Edita `.env.local`:

```env
VITE_GEMINI_API_KEY=tu_clave_gemini_aqui
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5️⃣ Iniciar App (30 seg)

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## 🧪 Probar Funcionalidades

### Autenticación

1. Clic en **"Login"** (esquina superior derecha)
2. Tab **"Sign Up"**
3. Registra con tu email
4. Verifica email
5. Login

### Perfil de Usuario

1. Después de login → clic **"Profile"**
2. Explora: Guides, Favorites, Activity
3. Prueba **"Export Data"**

### Admin Dashboard

1. En Supabase → **Table Editor** → **profiles**
2. Encuentra tu usuario
3. Cambia `role` de `user` a `admin`
4. Refresca la app
5. Clic **"Admin"** → Explora dashboard

---

## 📊 Verificar Todo Funciona

### ✅ Checklist Rápido

- [ ] App carga sin errores
- [ ] Puedo registrarme
- [ ] Recibo email de verificación
- [ ] Puedo hacer login
- [ ] Veo mi perfil
- [ ] Como admin, veo dashboard
- [ ] Puedo crear guías
- [ ] Guías se guardan en DB

---

## 🐛 Problemas Comunes

### "Missing Supabase environment variables"

```bash
# Verifica que .env.local existe y tiene las 3 variables
# Reinicia el servidor: Ctrl+C y npm run dev
```

### "Email verification not working"

```
Supabase → Authentication → Settings
→ Desactiva "Enable email confirmations" (solo desarrollo)
```

### "Cannot access admin dashboard"

```
Supabase → Table Editor → profiles
→ Cambia tu role a 'admin'
→ Refresca navegador
```

---

## 📚 Documentación Completa

- **Setup Detallado**: `PHASE6_SETUP.md`
- **Estado del Proyecto**: `PROJECT_STATUS_PHASE6_COMPLETE.md`
- **Resumen Ejecutivo**: `PHASE6_EXECUTIVE_SUMMARY.md`
- **README Principal**: `README.md`

---

## 🎉 ¡Listo!

Tu WoW AI Class Helper ahora tiene:

- ✅ Autenticación segura
- ✅ Base de datos en la nube
- ✅ Dashboard de administración
- ✅ Control de acceso por roles
- ✅ Registro de auditoría

**¡Disfruta tu aplicación enterprise-ready!** 🚀🎮
