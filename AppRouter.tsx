import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './contexts/AppProviders.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.tsx';
import { UserProfilePage } from './pages/UserProfilePage.tsx';
import { AccessDeniedPage } from './pages/AccessDeniedPage.tsx';
import { AdminLayout } from './pages/admin/AdminLayout.tsx';
import { AdminUsers } from './pages/admin/AdminUsers.tsx';
import { AdminContent } from './pages/admin/AdminContent.tsx';
import { AdminAnalytics } from './pages/admin/AdminAnalytics.tsx';
import App from './App.tsx';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute requireAuth={false}>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requirePermission="view_admin_dashboard">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
};
