/**
 * Curator Dashboard Component
 * 
 * Admin interface for managing class data curators, viewing validation reports,
 * and monitoring data integrity across all classes.
 */

import React, { useState, useEffect } from 'react';
import { useClassOrchestrator } from '../hooks/useClassOrchestrator.ts';

export const CuratorDashboard: React.FC = () => {
  const { healthReport, getHealthReport, isLoading } = useClassOrchestrator({
    autoValidate: true,
  });

  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    // Initial load
    getHealthReport();

    // Set up auto-refresh every hour
    const interval = setInterval(() => {
      getHealthReport();
    }, 3600000);

    return () => clearInterval(interval);
  }, [getHealthReport]);

  if (isLoading && !healthReport) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading curator dashboard...</p>
        </div>
      </div>
    );
  }

  if (!healthReport) {
    return (
      <div className="p-8 bg-red-900/20 border border-red-500 rounded-lg">
        <p className="text-red-400">Failed to load curator dashboard</p>
      </div>
    );
  }

  const systemHealthColor = {
    healthy: 'bg-green-900/20 border-green-500',
    warning: 'bg-yellow-900/20 border-yellow-500',
    critical: 'bg-red-900/20 border-red-500',
  }[healthReport.systemHealth];

  const systemHealthText = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  }[healthReport.systemHealth];

  return (
    <div className="space-y-6 p-6 bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Curator Dashboard</h1>
        <button
          onClick={() => getHealthReport()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* System Health */}
      <div className={`p-4 border rounded-lg ${systemHealthColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">System Health</h2>
            <p className={`text-lg font-bold ${systemHealthText}`}>
              {healthReport.systemHealth.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Last Updated</p>
            <p className="text-white">
              {new Date(healthReport.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Data Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Class Data Quality</p>
          <p className="text-2xl font-bold text-blue-400">
            {healthReport.integrityReport.metrics.classDataQuality.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Spec Data Quality</p>
          <p className="text-2xl font-bold text-blue-400">
            {healthReport.integrityReport.metrics.specDataQuality.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Dungeon Data Quality</p>
          <p className="text-2xl font-bold text-blue-400">
            {healthReport.integrityReport.metrics.dungeonDataQuality.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Overall Quality</p>
          <p className="text-2xl font-bold text-green-400">
            {healthReport.integrityReport.metrics.overallQuality.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Class Status Overview */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Class Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-900/20 border border-green-500 p-3 rounded">
            <p className="text-green-400 font-semibold">
              {healthReport.orchestratorReport.readyClasses} Ready
            </p>
            <p className="text-gray-400 text-sm">Classes ready for Gemini</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded">
            <p className="text-yellow-400 font-semibold">
              {healthReport.orchestratorReport.warningClasses} Warnings
            </p>
            <p className="text-gray-400 text-sm">Classes with issues</p>
          </div>
          <div className="bg-red-900/20 border border-red-500 p-3 rounded">
            <p className="text-red-400 font-semibold">
              {healthReport.orchestratorReport.criticalClasses} Critical
            </p>
            <p className="text-gray-400 text-sm">Classes needing attention</p>
          </div>
        </div>
      </div>

      {/* Class Details */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Class Details</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {healthReport.orchestratorReport.classStatuses.map(status => (
            <button
              key={status.classId}
              onClick={() => setSelectedClass(selectedClass === status.classId ? null : status.classId)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                status.isReadyForGemini
                  ? 'bg-green-900/10 border-green-500/30 hover:bg-green-900/20'
                  : status.curatorStatus.status === 'critical'
                  ? 'bg-red-900/10 border-red-500/30 hover:bg-red-900/20'
                  : 'bg-yellow-900/10 border-yellow-500/30 hover:bg-yellow-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{status.className}</span>
                <span
                  className={`text-sm font-bold ${
                    status.isReadyForGemini
                      ? 'text-green-400'
                      : status.curatorStatus.status === 'critical'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {status.isReadyForGemini ? '✓ Ready' : `⚠ ${status.curatorStatus.status}`}
                </span>
              </div>

              {selectedClass === status.classId && (
                <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                  {status.issues.length > 0 && (
                    <div>
                      <p className="text-red-400 text-sm font-semibold">Issues:</p>
                      <ul className="text-gray-300 text-sm space-y-1 ml-2">
                        {status.issues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {status.recommendations.length > 0 && (
                    <div>
                      <p className="text-blue-400 text-sm font-semibold">Recommendations:</p>
                      <ul className="text-gray-300 text-sm space-y-1 ml-2">
                        {status.recommendations.map((rec, i) => (
                          <li key={i}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {healthReport.overallRecommendations.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {healthReport.overallRecommendations.map((rec, i) => (
              <li key={i} className="text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Patch Information */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Patch Information</h3>
        <div className="space-y-2">
          <p className="text-gray-300">
            <span className="text-gray-400">Current Patch:</span>{' '}
            <span className="font-semibold text-white">{healthReport.patchReport.currentPatch}</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Latest Patch:</span>{' '}
            <span className="font-semibold text-white">{healthReport.patchReport.latestPatch.version}</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Total Patches:</span>{' '}
            <span className="font-semibold text-white">{healthReport.patchReport.totalPatches}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
