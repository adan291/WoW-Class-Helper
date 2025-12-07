import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './contexts/AppProviders';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { HubPage } from './pages/HubPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { FallbackStatusBar } from './components/FallbackStatusBar';
import { ReloadPrompt } from './components/ReloadPrompt';
import { SkipLink } from './components/SkipLink';
import { FloatingNav } from './components/FloatingNav';

// Lazy load modules for better performance
const ClassHelperApp = lazy(() => import('./modules/class-helper/ClassHelperApp'));
const LogAnalyzerApp = lazy(() => import('./modules/log-analyzer/LogAnalyzerApp'));
const GuildManagerApp = lazy(() => import('./modules/guild-manager/GuildManagerApp'));

// Loading component for lazy loaded modules
const ModuleLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-yellow-500 font-medium">Loading module...</p>
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <SkipLink />
          <FallbackStatusBar />
          <ReloadPrompt />

          <Suspense fallback={<ModuleLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />

              {/* Hub - Main Landing Page */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <HubPage />
                  </ProtectedRoute>
                }
              />

              {/* Class Helper Module */}
              <Route
                path="/class-helper"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ClassHelperApp />
                  </ProtectedRoute>
                }
              />

              {/* Log Analyzer Module */}
              <Route
                path="/log-analyzer"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LogAnalyzerApp />
                  </ProtectedRoute>
                }
              />

              {/* Guild Manager Module (Ethernal) */}
              <Route
                path="/guild-manager/*"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <GuildManagerApp />
                  </ProtectedRoute>
                }
              />

              {/* User Profile */}
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

              {/* Catch all - redirect to hub */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <FloatingNav />
          <ToastContainer />
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  );
};
