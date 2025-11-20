/**
 * Profile Service
 * Manages user profiles and contribution history
 */

export interface UserProfile {
  userId: string;
  userName: string;
  email?: string;
  bio?: string;
  avatar?: string;
  joinedAt: number;
  lastActive: number;
  stats: {
    comments: number;
    reviews: number;
    bookmarks: number;
    followers: number;
    following: number;
  };
  favoriteClasses: string[];
  publicBookmarks: string[];
  badges: string[];
  verified: boolean;
}

export interface UserStats {
  userId: string;
  totalComments: number;
  totalReviews: number;
  totalBookmarks: number;
  averageRating: number;
  helpfulReviews: number;
  contributionStreak: number;
  lastContributionDate: number;
}

export interface FollowRelation {
  followerId: string;
  followingId: string;
  followedAt: number;
}

class ProfileService {
  private readonly PROFILES_KEY = 'wow_class_helper_profiles';
  private readonly FOLLOWS_KEY = 'wow_class_helper_follows';
  private readonly STATS_KEY = 'wow_class_helper_user_stats';

  /**
   * Create or get user profile
   */
  getOrCreateProfile(userId: string, userName: string): UserProfile {
    let profile = this.getProfile(userId);

    if (!profile) {
      profile = {
        userId,
        userName,
        joinedAt: Date.now(),
        lastActive: Date.now(),
        stats: {
          comments: 0,
          reviews: 0,
          bookmarks: 0,
          followers: 0,
          following: 0,
        },
        favoriteClasses: [],
        publicBookmarks: [],
        badges: [],
        verified: false,
      };
      this.saveProfile(profile);
    }

    return profile;
  }

  /**
   * Get user profile
   */
  getProfile(userId: string): UserProfile | null {
    try {
      const data = localStorage.getItem(this.PROFILES_KEY);
      if (!data) return null;

      const profiles: UserProfile[] = JSON.parse(data);
      return profiles.find((p) => p.userId === userId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    try {
      const profile = this.getProfile(userId);
      if (!profile) return null;

      const updated = {
        ...profile,
        ...updates,
        userId, // Ensure userId doesn't change
        lastActive: Date.now(),
      };

      const data = localStorage.getItem(this.PROFILES_KEY);
      const profiles: UserProfile[] = data ? JSON.parse(data) : [];
      const index = profiles.findIndex((p) => p.userId === userId);

      if (index >= 0) {
        profiles[index] = updated;
      } else {
        profiles.push(updated);
      }

      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
      return updated;
    } catch {
      return null;
    }
  }

  /**
   * Update user bio
   */
  updateBio(userId: string, bio: string): boolean {
    return this.updateProfile(userId, { bio: bio.substring(0, 500) }) !== null;
  }

  /**
   * Update favorite classes
   */
  addFavoriteClass(userId: string, className: string): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    if (!profile.favoriteClasses.includes(className)) {
      profile.favoriteClasses.push(className);
      return this.updateProfile(userId, { favoriteClasses: profile.favoriteClasses }) !== null;
    }

    return true;
  }

  /**
   * Remove favorite class
   */
  removeFavoriteClass(userId: string, className: string): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    profile.favoriteClasses = profile.favoriteClasses.filter((c) => c !== className);
    return this.updateProfile(userId, { favoriteClasses: profile.favoriteClasses }) !== null;
  }

  /**
   * Add public bookmark
   */
  addPublicBookmark(userId: string, bookmarkId: string): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    if (!profile.publicBookmarks.includes(bookmarkId)) {
      profile.publicBookmarks.push(bookmarkId);
      return this.updateProfile(userId, { publicBookmarks: profile.publicBookmarks }) !== null;
    }

