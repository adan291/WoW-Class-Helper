# Phase 6: Enterprise Features - Setup Guide

## 🎯 Overview

Phase 6 adds enterprise-grade features including user authentication, database integration, admin dashboard, role-based access control (RBAC), and audit logging.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Basic understanding of SQL

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - Project name: `wow-class-helper`
   - Database password: (save this securely)
   - Region: Choose closest to your users

### 2. Configure Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute

This will create:

- ✅ `profiles` table (user data and roles)
- ✅ `user_guides` table (saved guides)
- ✅ `favorites` table (favorite classes)
- ✅ `audit_logs` table (security audit trail)
- ✅ Row Level Security (RLS) policies
- ✅ Auto-profile creation trigger

### 3. Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 4. Configure Environment Variables

Create or update `.env.local` in the project root:

```env
# Gemini API (existing)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (new)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Never commit `.env.local` to git!

### 5. Install Dependencies

Dependencies are already installed from Phase 5:

- ✅ `@supabase/supabase-js`
- ✅ `react-router-dom`

If needed, run:

```bash
npm install
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🧪 Testing the Features

### Test Authentication

1. Click "Login" in the header
2. Click "Sign Up" tab
3. Register with your email
4. Check your email for verification link
5. Click verification link
6. Return to app and login

### Test User Profile

1. After logging in, click "Profile" in header
2. View your saved guides, favorites, and activity
3. Test "Export Data" button (GDPR compliance)

### Test Admin Dashboard

1. In Supabase dashboard, go to **Table Editor** → **profiles**
2. Find your user row
3. Change `role` from `user` to `admin`
4. Refresh the app
5. Click "Admin" button in header
6. Explore:
   - **Users**: Manage users, change roles, ban/unban
   - **Content**: Moderate user-generated guides
   - **Analytics**: View platform statistics

### Test RBAC (Role-Based Access Control)

1. Try accessing `/admin` as a regular user → Access Denied
2. Change role to `admin` in database
3. Now you can access admin panel
4. Test different permissions for `user`, `master`, and `admin` roles

### Test Audit Logging

1. Perform various actions (login, logout, create guide, etc.)
2. Go to Admin → Analytics
3. View "Recent Activity" section
4. All critical actions are logged with timestamps

## 📊 Database Tables Overview

### `profiles`

- Stores user information and roles
- Linked to Supabase Auth
- Fields: `id`, `email`, `role`, `banned`, `created_at`

### `user_guides`

- Stores AI-generated guides saved by users
- Fields: `id`, `user_id`, `class_id`, `spec_id`, `content`, `created_at`

### `favorites`

- Stores user's favorite classes
- Fields: `id`, `user_id`, `class_id`, `created_at`
- Unique constraint on `(user_id, class_id)`

### `audit_logs`

- Security audit trail
- Fields: `id`, `user_id`, `action`, `resource`, `timestamp`, `ip_address`, `metadata`

## 🔐 Security Features

### Row Level Security (RLS)

- Users can only access their own data
- Admins can access all data
- Policies enforced at database level

### Role-Based Access Control

- **User**: Basic features, save guides, add favorites
- **Master**: All user features + advanced features
- **Admin**: Full access including admin dashboard

### Audit Logging

- All critical actions logged
- Includes: login, logout, role changes, content moderation
- Immutable audit trail for compliance

## 🎨 New Routes

| Route              | Access        | Description                |
| ------------------ | ------------- | -------------------------- |
| `/`                | Public        | Main app (class selection) |
| `/login`           | Public        | Login/Register page        |
| `/reset-password`  | Public        | Password reset page        |
| `/profile`         | Authenticated | User profile and data      |
| `/admin`           | Admin only    | Admin dashboard            |
| `/admin/users`     | Admin only    | User management            |
| `/admin/content`   | Admin only    | Content moderation         |
| `/admin/analytics` | Admin only    | Analytics dashboard        |
| `/access-denied`   | Public        | Access denied page         |

## 🛠️ Services Overview

### `databaseService.ts`

- CRUD operations for profiles, guides, favorites
- Handles data migration from localStorage

### `adminService.ts`

- User management (ban, role changes)
- Content moderation
- Analytics aggregation

### `auditService.ts`

- Audit log creation
- Log retrieval and filtering

## 🔄 Data Migration

When a user logs in for the first time, localStorage data (favorites) can be migrated to the database:

```typescript
import { favoriteService } from './services/databaseService';

// Get favorites from localStorage
const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Migrate to database
await favoriteService.migrateFavorites(userId, localFavorites);
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

- Check `.env.local` exists and has correct keys
- Restart dev server after adding env vars

### "Row Level Security policy violation"

- Check user is authenticated
- Verify user role in `profiles` table
- Review RLS policies in Supabase dashboard

### "Cannot access admin dashboard"

- Verify user role is `admin` in database
- Clear browser cache and refresh
- Check browser console for errors

### Email verification not working

- Check Supabase email settings
- For development, disable email confirmation:
  - Go to **Authentication** → **Settings**
  - Disable "Enable email confirmations"

## 📈 Next Steps

After Phase 6 is working:

1. **Performance**: Implement caching for database queries
2. **UX**: Add skeleton loaders instead of spinners
3. **Analytics**: Integrate Google Analytics or Plausible
4. **Testing**: Add integration tests for auth flows
5. **Deployment**: Deploy to Vercel/Netlify with production Supabase

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Router v6](https://reactrouter.com)

## ✅ Phase 6 Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] Authentication working (login/register)
- [ ] User profile page accessible
- [ ] Admin dashboard accessible (as admin)
- [ ] RBAC working (different roles have different access)
- [ ] Audit logging capturing actions
- [ ] Data export working (GDPR compliance)

## 🎉 Success!

Once all checklist items are complete, Phase 6 is done! Your WoW AI Class Helper now has enterprise-grade features including authentication, database persistence, admin controls, and security audit trails.

**Total Development Time**: ~4-6 hours
**Complexity**: High
**Priority**: High (for production deployment)

---

**Need Help?** Check the troubleshooting section or review the Supabase documentation.
