import { supabase } from '../lib/supabase.ts';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'role_change'
  | 'guide_create'
  | 'guide_delete'
  | 'favorite_add'
  | 'favorite_remove'
  | 'profile_update'
  | 'user_ban'
  | 'user_unban'
  | 'content_moderate';

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  resource: string;
  timestamp: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
}

export const auditService = {
  async log(
    userId: string,
    action: AuditAction,
    resource: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        resource,
        metadata,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('Error logging audit:', error);
      }
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  },

  async getUserLogs(userId: string, limit = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
    return data || [];
  },

  async getAllLogs(limit = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all audit logs:', error);
      return [];
    }
    return data || [];
  },
};