    return true;
  }

  /**
   * Remove public bookmark
   */
  removePublicBookmark(userId: string, bookmarkId: string): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    profile.publicBookmarks = profile.publicBookmarks.filter((b) => b !== bookmarkId);
    return this.updateProfile(userId, { publicBookmarks: profile.publicBookmarks }) !== null;
  }

  /**
   * Add badge to user
   */
  addBadge(userId: string, badge: string): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    if (!profile.badges.includes(badge)) {
      profile.badges.push(badge);
      return this.updateProfile(userId, { badges: profile.badges }) !== null;
    }

    return true;
  }

  /**
   * Follow a user
   */
  followUser(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false;

    try {
      const data = localStorage.getItem(this.FOLLOWS_KEY);
      const follows: FollowRelation[] = data ? JSON.parse(data) : [];

      // Check if already following
      if (follows.some((f) => f.followerId === followerId && f.followingId === followingId)) {
        return true;
      }

      follows.push({
        followerId,
        followingId,
        followedAt: Date.now(),
      });

      localStorage.setItem(this.FOLLOWS_KEY, JSON.stringify(follows));

      // Update stats
      this.updateFollowStats(followerId, followingId);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unfollow a user
   */
  unfollowUser(followerId: string, followingId: string): boolean {
    try {
      const data = localStorage.getItem(this.FOLLOWS_KEY);
      if (!data) return true;

      const follows: FollowRelation[] = JSON.parse(data);
      const filtered = follows.filter(
        (f) => !(f.followerId === followerId && f.followingId === followingId)
      );

      localStorage.setItem(this.FOLLOWS_KEY, JSON.stringify(filtered));

      // Update stats
      this.updateFollowStats(followerId, followingId, false);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is following another user
   */
  isFollowing(followerId: string, followingId: string): boolean {
    try {
      const data = localStorage.getItem(this.FOLLOWS_KEY);
      if (!data) return false;

      const follows: FollowRelation[] = JSON.parse(data);
      return follows.some((f) => f.followerId === followerId && f.followingId === followingId);
    } catch {
      return false;
    }
  }

  /**
   * Get followers
   */
  getFollowers(userId: string): UserProfile[] {
    try {
      const data = localStorage.getItem(this.FOLLOWS_KEY);
      if (!data) return [];

      const follows: FollowRelation[] = JSON.parse(data);
      const followerIds = follows
        .filter((f) => f.followingId === userId)
        .map((f) => f.followerId);

      const profilesData = localStorage.getItem(this.PROFILES_KEY);
      if (!profilesData) return [];

      const profiles: UserProfile[] = JSON.parse(profilesData);
      return profiles.filter((p) => followerIds.includes(p.userId));
    } catch {
      return [];
    }
  }

  /**
   * Get following
   */
  getFollowing(userId: string): UserProfile[] {
    try {
      const data = localStorage.getItem(this.FOLLOWS_KEY);
      if (!data) return [];

      const follows: FollowRelation[] = JSON.parse(data);
      const followingIds = follows
        .filter((f) => f.followerId === userId)
        .map((f) => f.followingId);

      const profilesData = localStorage.getItem(this.PROFILES_KEY);
      if (!profilesData) return [];

      const profiles: UserProfile[] = JSON.parse(profilesData);
      return profiles.filter((p) => followingIds.includes(p.userId));
    } catch {
      return [];
    }
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): UserStats {
    try {
      const data = localStorage.getItem(this.STATS_KEY);
      if (!data) {
        return this.createDefaultStats(userId);
      }

      const stats: UserStats[] = JSON.parse(data);
      return stats.find((s) => s.userId === userId) || this.createDefaultStats(userId);
    } catch {
      return this.createDefaultStats(userId);
    }
  }

  /**
   * Update user statistics
   */
  updateUserStats(userId: string, updates: Partial<UserStats>): UserStats {
    try {
      const data = localStorage.getItem(this.STATS_KEY);
      const stats: UserStats[] = data ? JSON.parse(data) : [];

      const index = stats.findIndex((s) => s.userId === userId);
      const updated = {
        ...this.getUserStats(userId),
        ...updates,
        userId,
      };

      if (index >= 0) {
        stats[index] = updated;
      } else {
        stats.push(updated);
      }

      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
      return updated;
    } catch {
      return this.getUserStats(userId);
    }
  }

  /**
   * Search profiles
   */
  searchProfiles(query: string): UserProfile[] {
    try {
      const data = localStorage.getItem(this.PROFILES_KEY);
      if (!data) return [];

      const profiles: UserProfile[] = JSON.parse(data);
      const lowerQuery = query.toLowerCase();

      return profiles.filter(
        (p) =>
          p.userName.toLowerCase().includes(lowerQuery) ||
          p.bio?.toLowerCase().includes(lowerQuery)
      );
    } catch {
      return [];
    }
  }

  /**
   * Get top contributors
   */
  getTopContributors(limit = 10): UserProfile[] {
    try {
      const data = localStorage.getItem(this.PROFILES_KEY);
      if (!data) return [];

      const profiles: UserProfile[] = JSON.parse(data);
      return profiles
        .sort((a, b) => {
          const aTotal = a.stats.comments + a.stats.reviews;
          const bTotal = b.stats.comments + b.stats.reviews;
          return bTotal - aTotal;
        })
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  // Private helper methods

  private saveProfile(profile: UserProfile): void {
    try {
      const data = localStorage.getItem(this.PROFILES_KEY);
      const profiles: UserProfile[] = data ? JSON.parse(data) : [];
      profiles.push(profile);
      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      console.error('Failed to save profile');
    }
  }

  private createDefaultStats(userId: string): UserStats {
    return {
      userId,
      totalComments: 0,
      totalReviews: 0,
      totalBookmarks: 0,
      averageRating: 0,
      helpfulReviews: 0,
      contributionStreak: 0,
      lastContributionDate: 0,
    };
  }

  private updateFollowStats(followerId: string, followingId: string, isFollowing = true): void {
    const followerProfile = this.getProfile(followerId);
    const followingProfile = this.getProfile(followingId);

    if (followerProfile) {
      followerProfile.stats.following += isFollowing ? 1 : -1;
      this.updateProfile(followerId, followerProfile);
    }

    if (followingProfile) {
      followingProfile.stats.followers += isFollowing ? 1 : -1;
      this.updateProfile(followingId, followingProfile);
    }
  }
}

export const profileService = new ProfileService();
