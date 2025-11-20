/**
 * Analytics Dashboard Component
 * Displays usage analytics and trends
 */

import React, { useState, useEffect } from 'react';
import { analyticsService, type AnalyticsData } from '../services/analyticsService.ts';
import { toastService } from '../services/toastService.ts';

export const AnalyticsDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const updateAnalytics = () => {
      setAnalytics(analyticsService.getAnalytics());
    };

    updateAnalytics();
    const unsubscribe = analyticsService.subscribe(updateAnalytics);
    return unsubscribe;
  }, []);

  const handleExport = () => {
    const json = analyticsService.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toastService.success('Analytics exported');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all analytics data?')) {
      analyticsService.clear();
      setAnalytics(analyticsService.getAnalytics());
      toastService.info('Analytics cleared');
    }
  };

  if (!analytics) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition"
        title="Analytics"
      >
        📊
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">📊 Analytics Dashboard</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-blue-400">{analytics.totalViews}</p>
              </div>

              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Total Duration</p>
                <p className="text-lg font-bold text-green-400">
                  {formatDuration(analytics.totalDuration)}
                </p>
              </div>

              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Avg Session</p>
                <p className="text-lg font-bold text-purple-400">
                  {formatDuration(analytics.averageSessionDuration)}
                </p>
              </div>

              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Guides Viewed</p>
                <p className="text-2xl font-bold text-orange-400">
                  {analytics.mostViewedGuides.length}
                </p>
              </div>
            </div>

            {/* Most Viewed Guides */}
            {analytics.mostViewedGuides.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-300 mb-2">🔥 Most Viewed Guides</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {analytics.mostViewedGuides.slice(0, 5).map((guide, idx) => (
                    <div key={idx} className="p-2 bg-gray-700 rounded flex justify-between items-center">
                      <span className="text-sm text-gray-200">
                        {guide.classId} - {guide.tab}
                      </span>
                      <span className="text-xs text-yellow-400 font-bold">{guide.viewCount} views</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Classes & Tabs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Popular Classes */}
              {analytics.popularClasses.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-300 mb-2">⚔️ Popular Classes</h3>
                  <div className="space-y-1">
                    {analytics.popularClasses.map((cls, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-300">
                        <span>{cls.classId}</span>
                        <span className="text-blue-400">{cls.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tabs */}
              {analytics.popularTabs.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-300 mb-2">📑 Popular Tabs</h3>
                  <div className="space-y-1">
                    {analytics.popularTabs.map((tab, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-300">
                        <span>{tab.tab}</span>
                        <span className="text-green-400">{tab.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Peak Hours */}
            {analytics.peakHours.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-300 mb-2">⏰ Peak Hours</h3>
                <div className="flex gap-1">
                  {analytics.peakHours.map((hour, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center"
                      title={`${hour.hour}:00 - ${hour.count} views`}
                    >
                      <div
                        className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t"
                        style={{
                          height: `${Math.max(20, (hour.count / Math.max(...analytics.peakHours.map(h => h.count))) * 60)}px`,
                        }}
                      />
                      <span className="text-xs text-gray-400 mt-1">{hour.hour}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
              >
                📥 Export
              </button>
              <button
                onClick={handleClear}
                className="flex-1 px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded font-medium transition"
              >
                🗑️ Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(AnalyticsDashboard);
