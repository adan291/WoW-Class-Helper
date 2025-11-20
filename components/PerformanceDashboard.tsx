/**
 * Performance Dashboard Component
 * Displays performance metrics and analytics
 */

import React, { useState, useEffect } from 'react';
import { performanceMonitorService, type PerformanceStats } from '../services/performanceMonitorService.ts';

export const PerformanceDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>(performanceMonitorService.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(performanceMonitorService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (rate: number) => {
    if (rate >= 95) return 'text-green-400';
    if (rate >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition"
        title="Performance"
      >
        📊
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">Performance Metrics</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Total Requests */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Total Requests</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalRequests}</p>
              </div>

              {/* Success Rate */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Success Rate</p>
                <p className={`text-2xl font-bold ${getHealthColor(stats.successRate)}`}>
                  {stats.successRate}%
                </p>
              </div>

              {/* Avg Response Time */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Avg Response</p>
                <p className="text-2xl font-bold text-purple-400">{stats.averageResponseTime}ms</p>
              </div>

              {/* Uptime */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Uptime</p>
                <p className={`text-2xl font-bold ${getHealthColor(stats.uptime)}`}>
                  {Math.round(stats.uptime)}%
                </p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Min Response:</span>
                <span className="font-mono text-green-400">{stats.minResponseTime}ms</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Max Response:</span>
                <span className="font-mono text-red-400">{stats.maxResponseTime}ms</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Error Rate:</span>
                <span className="font-mono text-orange-400">{stats.errorRate}%</span>
              </div>
            </div>

            {/* Health Indicator */}
            <div className="p-3 bg-gray-700 rounded-lg mb-4">
              <p className="text-xs text-gray-400 mb-2">System Health</p>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    stats.successRate >= 95
                      ? 'bg-green-500'
                      : stats.successRate >= 80
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.successRate}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(PerformanceDashboard);
