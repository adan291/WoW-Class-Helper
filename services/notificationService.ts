/**
 * Notification Service
 * Manages in-app, email, and push notifications
 */

export type NotificationType = 'comment' | 'reply' | 'mention' | 'like' | 'follow' | 'system';
export type NotificationChannel = 'in-app' | 'email' | 'push';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  channels: NotificationChannel[];
  timestamp: number;
  expiresAt?: number;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  types: {
    comment: boolean;
    reply: boolean;
    mention: boolean;
    like: boolean;
    follow: boolean;
    system: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: number; // 0-23
    end: number; // 0-23
  };
}

class NotificationService {
  private readonly NOTIFICATIONS_KEY = 'wow_class_helper_notifications';
  private readonly PREFERENCES_KEY = 'wow_class_helper_notification_prefs';
  private readonly MAX_NOTIFICATIONS = 100;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  /**
   * Create and send a notification
   */
  sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    channels: NotificationChannel[] = ['in-app']
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      userId,
      type,
      title,
      message,
      data,
      read: false,
      channels,
      timestamp: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    // Check preferences
    const prefs = this.getPreferences(userId);
    if (!this.shouldSendNotification(type, prefs)) {
      return notification;
    }

    // Save notification
    this.saveNotification(notification);

    // Send through channels
    this.sendThroughChannels(notification, prefs);

    // Notify listeners
    this.notifyListeners(userId);

    return notification;
  }

  /**
   * Get all notifications for a user
   */
  getUserNotifications(userId: string, unreadOnly = false): Notification[] {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!data) return [];

      const notifications: Notification[] = JSON.parse(data);
      let filtered = notifications.filter((n) => n.userId === userId);

      if (unreadOnly) {
        filtered = filtered.filter((n) => !n.read);
      }

      // Remove expired notifications
      filtered = filtered.filter((n) => !n.expiresAt || n.expiresAt > Date.now());

      return filtered.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!data) return false;

      const notifications: Notification[] = JSON.parse(data);
      const notification = notifications.find((n) => n.id === notificationId);

      if (!notification) return false;

      notification.read = true;
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));

      this.notifyListeners(notification.userId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): boolean {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!data) return false;

      const notifications: Notification[] = JSON.parse(data);
      notifications.forEach((n) => {
        if (n.userId === userId) {
          n.read = true;
        }
      });

      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
      this.notifyListeners(userId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): boolean {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!data) return false;

      const notifications: Notification[] = JSON.parse(data);
      const notification = notifications.find((n) => n.id === notificationId);
      const filtered = notifications.filter((n) => n.id !== notificationId);

      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(filtered));

      if (notification) {
        this.notifyListeners(notification.userId);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all notifications for a user
   */
  clearUserNotifications(userId: string): boolean {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!data) return true;

      const notifications: Notification[] = JSON.parse(data);
      const filtered = notifications.filter((n) => n.userId !== userId);

      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(filtered));
      this.notifyListeners(userId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string): number {
    return this.getUserNotifications(userId, true).length;
  }

  /**
   * Get notification preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    try {
      const data = localStorage.getItem(this.PREFERENCES_KEY);
      if (!data) {
        return this.getDefaultPreferences(userId);
      }

      const prefs: NotificationPreferences[] = JSON.parse(data);
      return prefs.find((p) => p.userId === userId) || this.getDefaultPreferences(userId);
    } catch {
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update notification preferences
   */
  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): NotificationPreferences {
    try {
      const data = localStorage.getItem(this.PREFERENCES_KEY);
      const prefs: NotificationPreferences[] = data ? JSON.parse(data) : [];

      const index = prefs.findIndex((p) => p.userId === userId);
      const updated = {
        ...this.getPreferences(userId),
        ...preferences,
        userId,
      };

      if (index >= 0) {
        prefs[index] = updated;
      } else {
        prefs.push(updated);
      }

      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(prefs));
      return updated;
    } catch {
      return this.getPreferences(userId);
    }
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get notification statistics
   */
  getStats(userId: string): {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
  } {
    const notifications = this.getUserNotifications(userId);
    const unread = notifications.filter((n) => !n.read).length;

    const byType: Record<NotificationType, number> = {
      comment: 0,
      reply: 0,
      mention: 0,
      like: 0,
      follow: 0,
      system: 0,
    };

    notifications.forEach((n) => {
      byType[n.type]++;
    });

    return {
      total: notifications.length,
      unread,
      byType,
    };
  }

  /**
   * Clean up expired notifications
   */
  cleanupExpired(): number {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!data) return 0;

      const notifications: Notification[] = JSON.parse(data);
      const before = notifications.length;
      const filtered = notifications.filter((n) => !n.expiresAt || n.expiresAt > Date.now());

      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(filtered));
      return before - filtered.length;
    } catch {
      return 0;
    }
  }

  // Private helper methods

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      channels: {
        inApp: true,
        email: false,
        push: false,
      },
      types: {
        comment: true,
        reply: true,
        mention: true,
        like: false,
        follow: false,
        system: true,
      },
      quietHours: {
        enabled: false,
        start: 22,
        end: 8,
      },
    };
  }

  private shouldSendNotification(type: NotificationType, prefs: NotificationPreferences): boolean {
    if (!prefs.types[type]) return false;

    // Check quiet hours
    if (prefs.quietHours?.enabled) {
      const now = new Date();
      const hour = now.getHours();
      const { start, end } = prefs.quietHours;

      if (start < end) {
        if (hour >= start && hour < end) return false;
      } else {
        if (hour >= start || hour < end) return false;
      }
    }

    return true;
  }

  private sendThroughChannels(notification: Notification, prefs: NotificationPreferences): void {
    if (prefs.channels.inApp) {
      // In-app notifications are already saved
    }

    if (prefs.channels.email) {
      // TODO: Implement email notifications
      console.log('Email notification:', notification);
    }

    if (prefs.channels.push) {
      // TODO: Implement push notifications
      console.log('Push notification:', notification);
    }
  }

  private saveNotification(notification: Notification): void {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      const notifications: Notification[] = data ? JSON.parse(data) : [];

      notifications.push(notification);

      // Keep only the most recent MAX_NOTIFICATIONS
      if (notifications.length > this.MAX_NOTIFICATIONS) {
        notifications.sort((a, b) => b.timestamp - a.timestamp);
        notifications.splice(this.MAX_NOTIFICATIONS);
      }

      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch {
      console.error('Failed to save notification');
    }
  }

  private notifyListeners(userId: string): void {
    const notifications = this.getUserNotifications(userId);
    this.listeners.forEach((callback) => callback(notifications));
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const notificationService = new NotificationService();
