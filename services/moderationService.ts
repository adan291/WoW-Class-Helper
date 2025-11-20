/**
 * Content Moderation Service
 * Manages content moderation and user bans
 */

export interface ContentReport {
  id: string;
  contentId: string;
  contentType: 'guide' | 'comment' | 'review' | 'profile';
  reportedBy: string;
  reason: 'spam' | 'offensive' | 'inappropriate' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface UserBan {
  id: string;
  userId: string;
  reason: string;
  bannedAt: number;
  bannedBy: string;
  expiresAt?: number; // null for permanent
  isActive: boolean;
}

class ModerationService {
  private readonly REPORTS_KEY = 'wow_class_helper_content_reports';
  private readonly BANS_KEY = 'wow_class_helper_user_bans';

  /**
   * Report content
   */
  reportContent(
    contentId: string,
    contentType: ContentReport['contentType'],
    reportedBy: string,
    reason: ContentReport['reason'],
    description: string
  ): ContentReport {
    const report: ContentReport = {
      id: this.generateId(),
      contentId,
      contentType,
      reportedBy,
      reason,
      description,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.saveReport(report);
    return report;
  }

  /**
   * Get all reports
   */
  getAllReports(): ContentReport[] {
    try {
      const data = localStorage.getItem(this.REPORTS_KEY);
      if (!data) return [];

      const reports: ContentReport[] = JSON.parse(data);
      return reports.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }

  /**
   * Get pending reports
   */
  getPendingReports(): ContentReport[] {
    return this.getAllReports().filter((r) => r.status === 'pending');
  }

  /**
   * Approve report
   */
  approveReport(reportId: string, resolvedBy: string): boolean {
    return this.updateReportStatus(reportId, 'approved', resolvedBy);
  }

  /**
   * Reject report
   */
  rejectReport(reportId: string, resolvedBy: string): boolean {
    return this.updateReportStatus(reportId, 'rejected', resolvedBy);
  }

  /**
   * Ban user
   */
  banUser(
    userId: string,
    reason: string,
    bannedBy: string,
    durationDays?: number
  ): UserBan {
    const ban: UserBan = {
      id: this.generateId(),
      userId,
      reason,
      bannedAt: Date.now(),
      bannedBy,
      expiresAt: durationDays ? Date.now() + durationDays * 24 * 60 * 60 * 1000 : undefined,
      isActive: true,
    };

    this.saveBan(ban);
    return ban;
  }

  /**
   * Unban user
   */
  unbanUser(userId: string): boolean {
    try {
      const data = localStorage.getItem(this.BANS_KEY);
      if (!data) return false;

      const bans: UserBan[] = JSON.parse(data);
      const ban = bans.find((b) => b.userId === userId && b.isActive);

      if (!ban) return false;

      ban.isActive = false;
      localStorage.setItem(this.BANS_KEY, JSON.stringify(bans));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is banned
   */
  isUserBanned(userId: string): boolean {
    try {
      const data = localStorage.getItem(this.BANS_KEY);
      if (!data) return false;

      const bans: UserBan[] = JSON.parse(data);
      const ban = bans.find((b) => b.userId === userId && b.isActive);

      if (!ban) return false;

      // Check if ban has expired
      if (ban.expiresAt && ban.expiresAt < Date.now()) {
        ban.isActive = false;
        localStorage.setItem(this.BANS_KEY, JSON.stringify(bans));
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user ban
   */
  getUserBan(userId: string): UserBan | null {
    try {
      const data = localStorage.getItem(this.BANS_KEY);
      if (!data) return null;

      const bans: UserBan[] = JSON.parse(data);
      return bans.find((b) => b.userId === userId && b.isActive) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get all bans
   */
  getAllBans(): UserBan[] {
    try {
      const data = localStorage.getItem(this.BANS_KEY);
      if (!data) return [];

      const bans: UserBan[] = JSON.parse(data);
      return bans.filter((b) => b.isActive).sort((a, b) => b.bannedAt - a.bannedAt);
    } catch {
      return [];
    }
  }

  /**
   * Get moderation statistics
   */
  getModerationStats(): {
    totalReports: number;
    pendingReports: number;
    approvedReports: number;
    rejectedReports: number;
    activeBans: number;
    reportsByReason: Record<string, number>;
  } {
    const reports = this.getAllReports();
    const bans = this.getAllBans();

    const reportsByReason: Record<string, number> = {};
    reports.forEach((r) => {
      reportsByReason[r.reason] = (reportsByReason[r.reason] || 0) + 1;
    });

    return {
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === 'pending').length,
      approvedReports: reports.filter((r) => r.status === 'approved').length,
      rejectedReports: reports.filter((r) => r.status === 'rejected').length,
      activeBans: bans.length,
      reportsByReason,
    };
  }

  /**
   * Export moderation data
   */
  exportModerationData(): string {
    return JSON.stringify(
      {
        reports: this.getAllReports(),
        bans: this.getAllBans(),
        stats: this.getModerationStats(),
      },
      null,
      2
    );
  }

  // Private helper methods

  private updateReportStatus(
    reportId: string,
    status: ContentReport['status'],
    resolvedBy: string
  ): boolean {
    try {
      const data = localStorage.getItem(this.REPORTS_KEY);
      if (!data) return false;

      const reports: ContentReport[] = JSON.parse(data);
      const report = reports.find((r) => r.id === reportId);

      if (!report) return false;

      report.status = status;
      report.resolvedAt = Date.now();
      report.resolvedBy = resolvedBy;

      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
      return true;
    } catch {
      return false;
    }
  }

  private saveReport(report: ContentReport): void {
    try {
      const data = localStorage.getItem(this.REPORTS_KEY);
      const reports: ContentReport[] = data ? JSON.parse(data) : [];
      reports.push(report);
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    } catch {
      console.error('Failed to save report');
    }
  }

  private saveBan(ban: UserBan): void {
    try {
      const data = localStorage.getItem(this.BANS_KEY);
      const bans: UserBan[] = data ? JSON.parse(data) : [];
      bans.push(ban);
      localStorage.setItem(this.BANS_KEY, JSON.stringify(bans));
    } catch {
      console.error('Failed to save ban');
    }
  }

  private generateId(): string {
    return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const moderationService = new ModerationService();
