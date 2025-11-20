/**
 * Leaderboard Service
 * Manages leaderboards, rankings, and achievements
 */

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  rank: number;
  score: number;
  badge?: string;
  lastUpdated: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'contributors' | 'reviews' | 'bookmarks' | 'weekly';
  entries: LeaderboardEntry[];
  period: 'all-time' | 'monthly' | 'weekly';
  lastUpdated: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  points: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: number;
  progress: number; // 0-100
}

class LeaderboardService {
  private readonly LEADERBOARDS_KEY = 'wow_class_helper_leaderboards';
  private readonly ACHIEVEMENTS_KEY = 'wow_class_helper_achievements';
  private readonly USER_ACHIEVEMENTS_KEY = 'wow_class_helper_user_achievements';

  // Predefined achievements
  private readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_comment',
      name: 'First Comment',
      description: 'Post your first comment',
      icon: '💬',
      unlockCondition: 'comments >= 1',
      points: 10,
    },
    {
      id: 'helpful_reviewer',
      name: 'Helpful Reviewer',
      description: 'Get 10 helpful votes on reviews',
      icon: '👍',
      unlockCondition: 'helpfulReviews >= 10',
      points: 50,
    },
    {
      id: 'community_leader',
      name: 'Community Leader',
      description: 'Get 100 followers',
      icon: '👑',
      unlockCondition: 'followers >= 100',
      points: 100,
    },
    {
      id: 'guide_master',
      name: 'Guide Master',
      description: 'Bookmark 50 guides',
      icon: '📚',
      unlockCondition: 'bookmarks >= 50',
      points: 75,
    },
    {
      id: 'streak_warrior',
      name: 'Streak Warrior',
      description: 'Maintain a 7-day contribution streak',
      icon: '🔥',
      unlockCondition: 'streak >= 7',
      points: 60,
    },
    {
      id: 'rating_expert',
      name: 'Rating Expert',
      description: 'Rate 100 guides',
      icon: '⭐',
      unlockCondition: 'ratings >= 100',
      points: 40,
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Follow 50 users',
      icon: '🦋',
      unlockCondition: 'following >= 50',
      points: 45,
    },
    {
      id: 'verified_contributor',
      name: 'Verified Contributor',
      description: 'Become a verified community member',
      icon: '✓',
      unlockCondition: 'verified = true',
      points: 200,
    },
  ];

  /**
   * Get or create leaderboard
   */
  getLeaderboard(type: 'contributors' | 'reviews' | 'bookmarks' | 'weekly'): Leaderboard {
    try {
      const data = localStorage.getItem(this.LEADERBOARDS_KEY);
      if (!data) {
        return this.createLeaderboard(type);
      }

      const leaderboards: Leaderboard[] = JSON.parse(data);
      let leaderboard = leaderboards.find((l) => l.type === type);

      if (!leaderboard) {
        leaderboard = this.createLeaderboard(type);
        leaderboards.push(leaderboard);
        localStorage.setItem(this.LEADERBOARDS_KEY, JSON.stringify(leaderboards));
      }

      return leaderboard;
    } catch {
      return this.createLeaderboard(type);
    }
  }

  /**
   * Update leaderboard entry
   */
  updateLeaderboardEntry(
    type: 'contributors' | 'reviews' | 'bookmarks' | 'weekly',
    userId: string,
    userName: string,
    score: number,
    badge?: string
  ): void {
    try {
      const data = localStorage.getItem(this.LEADERBOARDS_KEY);
      const leaderboards: Leaderboard[] = data ? JSON.parse(data) : [];

      let leaderboard = leaderboards.find((l) => l.type === type);
      if (!leaderboard) {
        leaderboard = this.createLeaderboard(type);
        leaderboards.push(leaderboard);
      }

      // Update or add entry
      const existingIndex = leaderboard.entries.findIndex((e) => e.userId === userId);
      const entry: LeaderboardEntry = {
        userId,
        userName,
        rank: 0,
        score,
        badge,
        lastUpdated: Date.now(),
      };

      if (existingIndex >= 0) {
        leaderboard.entries[existingIndex] = entry;
      } else {
        leaderboard.entries.push(entry);
      }

      // Sort and update ranks
      leaderboard.entries.sort((a, b) => b.score - a.score);
      leaderboard.entries.forEach((e, idx) => {
        e.rank = idx + 1;
      });

      leaderboard.lastUpdated = Date.now();

      localStorage.setItem(this.LEADERBOARDS_KEY, JSON.stringify(leaderboards));
    } catch {
      console.error('Failed to update leaderboard entry');
    }
  }

  /**
   * Get top contributors
   */
  getTopContributors(limit = 10): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard('contributors');
    return leaderboard.entries.slice(0, limit);
  }

  /**
   * Get top reviewers
   */
  getTopReviewers(limit = 10): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard('reviews');
    return leaderboard.entries.slice(0, limit);
  }

  /**
   * Get top bookmarkers
   */
  getTopBookmarkers(limit = 10): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard('bookmarks');
    return leaderboard.entries.slice(0, limit);
  }

  /**
   * Get weekly leaderboard
   */
  getWeeklyLeaderboard(limit = 10): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard('weekly');
    return leaderboard.entries.slice(0, limit);
  }

  /**
   * Get user rank
   */
  getUserRank(type: 'contributors' | 'reviews' | 'bookmarks' | 'weekly', userId: string): number {
    const leaderboard = this.getLeaderboard(type);
    const entry = leaderboard.entries.find((e) => e.userId === userId);
    return entry?.rank || 0;
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return this.ACHIEVEMENTS;
  }

  /**
   * Get achievement by ID
   */
  getAchievement(achievementId: string): Achievement | undefined {
    return this.ACHIEVEMENTS.find((a) => a.id === achievementId);
  }

  /**
   * Unlock achievement for user
   */
  unlockAchievement(userId: string, achievementId: string): boolean {
    try {
      const data = localStorage.getItem(this.USER_ACHIEVEMENTS_KEY);
      const userAchievements: UserAchievement[] = data ? JSON.parse(data) : [];

      // Check if already unlocked
      if (userAchievements.some((ua) => ua.userId === userId && ua.achievementId === achievementId)) {
        return true;
      }

      userAchievements.push({
        userId,
        achievementId,
        unlockedAt: Date.now(),
        progress: 100,
      });

      localStorage.setItem(this.USER_ACHIEVEMENTS_KEY, JSON.stringify(userAchievements));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update achievement progress
   */
  updateAchievementProgress(userId: string, achievementId: string, progress: number): boolean {
    try {
      const data = localStorage.getItem(this.USER_ACHIEVEMENTS_KEY);
      const userAchievements: UserAchievement[] = data ? JSON.parse(data) : [];

      const existing = userAchievements.find(
        (ua) => ua.userId === userId && ua.achievementId === achievementId
      );

      if (existing) {
        existing.progress = Math.min(progress, 100);
      } else {
        userAchievements.push({
          userId,
          achievementId,
          unlockedAt: 0,
          progress: Math.min(progress, 100),
        });
      }

      localStorage.setItem(this.USER_ACHIEVEMENTS_KEY, JSON.stringify(userAchievements));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user achievements
   */
  getUserAchievements(userId: string): UserAchievement[] {
    try {
      const data = localStorage.getItem(this.USER_ACHIEVEMENTS_KEY);
      if (!data) return [];

      const userAchievements: UserAchievement[] = JSON.parse(data);
      return userAchievements.filter((ua) => ua.userId === userId);
    } catch {
      return [];
    }
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(userId: string): Achievement[] {
    const userAchievements = this.getUserAchievements(userId);
    const unlockedIds = userAchievements
      .filter((ua) => ua.progress === 100)
      .map((ua) => ua.achievementId);

    return this.ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id));
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(userId: string, achievementId: string): number {
    const userAchievements = this.getUserAchievements(userId);
    const achievement = userAchievements.find((ua) => ua.achievementId === achievementId);
    return achievement?.progress || 0;
  }

  /**
   * Calculate total achievement points
   */
  getTotalAchievementPoints(userId: string): number {
    const unlockedAchievements = this.getUnlockedAchievements(userId);
    return unlockedAchievements.reduce((total, a) => total + a.points, 0);
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats(userId: string): {
    total: number;
    unlocked: number;
    progress: number;
    points: number;
  } {
    const userAchievements = this.getUserAchievements(userId);
    const unlocked = userAchievements.filter((ua) => ua.progress === 100).length;
    const totalProgress = userAchievements.reduce((sum, ua) => sum + ua.progress, 0);
    const avgProgress = this.ACHIEVEMENTS.length > 0 ? totalProgress / this.ACHIEVEMENTS.length : 0;
    const points = this.getTotalAchievementPoints(userId);

    return {
      total: this.ACHIEVEMENTS.length,
      unlocked,
      progress: Math.round(avgProgress),
      points,
    };
  }

  /**
   * Reset weekly leaderboard
   */
  resetWeeklyLeaderboard(): void {
    try {
      const data = localStorage.getItem(this.LEADERBOARDS_KEY);
      if (!data) return;

      const leaderboards: Leaderboard[] = JSON.parse(data);
      const weeklyIndex = leaderboards.findIndex((l) => l.type === 'weekly');

      if (weeklyIndex >= 0) {
        leaderboards[weeklyIndex] = this.createLeaderboard('weekly');
        localStorage.setItem(this.LEADERBOARDS_KEY, JSON.stringify(leaderboards));
      }
    } catch {
      console.error('Failed to reset weekly leaderboard');
    }
  }

  // Private helper methods

  private createLeaderboard(type: 'contributors' | 'reviews' | 'bookmarks' | 'weekly'): Leaderboard {
    const periodMap = {
      contributors: 'all-time' as const,
      reviews: 'all-time' as const,
      bookmarks: 'all-time' as const,
      weekly: 'weekly' as const,
    };

    return {
      id: `leaderboard_${type}_${Date.now()}`,
      name: this.getLeaderboardName(type),
      type,
      entries: [],
      period: periodMap[type],
      lastUpdated: Date.now(),
    };
  }

  private getLeaderboardName(type: string): string {
    const names: Record<string, string> = {
      contributors: 'Top Contributors',
      reviews: 'Top Reviewers',
      bookmarks: 'Most Bookmarked',
      weekly: 'Weekly Leaders',
    };
    return names[type] || 'Leaderboard';
  }
}

export const leaderboardService = new LeaderboardService();
