/**
 * Rating Widget Component
 * Displays and manages guide ratings
 */

import React, { useState, useEffect } from 'react';
import { ratingsService, type RatingStats } from '../services/ratingsService.ts';
import { toastService } from '../services/toastService.ts';

interface RatingWidgetProps {
  classId: string;
  tab: string;
  specId?: string;
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({ classId, tab, specId }) => {
  const [rating, setRating] = useState(0);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    updateStats();
    const unsubscribe = ratingsService.subscribe(updateStats);
    return unsubscribe;
  }, [classId, tab, specId]);

  const updateStats = () => {
    const s = ratingsService.getRatingStats(classId, tab, specId);
    setStats(s);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toastService.warning('Please select a rating');
      return;
    }

    ratingsService.addReview(classId, tab, rating, '', specId);
    setRating(0);
    setShowForm(false);
    toastService.success('Thank you for your rating!');
    updateStats();
  };

  if (!stats) return null;

  return (
    <div className="p-3 bg-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-300">Rating</span>
        <span className="text-lg font-bold text-yellow-400">
          {stats.averageRating.toFixed(1)} ⭐ ({stats.totalRatings})
        </span>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-1 mb-3">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4">{star}★</span>
            <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500"
                style={{
                  width: `${stats.totalRatings > 0 ? (stats.distribution[star] / stats.totalRatings) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right">{stats.distribution[star]}</span>
          </div>
        ))}
      </div>

      {/* Rate Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold rounded transition"
      >
        {showForm ? '✕ Cancel' : '⭐ Rate This'}
      </button>

      {/* Rating Form */}
      {showForm && (
        <div className="mt-3 p-3 bg-gray-800 rounded-lg">
          <div className="flex gap-1 mb-3 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl transition ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-500'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition"
          >
            Submit Rating
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(RatingWidget);
