/**
 * RBAC Service
 * Role-Based Access Control management
 */

export type Role = 'user' | 'moderator' | 'admin';
export type Permission =
  | 'view_content'
  | 'create_content'
  | 'edit_content'
  | 'delete_content'
  | 'moderate_content'
  | 'manage_users'
  | 'view_analytics'
  | 'manage_system'
  | 'view_reports'
  | 'resolve_reports';

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

export interface UserRole {
  userId: string;
  role: Role;
  assignedAt: number;
  assignedBy: string;
}

class RBACService {
  private readonly ROLE_PERMISSIONS_KEY = 'wow_class_helper_role_permissions';
  private readonly USER_ROLES_KEY = 'wow_class_helper_user_roles';

  private readonly DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
    user: ['view_content', 'create_content', 'edit_content'],
    moderator: [
      'view_content',
      'create_content',
      'edit_content',
      'delete_content',
      'moderate_content',
      'view_reports',
      'resolve_reports',
    ],
    admin: [
      'view_content',
      'create_content',
      'edit_content',
      'delete_content',
      'moderate_content',
      'manage_users',
      'view_analytics',
      'manage_system',
      'view_reports',
      'resolve_reports',
    ],
  };

  constructor() {
    this.initializeDefaultPermissions();
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, permission: Permission): boolean {
    const role = this.getUserRole(userId);
    if (!role) return false;

    const permissions = this.getRolePermissions(role);
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(userId, p));
  }

  /**
   * Check if user has all permissions
   */
  hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(userId, p));
  }

  /**
   * Get user role
   */
  getUserRole(userId: string): Role | null {
    try {
      const data = localStorage.getItem(this.USER_ROLES_KEY);
      if (!data) return null;

      const userRoles: UserRole[] = JSON.parse(data);
      const userRole = userRoles.find((ur) => ur.userId === userId);

      return userRole?.role || null;
    } catch {
      return null;
    }
  }

  /**
   * Assign role to user
   */
  assignRole(userId: string, role: Role, assignedBy: string): boolean {
    try {
      const data = localStorage.getItem(this.USER_ROLES_KEY);
      const userRoles: UserRole[] = data ? JSON.parse(data) : [];

      // Remove existing role
      const filtered = userRoles.filter((ur) => ur.userId !== userId);

      // Add new role
      filtered.push({
        userId,
        role,
        assignedAt: Date.now(),
        assignedBy,
      });

      localStorage.setItem(this.USER_ROLES_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove role from user
   */
  removeRole(userId: string): boolean {
    try {
      const data = localStorage.getItem(this.USER_ROLES_KEY);
      if (!data) return false;

      const userRoles: UserRole[] = JSON.parse(data);
      const filtered = userRoles.filter((ur) => ur.userId !== userId);

      localStorage.setItem(this.USER_ROLES_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: Role): Permission[] {
    try {
      const data = localStorage.getItem(this.ROLE_PERMISSIONS_KEY);
      if (!data) return this.DEFAULT_PERMISSIONS[role];

      const rolePermissions: RolePermission[] = JSON.parse(data);
      const rolePerms = rolePermissions.find((rp) => rp.role === role);

      return rolePerms?.permissions || this.DEFAULT_PERMISSIONS[role];
    } catch {
      return this.DEFAULT_PERMISSIONS[role];
    }
  }

  /**
   * Add permission to role
   */
  addPermissionToRole(role: Role, permission: Permission): boolean {
    try {
      const data = localStorage.getItem(this.ROLE_PERMISSIONS_KEY);
      const rolePermissions: RolePermission[] = data ? JSON.parse(data) : [];

      let rolePerms = rolePermissions.find((rp) => rp.role === role);

      if (!rolePerms) {
        rolePerms = {
          role,
          permissions: [...this.DEFAULT_PERMISSIONS[role]],
        };
        rolePermissions.push(rolePerms);
      }

      if (!rolePerms.permissions.includes(permission)) {
        rolePerms.permissions.push(permission);
      }

      localStorage.setItem(this.ROLE_PERMISSIONS_KEY, JSON.stringify(rolePermissions));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove permission from role
   */
  removePermissionFromRole(role: Role, permission: Permission): boolean {
    try {
      const data = localStorage.getItem(this.ROLE_PERMISSIONS_KEY);
      if (!data) return false;

      const rolePermissions: RolePermission[] = JSON.parse(data);
      const rolePerms = rolePermissions.find((rp) => rp.role === role);

      if (!rolePerms) return false;

      rolePerms.permissions = rolePerms.permissions.filter((p) => p !== permission);

      localStorage.setItem(this.ROLE_PERMISSIONS_KEY, JSON.stringify(rolePermissions));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all users with role
   */
  getUsersWithRole(role: Role): string[] {
    try {
      const data = localStorage.getItem(this.USER_ROLES_KEY);
      if (!data) return [];

      const userRoles: UserRole[] = JSON.parse(data);
      return userRoles.filter((ur) => ur.role === role).map((ur) => ur.userId);
    } catch {
      return [];
    }
  }

  /**
   * Get role statistics
   */
  getRoleStats(): Record<Role, number> {
    try {
      const data = localStorage.getItem(this.USER_ROLES_KEY);
      if (!data) {
        return { user: 0, moderator: 0, admin: 0 };
      }

      const userRoles: UserRole[] = JSON.parse(data);

      return {
        user: userRoles.filter((ur) => ur.role === 'user').length,
        moderator: userRoles.filter((ur) => ur.role === 'moderator').length,
        admin: userRoles.filter((ur) => ur.role === 'admin').length,
      };
    } catch {
      return { user: 0, moderator: 0, admin: 0 };
    }
  }

  /**
   * Reset role to default
   */
  resetRoleToDefault(role: Role): boolean {
    try {
      const data = localStorage.getItem(this.ROLE_PERMISSIONS_KEY);
      const rolePermissions: RolePermission[] = data ? JSON.parse(data) : [];

      const index = rolePermissions.findIndex((rp) => rp.role === role);

      if (index >= 0) {
        rolePermissions[index].permissions = [...this.DEFAULT_PERMISSIONS[role]];
      } else {
        rolePermissions.push({
          role,
          permissions: [...this.DEFAULT_PERMISSIONS[role]],
        });
      }

      localStorage.setItem(this.ROLE_PERMISSIONS_KEY, JSON.stringify(rolePermissions));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export RBAC configuration
   */
  exportConfiguration(): string {
    const rolePermissions = this.getAllRolePermissions();
    const userRoles = this.getAllUserRoles();

    return JSON.stringify(
      {
        rolePermissions,
        userRoles,
      },
      null,
      2
    );
  }

  /**
   * Import RBAC configuration
   */
  importConfiguration(json: string): boolean {
    try {
      const config = JSON.parse(json);

      if (config.rolePermissions) {
        localStorage.setItem(this.ROLE_PERMISSIONS_KEY, JSON.stringify(config.rolePermissions));
      }

      if (config.userRoles) {
        localStorage.setItem(this.USER_ROLES_KEY, JSON.stringify(config.userRoles));
      }

      return true;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private initializeDefaultPermissions(): void {
    try {
      const data = localStorage.getItem(this.ROLE_PERMISSIONS_KEY);
      if (!data) {
        const rolePermissions: RolePermission[] = Object.entries(this.DEFAULT_PERMISSIONS).map(
          ([role, permissions]) => ({
            role: role as Role,
            permissions,
          })
        );

        localStorage.setItem(this.ROLE_PERMISSIONS_KEY, JSON.stringify(rolePermissions));
      }
    } catch {
      console.error('Failed to initialize default permissions');
    }
  }

  private getAllRolePermissions(): RolePermission[] {
    try {
      const data = localStorage.getItem(this.ROLE_PERMISSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getAllUserRoles(): UserRole[] {
    try {
      const data = localStorage.getItem(this.USER_ROLES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const rbacService = new RBACService();
