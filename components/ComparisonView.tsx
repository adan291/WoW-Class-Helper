/**
 * Comparison View Component
 * Side-by-side content comparison
 */

import React, { useState } from 'react';
import { comparisonService, type ComparisonItem } from '../services/comparisonService.ts';

interface ComparisonViewProps {
  item1: ComparisonItem;
  item2: ComparisonItem;
  onClose?: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ item1, item2, onClose }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const comparison = comparisonService.compare(item1, item2);
  const similarity = comparisonService.calculateSimilarity(item1.content, item2.content);
  const keyPoints1 = comparisonService.extractKeyPoints(item1.content);
  const keyPoints2 = comparisonService.extractKeyPoints(item2.content);

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
      <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-yellow-400">🔄 Content Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Similarity Score */}
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-300">Similarity Score</span>
            <span className="text-lg font-bold text-blue-400">{similarity}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
              style={{ width: `${similarity}%` }}
            />
          </div>
        </div>

        {/* Toggle Analysis */}
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="mb-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition"
        >
          {showAnalysis ? '📊 Hide Analysis' : '📊 Show Analysis'}
        </button>

        {/* Analysis */}
        {showAnalysis && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            {/* Similarities */}
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
              <h3 className="text-sm font-bold text-green-300 mb-2">✓ Similarities</h3>
              <div className="space-y-1">
                {comparison.similarities.slice(0, 5).map((sim, idx) => (
                  <p key={idx} className="text-xs text-green-200">
                    • {sim}
                  </p>
                ))}
              </div>
            </div>

            {/* Differences */}
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
              <h3 className="text-sm font-bold text-red-300 mb-2">✗ Differences</h3>
              <div className="space-y-1">
                {comparison.differences.slice(0, 5).map((diff, idx) => (
                  <p key={idx} className="text-xs text-red-200">
                    • {diff}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Item 1 */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-300 mb-2">
              {item1.title}
            </h3>
            <p className="text-xs text-gray-400 mb-2">
              {item1.classId} • {item1.tab}
            </p>
            <div className="text-xs text-gray-300 max-h-32 overflow-y-auto">
              <p className="whitespace-pre-wrap break-words">
                {item1.content.substring(0, 200)}...
              </p>
            </div>
            {keyPoints1.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p className="text-xs font-bold text-gray-400 mb-1">Key Points:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {keyPoints1.slice(0, 3).map((point, idx) => (
                    <li key={idx}>• {point.substring(0, 40)}...</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Item 2 */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-300 mb-2">
              {item2.title}
            </h3>
            <p className="text-xs text-gray-400 mb-2">
              {item2.classId} • {item2.tab}
            </p>
            <div className="text-xs text-gray-300 max-h-32 overflow-y-auto">
              <p className="whitespace-pre-wrap break-words">
                {item2.content.substring(0, 200)}...
              </p>
            </div>
            {keyPoints2.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p className="text-xs font-bold text-gray-400 mb-1">Key Points:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {keyPoints2.slice(0, 3).map((point, idx) => (
                    <li key={idx}>• {point.substring(0, 40)}...</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default React.memo(ComparisonView);
