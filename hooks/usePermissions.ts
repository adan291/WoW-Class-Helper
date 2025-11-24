import { useAuth } from './useAuth.ts';
import type { UserRole } from '../types.ts';

export type Permission =
  | 'view_admin_dashboard'
  | 'manage_users'
  | 'moderate_content'
  | 'view_analytics'
  | 'save_guides'
  | 'add_favorites'
  | 'view_advanced_features';

const rolePermissions: Record<UserRole, Permission[]> = {
  user: ['save_guides', 'add_favorites'],
  master: ['save_guides', 'add_favorites', 'view_advanced_features'],
  admin: [
    'view_admin_dashboard',
    'manage_users',
    'moderate_content',
    'view_analytics',
    'save_guides',
    'add_favorites',
    'view_advanced_features',
  ],
};

export const usePermissions = () => {
  const { userRole } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[userRole]?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: rolePermissions[userRole] || [],
  };
};
