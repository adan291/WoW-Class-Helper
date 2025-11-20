/**
 * Notification Center Component
 * Displays and manages user notifications
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationService, Notification, NotificationType } from '../services/notificationService';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    notificationService.getUserNotifications(userId)
  );
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  // Subscribe to notification updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  const stats = useMemo(() => notificationService.getStats(userId), [userId]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      notificationService.markAsRead(notificationId);
    },
    []
  );

  const handleMarkAllAsRead = useCallback(() => {
    notificationService.markAllAsRead(userId);
  }, [userId]);

  const handleDelete = useCallback((notificationId: string) => {
    notificationService.deleteNotification(notificationId);
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Clear all notifications?')) {
      notificationService.clearUserNotifications(userId);
    }
  }, [userId]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, string> = {
      comment: '💬',
      reply: '↩️',
      mention: '@',
      like: '👍',
      follow: '👤',
      system: '⚙️',
    };
    return icons[type];
  };

  const getNotificationColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      comment: 'bg-blue-900',
      reply: 'bg-purple-900',
      mention: 'bg-yellow-900',
      like: 'bg-red-900',
      follow: 'bg-green-900',
      system: 'bg-gray-800',
    };
    return colors[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="relative w-full max-w-md h-screen bg-gray-900 border-l border-gray-700 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            {stats.unread > 0 && (
              <p className="text-sm text-gray-400">
                {stats.unread} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-gray-700 space-y-2">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {(['comment', 'reply', 'mention', 'like', 'follow', 'system'] as NotificationType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 text-sm rounded transition ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  title={`${stats.byType[type]} ${type}s`}
                >
                  {getNotificationIcon(type)}
                </button>
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={stats.unread === 0}
              className="flex-1 px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Mark all as read"
            >
              Mark all read
            </button>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
              title="Notification preferences"
            >
              ⚙️
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="px-3 py-1 text-sm bg-red-900 text-red-200 rounded hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Clear all notifications"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <PreferencesPanel userId={userId} onClose={() => setShowPreferences(false)} />
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-lg">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-800 transition cursor-pointer ${
                    !notification.read ? 'bg-gray-800 bg-opacity-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="flex-shrink-0 text-gray-500 hover:text-red-400 transition"
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 text-xs text-gray-500 text-center">
          {notifications.length} total notifications
        </div>
      </div>
    </div>
  );
};

/**
 * Preferences Panel Component
 */
interface PreferencesPanelProps {
  userId: string;
  onClose: () => void;
}

const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ userId, onClose }) => {
  const [prefs, setPrefs] = useState(() => notificationService.getPreferences(userId));

  const handleChannelChange = useCallback(
    (channel: 'inApp' | 'email' | 'push', value: boolean) => {
      const updated = {
        ...prefs,
        channels: { ...prefs.channels, [channel]: value },
      };
      setPrefs(updated);
      notificationService.updatePreferences(userId, updated);
    },
    [prefs, userId]
  );

  const handleTypeChange = useCallback(
    (type: NotificationType, value: boolean) => {
      const updated = {
        ...prefs,
        types: { ...prefs.types, [type]: value },
      };
      setPrefs(updated);
      notificationService.updatePreferences(userId, updated);
    },
    [prefs, userId]
  );

  const handleQuietHoursChange = useCallback(
    (enabled: boolean) => {
      const updated = {
        ...prefs,
        quietHours: { ...prefs.quietHours!, enabled },
      };
      setPrefs(updated);
      notificationService.updatePreferences(userId, updated);
    },
    [prefs, userId]
  );

  return (
    <div className="p-4 border-b border-gray-700 space-y-4 bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Preferences</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Channels */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-300">Channels</p>
        {(['inApp', 'email', 'push'] as const).map((channel) => (
          <label key={channel} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.channels[channel]}
              onChange={(e) => handleChannelChange(channel, e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300 capitalize">{channel}</span>
          </label>
        ))}
      </div>

      {/* Types */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-300">Notification Types</p>
        {(['comment', 'reply', 'mention', 'like', 'follow', 'system'] as NotificationType[]).map(
          (type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.types[type]}
                onChange={(e) => handleTypeChange(type, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-300 capitalize">{type}</span>
            </label>
          )
        )}
      </div>

      {/* Quiet Hours */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.quietHours?.enabled || false}
            onChange={(e) => handleQuietHoursChange(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-300">Quiet Hours</span>
        </label>
        {prefs.quietHours?.enabled && (
          <p className="text-xs text-gray-400 ml-6">
            {prefs.quietHours.start}:00 - {prefs.quietHours.end}:00
          </p>
        )}
      </div>
    </div>
  );
};
