/**
 * Quick Access Bar Component
 * Shows favorites and recent guides
 */

import React, { useState, useEffect } from 'react';
import { favoritesService, type Favorite, type RecentGuide } from '../services/favoritesService.ts';
import { toastService } from '../services/toastService.ts';

interface QuickAccessBarProps {
  onSelectGuide?: (classId: string, tab: string, specId?: string) => void;
}

export const QuickAccessBar: React.FC<QuickAccessBarProps> = ({ onSelectGuide }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recent, setRecent] = useState<RecentGuide[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>('favorites');

  useEffect(() => {
    const updateData = () => {
      setFavorites(favoritesService.getFavorites());
      setRecent(favoritesService.getRecent());
    };

    updateData();
    const unsubscribe = favoritesService.subscribe(updateData);
    return unsubscribe;
  }, []);

  const handleSelectGuide = (classId: string, tab: string, specId?: string, title?: string) => {
    favoritesService.recordAccess(classId, tab, title || tab, specId);
    onSelectGuide?.(classId, tab, specId);
    setIsOpen(false);
    toastService.success(`Opened: ${title || tab}`);
  };

  const handleRemoveFavorite = (id: string) => {
    favoritesService.removeFavorite(id);
    toastService.info('Favorite removed');
  };

  const handleClearRecent = () => {
    favoritesService.clearRecent();
    toastService.info('Recent guides cleared');
  };

  const favoriteCount = favorites.length;
  const recentCount = recent.length;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition relative"
        title="Quick Access (Favorites & Recent)"
      >
        ⚡
        {(favoriteCount > 0 || recentCount > 0) && (
          <span className="absolute top-0 right-0 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {favoriteCount + recentCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">⚡ Quick Access</h2>
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
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'favorites'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                ⭐ Favorites ({favoriteCount})
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'recent'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🕐 Recent ({recentCount})
              </button>
            </div>

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {favorites.length > 0 ? (
                  favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex items-center justify-between group"
                    >
                      <button
                        onClick={() => handleSelectGuide(fav.classId, fav.tab, fav.specId, fav.title)}
                        className="flex-1 text-left"
                      >
                        <p className="text-gray-200 font-medium">{fav.title}</p>
                        <p className="text-xs text-gray-400">
                          {fav.classId} • {fav.tab}
                        </p>
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No favorites yet</p>
                )}
              </div>
            )}

            {/* Recent Tab */}
            {activeTab === 'recent' && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recent.length > 0 ? (
                  <>
                    {recent.map((rec, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectGuide(rec.classId, rec.tab, rec.specId, rec.title)}
                        className="w-full p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-left"
                      >
                        <p className="text-gray-200 font-medium">{rec.title}</p>
                        <p className="text-xs text-gray-400">
                          {rec.classId} • {rec.tab} • {rec.accessedAt.toLocaleTimeString()}
                        </p>
                      </button>
                    ))}
                    <button
                      onClick={handleClearRecent}
                      className="w-full mt-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded font-medium transition"
                    >
                      Clear Recent
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400 text-center py-4">No recent guides</p>
                )}
              </div>
            )}

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

export default React.memo(QuickAccessBar);
