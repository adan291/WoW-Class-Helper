/**
 * Admin Service
 * Manages admin dashboard and system monitoring
 */

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalGuides: number;
  totalComments: number;
  totalReports: number;
  systemHealth: number; // 0-100
  uptime: number; // in seconds
  lastBackup: number;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: number;
  resolvedAt?: number;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class AdminService {
  private readonly REPORTS_KEY = 'wow_class_helper_reports';
  private readonly LOGS_KEY = 'wow_class_helper_system_logs';
  private readonly STATS_KEY = 'wow_class_helper_system_stats';
  private startTime = Date.now();

  /**
   * Get system statistics
   */
  getSystemStats(): SystemStats {
    return {
      totalUsers: 0, // Would be fetched from database
      activeUsers: 0,
      totalGuides: 0,
      totalComments: 0,
      totalReports: this.getAllReports().length,
      systemHealth: 95,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      lastBackup: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
    };
  }

  /**
   * Create user report
   */
  createReport(
    reportedUserId: string,
    reportedBy: string,
    reason: string,
    description: string
  ): UserReport {
    const report: UserReport = {
      id: this.generateId(),
      reportedUserId,
      reportedBy,
      reason,
      description,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.saveReport(report);
    this.logAction('info', `Report created for user ${reportedUserId}`);

    return report;
  }

  /**
   * Get all reports
   */
  getAllReports(): UserReport[] {
    try {
      const data = localStorage.getItem(this.REPORTS_KEY);
      if (!data) return [];

      const reports: UserReport[] = JSON.parse(data);
      return reports.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }

  /**
   * Get pending reports
   */
  getPendingReports(): UserReport[] {
    return this.getAllReports().filter((r) => r.status === 'pending');
  }

  /**
   * Update report status
   */
  updateReportStatus(reportId: string, status: UserReport['status']): boolean {
    try {
      const data = localStorage.getItem(this.REPORTS_KEY);
      if (!data) return false;

      const reports: UserReport[] = JSON.parse(data);
      const report = reports.find((r) => r.id === reportId);

      if (!report) return false;

      report.status = status;
      if (status === 'resolved' || status === 'dismissed') {
        report.resolvedAt = Date.now();
      }

      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
      this.logAction('info', `Report ${reportId} status updated to ${status}`);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Log action
   */
  logAction(level: SystemLog['level'], message: string, metadata?: Record<string, any>): void {
    const log: SystemLog = {
      id: this.generateId(),
      level,
      message,
      timestamp: Date.now(),
      metadata,
    };

    this.saveLog(log);
  }

  /**
   * Get system logs
   */
  getSystemLogs(limit = 100): SystemLog[] {
    try {
      const data = localStorage.getItem(this.LOGS_KEY);
      if (!data) return [];

      const logs: SystemLog[] = JSON.parse(data);
      return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: SystemLog['level']): SystemLog[] {
    return this.getSystemLogs().filter((l) => l.level === level);
  }

  /**
   * Clear old logs
   */
  clearOldLogs(daysOld = 30): number {
    try {
      const data = localStorage.getItem(this.LOGS_KEY);
      if (!data) return 0;

      const logs: SystemLog[] = JSON.parse(data);
      const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
      const filtered = logs.filter((l) => l.timestamp > cutoffTime);

      const removed = logs.length - filtered.length;
      localStorage.setItem(this.LOGS_KEY, JSON.stringify(filtered));

      return removed;
    } catch {
      return 0;
    }
  }

  /**
   * Get admin statistics
   */
  getAdminStats(): {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    errorLogs: number;
    warningLogs: number;
  } {
    const reports = this.getAllReports();
    const logs = this.getSystemLogs();

    return {
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === 'pending').length,
      resolvedReports: reports.filter((r) => r.status === 'resolved').length,
      errorLogs: logs.filter((l) => l.level === 'error').length,
      warningLogs: logs.filter((l) => l.level === 'warning').length,
    };
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    const logs = this.getSystemLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Export reports
   */
  exportReports(): string {
    const reports = this.getAllReports();
    return JSON.stringify(reports, null, 2);
  }

  /**
   * Perform system backup
   */
  performBackup(): boolean {
    try {
      const backup = {
        timestamp: Date.now(),
        reports: this.getAllReports(),
        logs: this.getSystemLogs(),
        stats: this.getSystemStats(),
      };

      const backupKey = `wow_class_helper_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      this.logAction('info', 'System backup performed');
      return true;
    } catch {
      this.logAction('error', 'System backup failed');
      return false;
    }
  }

  /**
   * Get backups
   */
  getBackups(): Array<{ timestamp: number; key: string }> {
    const backups: Array<{ timestamp: number; key: string }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wow_class_helper_backup_')) {
        const timestamp = parseInt(key.replace('wow_class_helper_backup_', ''));
        backups.push({ timestamp, key });
      }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Private helper methods

  private saveReport(report: UserReport): void {
    try {
      const data = localStorage.getItem(this.REPORTS_KEY);
      const reports: UserReport[] = data ? JSON.parse(data) : [];
      reports.push(report);
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    } catch {
      console.error('Failed to save report');
    }
  }

  private saveLog(log: SystemLog): void {
    try {
      const data = localStorage.getItem(this.LOGS_KEY);
      const logs: SystemLog[] = data ? JSON.parse(data) : [];
      logs.push(log);

      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.shift();
      }

      localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
    } catch {
      console.error('Failed to save log');
    }
  }

  private generateId(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const adminService = new AdminService();
