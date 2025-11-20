/**
 * Leaderboard Component
 * Displays rankings and achievements
 */

import React, { useState, useMemo } from 'react';
import { leaderboardService, LeaderboardEntry } from '../services/leaderboardService';

interface LeaderboardProps {
  userId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'contributors' | 'reviews' | 'bookmarks' | 'weekly'>(
    'contributors'
  );
  const [limit, setLimit] = useState(10);

  const entries = useMemo(() => {
    switch (activeTab) {
      case 'contributors':
        return leaderboardService.getTopContributors(limit);
      case 'reviews':
        return leaderboardService.getTopReviewers(limit);
      case 'bookmarks':
        return leaderboardService.getTopBookmarkers(limit);
      case 'weekly':
        return leaderboardService.getWeeklyLeaderboard(limit);
    }
  }, [activeTab, limit]);

  const userRank = useMemo(() => {
    if (!userId) return 0;
    return leaderboardService.getUserRank(activeTab, userId);
  }, [userId, activeTab]);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '•';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-900 to-blue-900 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Leaderboards</h2>
        <p className="text-gray-300 text-sm mt-1">
          Top community members and contributors
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 flex overflow-x-auto">
        {(['contributors', 'reviews', 'bookmarks', 'weekly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'contributors' && '👥 Contributors'}
            {tab === 'reviews' && '⭐ Reviewers'}
            {tab === 'bookmarks' && '📚 Bookmarks'}
            {tab === 'weekly' && '🔥 Weekly'}
          </button>
        ))}
      </div>

      {/* User Rank */}
      {userId && userRank > 0 && (
        <div className="p-4 bg-blue-900 bg-opacity-30 border-b border-gray-700">
          <p className="text-sm text-blue-300">
            Your Rank: <span className="font-bold text-blue-400">#{userRank}</span>
          </p>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="divide-y divide-gray-700">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No entries yet</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.userId}
              className={`p-4 hover:bg-gray-800 transition ${
                entry.userId === userId ? 'bg-blue-900 bg-opacity-20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Rank and Name */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={`text-2xl font-bold w-8 text-center ${getRankColor(entry.rank)}`}>
                    {getMedalEmoji(entry.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{entry.userName}</p>
                      {entry.badge && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-900 text-yellow-200 rounded">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Updated {new Date(entry.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">{entry.score}</p>
                  <p className="text-xs text-gray-400">
                    {activeTab === 'contributors' && 'contributions'}
                    {activeTab === 'reviews' && 'reviews'}
                    {activeTab === 'bookmarks' && 'bookmarks'}
                    {activeTab === 'weekly' && 'points'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {entries.length >= limit && (
        <div className="p-4 text-center border-t border-gray-700">
          <button
            onClick={() => setLimit(limit + 10)}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition text-sm"
          >
            Load More
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 text-center">
        <p>Leaderboards update in real-time</p>
      </div>
    </div>
  );
};

/**
 * Achievement Badge Component
 */
interface AchievementBadgeProps {
  achievementId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievementId,
  size = 'md',
  showLabel = true,
}) => {
  const achievement = leaderboardService.getAchievement(achievementId);

  if (!achievement) return null;

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} rounded-full bg-yellow-900 bg-opacity-30 border-2 border-yellow-600 flex items-center justify-center`}
        title={achievement.description}
      >
        {achievement.icon}
      </div>
      {showLabel && (
        <p className="text-xs text-center text-gray-300 max-w-[80px]">{achievement.name}</p>
      )}
    </div>
  );
};

/**
 * Achievements Panel Component
 */
interface AchievementsPanelProps {
  userId: string;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ userId }) => {
  const achievements = leaderboardService.getAllAchievements();
  const userAchievements = leaderboardService.getUserAchievements(userId);
  const stats = leaderboardService.getAchievementStats(userId);

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some((ua) => ua.achievementId === achievementId && ua.progress === 100);
  };

  const getProgress = (achievementId: string) => {
    const ua = userAchievements.find((u) => u.achievementId === achievementId);
    return ua?.progress || 0;
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-yellow-900 to-orange-900 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Achievements</h2>
        <div className="flex items-center gap-4 mt-2">
          <div>
            <p className="text-sm text-gray-300">
              {stats.unlocked} / {stats.total} Unlocked
            </p>
            <div className="w-32 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all"
                style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-400">{stats.points}</p>
            <p className="text-xs text-gray-400">Points</p>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id);
          const progress = getProgress(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`flex flex-col items-center gap-2 p-3 rounded border transition ${
                unlocked
                  ? 'bg-yellow-900 bg-opacity-20 border-yellow-600'
                  : 'bg-gray-800 border-gray-700 opacity-50'
              }`}
              title={achievement.description}
            >
              <div
                className={`text-3xl ${
                  unlocked ? 'opacity-100' : 'opacity-40 grayscale'
                }`}
              >
                {achievement.icon}
              </div>
              <p className="text-xs text-center text-gray-300 font-semibold">
                {achievement.name}
              </p>
              {!unlocked && progress > 0 && (
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              {unlocked && (
                <p className="text-xs text-yellow-400 font-semibold">+{achievement.points}pts</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 text-center">
        <p>Complete challenges to unlock achievements and earn points</p>
      </div>
    </div>
  );
};
