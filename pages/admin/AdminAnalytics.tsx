import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.ts';
import { auditService, type AuditLog } from '../../services/auditService.ts';

interface Analytics {
  totalUsers: number;
  totalGuides: number;
  totalFavorites: number;
}

const StatCard: React.FC<{ title: string; value: number; icon: string }> = React.memo(
  ({ title, value, icon }) => (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
);

StatCard.displayName = 'StatCard';

const getActionIcon = (action: string): string => {
  const iconMap: Record<string, string> = {
    login: '🔐',
    logout: '🚪',
    register: '✨',
    role_change: '👑',
    guide_create: '📝',
    guide_delete: '🗑️',
    user_ban: '🚫',
    user_unban: '✅',
    content_moderate: '⚠️',
  };
  return iconMap[action] || '📋';
};

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalGuides: 0,
    totalFavorites: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [analyticsData, logs] = await Promise.all([
          adminService.getAnalytics(),
          auditService.getAllLogs(50),
        ]);

        if (!cancelled) {
          setAnalytics(analyticsData);
          setAuditLogs(logs);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load analytics:', error);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Analytics Dashboard</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Users" value={analytics.totalUsers} icon="👥" />
            <StatCard title="Total Guides" value={analytics.totalGuides} icon="📝" />
            <StatCard title="Total Favorites" value={analytics.totalFavorites} icon="⭐" />
          </div>

          {/* Audit Logs */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {getActionIcon(log.action)}
                    </span>
                    <div>
                      <p className="text-white font-medium">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-400">{log.resource}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
