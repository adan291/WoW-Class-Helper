/**
 * Recommendation Panel Component
 * Displays AI-powered recommendations
 */

import React, { useState, useEffect } from 'react';
import { recommendationService, type Recommendation } from '../services/recommendationService.ts';

interface RecommendationPanelProps {
  classId?: string;
  tab?: string;
  specId?: string;
  onSelectGuide?: (classId: string, tab: string, specId?: string) => void;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  classId,
  tab,
  specId,
  onSelectGuide,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'related'>('personalized');

  useEffect(() => {
    updateRecommendations();
  }, [classId, tab, specId, activeTab]);

  const updateRecommendations = () => {
    let recs: Recommendation[] = [];

    switch (activeTab) {
      case 'personalized':
        recs = recommendationService.getPersonalizedRecommendations(5);
        break;
      case 'trending':
        recs = recommendationService.getTrendingGuides(5);
        break;
      case 'related':
        if (classId && tab) {
          recs = recommendationService.getRelatedGuides(classId, tab, specId, 5);
        }
        break;
    }

    setRecommendations(recs);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition"
        title="Recommendations"
      >
        💡
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">💡 Recommendations</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-600">
              <button
                onClick={() => setActiveTab('personalized')}
                className={`px-3 py-2 text-xs font-medium transition ${
                  activeTab === 'personalized'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                👤 For You
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-3 py-2 text-xs font-medium transition ${
                  activeTab === 'trending'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🔥 Trending
              </button>
              {classId && tab && (
                <button
                  onClick={() => setActiveTab('related')}
                  className={`px-3 py-2 text-xs font-medium transition ${
                    activeTab === 'related'
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  🔗 Related
                </button>
              )}
            </div>

            {/* Recommendations List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectGuide?.(rec.classId, rec.tab, rec.specId);
                      setIsOpen(false);
                    }}
                    className="w-full p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-200">{rec.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                      </div>
                      <div className="ml-2 px-2 py-1 bg-gray-800 rounded text-xs font-bold text-yellow-400">
                        {rec.score}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No recommendations available</p>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(RecommendationPanel);
