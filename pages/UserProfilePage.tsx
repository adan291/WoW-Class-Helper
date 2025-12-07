import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { profileService, guideService, favoriteService } from '../services/databaseService.ts';
import { auditService, type AuditLog } from '../services/auditService.ts';
import { WowIcon } from '../components/icons/WowIcon.tsx';
import { LoadingOverlayEnhanced } from '../components/LoadingOverlayEnhanced.tsx';

interface UserGuide {
  id: string;
  class_id: string;
  spec_id: string;
  created_at: string;
}

interface UserFavorite {
  id: string;
  class_id: string;
}

export const UserProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [guides, setGuides] = useState<UserGuide[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guides' | 'favorites' | 'activity'>('guides');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadUserData = async () => {
      setLoading(true);
      try {
        const [guidesData, favoritesData, logsData] = await Promise.all([
          guideService.getUserGuides(user.id),
          favoriteService.getFavorites(user.id),
          auditService.getUserLogs(user.id, 20),
        ]);

        if (!cancelled) {
          setGuides(guidesData);
          setFavorites(favoritesData);
          setAuditLogs(logsData);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load user data:', error);
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const refreshData = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [guidesData, favoritesData, logsData] = await Promise.all([
        guideService.getUserGuides(user.id),
        favoriteService.getFavorites(user.id),
        auditService.getUserLogs(user.id, 20),
      ]);
      setGuides(guidesData);
      setFavorites(favoritesData);
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleDeleteGuide = React.useCallback(
    async (guideId: string) => {
      if (!confirm('Are you sure you want to delete this guide?')) return;
      if (!user) return;
      const success = await guideService.deleteGuide(guideId);
      if (success) {
        await refreshData();
      }
    },
    [user, refreshData]
  );

  const handleRemoveFavorite = React.useCallback(
    async (classId: string) => {
      if (!user) return;
      const success = await favoriteService.removeFavorite(user.id, classId);
      if (success) {
        await refreshData();
      }
    },
    [user, refreshData]
  );

  const handleExportData = React.useCallback(async () => {
    if (!user) return;
    try {
      const data = {
        profile: await profileService.getProfile(user.id),
        guides,
        favorites,
        auditLogs,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wow-helper-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  }, [user, guides, favorites, auditLogs]);

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gray-950 text-gray-200 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')",
      }}
    >
      <div className="min-h-screen bg-[#020617]/90 backdrop-blur-sm">
        <header className="py-4 px-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <WowIcon className="h-10 w-10 text-yellow-400" />
            <h1 className="text-2xl font-bold text-yellow-400">User Profile</h1>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg border border-yellow-500/20 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{user.email}</h2>
                <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                📥 Export Data
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                activeTab === 'guides'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-[0_4px_14px_rgba(255,215,0,0.3)]'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border border-gray-600'
              }`}
            >
              📝 My Guides ({guides.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-[0_4px_14px_rgba(255,215,0,0.3)]'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border border-gray-600'
              }`}
            >
              ⭐ Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-[0_4px_14px_rgba(255,215,0,0.3)]'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border border-gray-600'
              }`}
            >
              📊 Activity
            </button>
          </div>

          {/* Content */}
          <div className="relative min-h-[300px]">
            <LoadingOverlayEnhanced
              isVisible={loading}
              message="Loading profile..."
              subMessage="Fetching your data"
              variant="gold"
              fullScreen={false}
            />
            {!loading && (
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg border border-yellow-500/20 p-6">
                {activeTab === 'guides' && (
                  <div className="space-y-4">
                    {guides.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-4 block">📝</span>
                        <p className="text-gray-300 text-lg">No guides saved yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Your saved guides will appear here
                        </p>
                      </div>
                    ) : (
                      guides.map((guide) => (
                        <div
                          key={guide.id}
                          className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-yellow-400">
                                {guide.class_id} - {guide.spec_id}
                              </h3>
                              <p className="text-sm text-gray-300">
                                {new Date(guide.created_at).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteGuide(guide.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {favorites.length === 0 ? (
                      <div className="text-center py-12 col-span-full">
                        <span className="text-4xl mb-4 block">⭐</span>
                        <p className="text-gray-300 text-lg">No favorites yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Star your favorite classes to see them here
                        </p>
                      </div>
                    ) : (
                      favorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-400 font-bold">{fav.class_id}</span>
                            <button
                              onClick={() => handleRemoveFavorite(fav.class_id)}
                              className="text-red-400 hover:text-red-300 hover:scale-110 transition-all"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-2">
                    {auditLogs.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-4 block">📊</span>
                        <p className="text-gray-300 text-lg">No activity yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Your recent activity will appear here
                        </p>
                      </div>
                    ) : (
                      auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-gray-800/80 rounded-lg p-3 flex justify-between items-center border border-gray-700"
                        >
                          <span className="text-gray-200 font-medium capitalize">
                            {log.action.replace('_', ' ')}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
