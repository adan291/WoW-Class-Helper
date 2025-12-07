import { supabase } from '../lib/supabase.ts';
import type { UserRole } from '../types.ts';
import { auditService } from './auditService.ts';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  banned: boolean;
}

export const adminService = {
  // User management
  async getAllUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data || [];
  },

  async searchUsers(query: string): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    return data || [];
  },

  async updateUserRole(adminId: string, userId: string, role: UserRole): Promise<boolean> {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    await auditService.log(adminId, 'role_change', `user:${userId}`, { new_role: role });
    return true;
  },

  async banUser(adminId: string, userId: string): Promise<boolean> {
    const { error } = await supabase.from('profiles').update({ banned: true }).eq('id', userId);

    if (error) {
      console.error('Error banning user:', error);
      return false;
    }

    await auditService.log(adminId, 'user_ban', `user:${userId}`);
    return true;
  },

  async unbanUser(adminId: string, userId: string): Promise<boolean> {
    const { error } = await supabase.from('profiles').update({ banned: false }).eq('id', userId);

    if (error) {
      console.error('Error unbanning user:', error);
      return false;
    }

    await auditService.log(adminId, 'user_unban', `user:${userId}`);
    return true;
  },

  // Content moderation
  async getAllGuides() {
    const { data, error } = await supabase
      .from('user_guides')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guides:', error);
      return [];
    }
    return data || [];
  },

  async deleteGuide(adminId: string, guideId: string): Promise<boolean> {
    const { error } = await supabase.from('user_guides').delete().eq('id', guideId);

    if (error) {
      console.error('Error deleting guide:', error);
      return false;
    }

    await auditService.log(adminId, 'content_moderate', `guide:${guideId}`);
    return true;
  },

  // Analytics
  async getAnalytics() {
    const [usersCount, guidesCount, favoritesCount] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('user_guides').select('id', { count: 'exact', head: true }),
      supabase.from('favorites').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: usersCount.count || 0,
      totalGuides: guidesCount.count || 0,
      totalFavorites: favoritesCount.count || 0,
    };
  },
};
