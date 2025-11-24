import React from 'react';
import { usePermissions, type Permission } from '../hooks/usePermissions.ts';

interface CanAccessProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const CanAccess: React.FC<CanAccessProps> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
