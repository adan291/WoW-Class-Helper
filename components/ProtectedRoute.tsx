import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { usePermissions, type Permission } from '../hooks/usePermissions.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requirePermission,
}) => {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
