/**
 * Audit Service
 * Tracks all user actions for compliance and security
 */

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}

export interface AuditStats {
  totalLogs: number;
  logsThisMonth: number;
  logsThisWeek: number;
  successRate: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
}

class AuditService {
  private readonly AUDIT_LOGS_KEY = 'wow_class_helper_audit_logs';
  private readonly MAX_LOGS = 10000;
  private readonly RETENTION_DAYS = 90;

  /**
   * Log action
   */
  logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    status: 'success' | 'failure' = 'success',
    changes?: AuditLog['changes']
  ): void {
    const log: AuditLog = {
      id: this.generateId(),
      userId,
      action,
      resource,
      resourceId,
      changes,
      status,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    this.saveLog(log);
  }

  /**
   * Get audit logs
   */
  getAuditLogs(limit = 100, offset = 0): AuditLog[] {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      if (!data) return [];

      const logs: AuditLog[] = JSON.parse(data);
      return logs.sort((a, b) => b.timestamp - a.timestamp).slice(offset, offset + limit);
    } catch {
      return [];
    }
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string, limit = 100): AuditLog[] {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      if (!data) return [];

      const logs: AuditLog[] = JSON.parse(data);
      return logs
        .filter((l) => l.userId === userId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Get logs by action
   */
  getLogsByAction(action: string, limit = 100): AuditLog[] {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      if (!data) return [];

      const logs: AuditLog[] = JSON.parse(data);
      return logs
        .filter((l) => l.action === action)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Get logs by resource
   */
  getLogsByResource(resource: string, resourceId: string, limit = 100): AuditLog[] {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      if (!data) return [];

      const logs: AuditLog[] = JSON.parse(data);
      return logs
        .filter((l) => l.resource === resource && l.resourceId === resourceId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Get logs in date range
   */
  getLogsByDateRange(startDate: number, endDate: number): AuditLog[] {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      if (!data) return [];

      const logs: AuditLog[] = JSON.parse(data);
      return logs
        .filter((l) => l.timestamp >= startDate && l.timestamp <= endDate)
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  getAuditStats(): AuditStats {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      if (!data) {
        return {
          totalLogs: 0,
          logsThisMonth: 0,
          logsThisWeek: 0,
          successRate: 0,
          topActions: [],
          topUsers: [],
        };
      }

      const logs: AuditLog[] = JSON.parse(data);
      const now = Date.now();
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const logsThisMonth = logs.filter((l) => l.timestamp >= monthAgo).length;
      const logsThisWeek = logs.filter((l) => l.timestamp >= weekAgo).length;

      const successCount = logs.filter((l) => l.status === 'success').length;
      const successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

      // Top actions
      const actionMap = new Map<string, number>();
      logs.forEach((l) => {
        actionMap.set(l.action, (actionMap.get(l.action) || 0) + 1);
      });

      const topActions = Array.from(actionMap.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top users
      const userMap = new Map<string, number>();
      logs.forEach((l) => {
        userMap.set(l.userId, (userMap.get(l.userId) || 0) + 1);
      });

      const topUsers = Array.from(userMap.entries())
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalLogs: logs.length,
        logsThisMonth,
        logsThisWeek,
        successRate: Math.round(successRate * 100) / 100,
        topActions,
        topUsers,
      };
    } catch {
      return {
        totalLogs: 0,
        logsThisMonth: 0,
        logsThisWeek: 0,
        successRate: 0,
        topActions: [],
        topUsers: [],
      };
    }
  }

  /**
   * Export audit logs
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getAllLogs();

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = ['ID', 'User ID', 'Action', 'Resource', 'Status', 'Timestamp'];
    const rows = logs.map((l) => [
      l.id,
      l.userId,
      l.action,
      l.resource,
      l.status,
      new Date(l.timestamp).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }

  /**
   * Clean up old logs
   */
  cleanupOldLogs(daysOld = this.RETENTION_DAYS): number {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      if (!data) return 0;

      const logs: AuditLog[] = JSON.parse(data);
      const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
      const filtered = logs.filter((l) => l.timestamp > cutoffTime);

      const removed = logs.length - filtered.length;
      localStorage.setItem(this.AUDIT_LOGS_KEY, JSON.stringify(filtered));

      return removed;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all logs
   */
  clearAllLogs(): boolean {
    try {
      localStorage.removeItem(this.AUDIT_LOGS_KEY);
      return true;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private saveLog(log: AuditLog): void {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      const logs: AuditLog[] = data ? JSON.parse(data) : [];

      logs.push(log);

      // Keep only MAX_LOGS
      if (logs.length > this.MAX_LOGS) {
        logs.shift();
      }

      localStorage.setItem(this.AUDIT_LOGS_KEY, JSON.stringify(logs));
    } catch {
      console.error('Failed to save audit log');
    }
  }

  private getAllLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(this.AUDIT_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getClientIP(): string {
    // In real implementation, this would be obtained from server
    return 'unknown';
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const auditService = new AuditService();
