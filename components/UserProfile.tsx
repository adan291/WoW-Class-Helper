/**
 * User Profile Component
 * Displays user profile information and contribution history
 */

import React, { useState, useCallback, useMemo } from 'react';
import { profileService, UserProfile } from '../services/profileService';

interface UserProfileProps {
  userId: string;
  currentUserId?: string;
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  currentUserId,
  onClose,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    profileService.getProfile(userId)
  );
  const [isFollowing, setIsFollowing] = useState(() =>
    currentUserId ? profileService.isFollowing(currentUserId, userId) : false
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'followers'>('overview');

  const stats = useMemo(() => profileService.getUserStats(userId), [userId]);
  const followers = useMemo(() => profileService.getFollowers(userId), [userId]);
  const following = useMemo(() => profileService.getFollowing(userId), [userId]);

  const isOwnProfile = currentUserId === userId;

  const handleFollowToggle = useCallback(() => {
    if (!currentUserId) return;

    if (isFollowing) {
      profileService.unfollowUser(currentUserId, userId);
    } else {
      profileService.followUser(currentUserId, userId);
    }

    setIsFollowing(!isFollowing);
  }, [currentUserId, userId, isFollowing]);

  const handleSaveBio = useCallback(() => {
    if (profileService.updateBio(userId, editBio)) {
      const updated = profileService.getProfile(userId);
      if (updated) {
        setProfile(updated);
        setIsEditing(false);
      }
    }
  }, [userId, editBio]);

  if (!profile) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
              {profile.avatar || '👤'}
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{profile.userName}</h1>
                {profile.verified && (
                  <span className="text-blue-400" title="Verified">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm">
                Joined {new Date(profile.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-2 rounded transition ${
                    isFollowing
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Write your bio..."
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{editBio.length}/500</span>
                <button
                  onClick={handleSaveBio}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-200">
              {profile.bio || (isOwnProfile ? 'No bio yet. Click Edit to add one!' : 'No bio')}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-700 bg-gray-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">{profile.stats.comments}</p>
          <p className="text-xs text-gray-400">Comments</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-400">{profile.stats.reviews}</p>
          <p className="text-xs text-gray-400">Reviews</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{profile.stats.followers}</p>
          <p className="text-xs text-gray-400">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">{profile.stats.following}</p>
          <p className="text-xs text-gray-400">Following</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 flex">
        {(['overview', 'bookmarks', 'followers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Badges */}
            {profile.badges.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-2">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Classes */}
            {profile.favoriteClasses.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-2">Favorite Classes</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteClasses.map((className) => (
                    <span
                      key={className}
                      className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm"
                    >
                      {className}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div>
              <h3 className="font-semibold text-white mb-2">Statistics</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p>Average Rating: {stats.averageRating.toFixed(1)} ⭐</p>
                <p>Helpful Reviews: {stats.helpfulReviews}</p>
                <p>Contribution Streak: {stats.contributionStreak} days</p>
                {stats.lastContributionDate > 0 && (
                  <p>
                    Last Contribution:{' '}
                    {new Date(stats.lastContributionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            {profile.publicBookmarks.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-3">
                  {profile.publicBookmarks.length} public bookmarks
                </p>
                {profile.publicBookmarks.map((bookmark) => (
                  <div
                    key={bookmark}
                    className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition"
                  >
                    <p className="text-white text-sm">{bookmark}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No public bookmarks</p>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-4">
            {/* Followers */}
            <div>
              <h3 className="font-semibold text-white mb-2">
                Followers ({followers.length})
              </h3>
              {followers.length > 0 ? (
                <div className="space-y-2">
                  {followers.slice(0, 5).map((follower) => (
                    <div
                      key={follower.userId}
                      className="flex items-center justify-between p-2 bg-gray-800 rounded"
                    >
                      <span className="text-white text-sm">{follower.userName}</span>
                      <span className="text-xs text-gray-400">
                        {follower.stats.comments} comments
                      </span>
                    </div>
                  ))}
                  {followers.length > 5 && (
                    <p className="text-xs text-gray-400 text-center">
                      +{followers.length - 5} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No followers yet</p>
              )}
            </div>

            {/* Following */}
            <div>
              <h3 className="font-semibold text-white mb-2">
                Following ({following.length})
              </h3>
              {following.length > 0 ? (
                <div className="space-y-2">
                  {following.slice(0, 5).map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-2 bg-gray-800 rounded"
                    >
                      <span className="text-white text-sm">{user.userName}</span>
                      <span className="text-xs text-gray-400">
                        {user.stats.comments} comments
                      </span>
                    </div>
                  ))}
                  {following.length > 5 && (
                    <p className="text-xs text-gray-400 text-center">
                      +{following.length - 5} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Not following anyone yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
