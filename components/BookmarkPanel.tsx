/**
 * Bookmark Panel Component
 * Manage bookmarks and collections
 */

import React, { useState, useEffect } from 'react';
import { bookmarkService, type Bookmark, type BookmarkCollection } from '../services/bookmarkService.ts';
import { toastService } from '../services/toastService.ts';

interface BookmarkPanelProps {
  onSelectBookmark?: (bookmark: Bookmark) => void;
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({ onSelectBookmark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'collections'>('bookmarks');
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    const unsubscribe = bookmarkService.subscribe(() => {
      setBookmarks(bookmarkService.getBookmarks());
      setCollections(bookmarkService.getCollections());
    });

    setBookmarks(bookmarkService.getBookmarks());
    setCollections(bookmarkService.getCollections());

    return unsubscribe;
  }, []);

  const handleAddCollection = () => {
    if (!newCollectionName.trim()) {
      toastService.warning('Collection name cannot be empty');
      return;
    }

    bookmarkService.createCollection(newCollectionName);
    setNewCollectionName('');
    toastService.success(`Collection "${newCollectionName}" created`);
  };

  const handleDeleteBookmark = (id: string) => {
    bookmarkService.removeBookmark(id);
    toastService.info('Bookmark removed');
  };

  const handleDeleteCollection = (id: string) => {
    bookmarkService.deleteCollection(id);
    toastService.info('Collection deleted');
  };

  const handleExportCollection = (id: string) => {
    const json = bookmarkService.exportCollection(id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `collection_${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toastService.success('Collection exported');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition relative"
        title="Bookmarks"
      >
        ⭐
        {bookmarks.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {bookmarks.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">Bookmarks & Collections</h2>
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
                onClick={() => setActiveTab('bookmarks')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'bookmarks'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                📌 Bookmarks ({bookmarks.length})
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'collections'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                📁 Collections ({collections.length})
              </button>
            </div>

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bookmarks.length > 0 ? (
                  bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="p-3 bg-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-600 transition"
                    >
                      <button
                        onClick={() => {
                          onSelectBookmark?.(bookmark);
                          setIsOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <p className="text-gray-200 font-medium">{bookmark.title}</p>
                        <p className="text-xs text-gray-400">
                          {bookmark.tab} • {new Date(bookmark.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No bookmarks yet</p>
                )}
              </div>
            )}

            {/* Collections Tab */}
            {activeTab === 'collections' && (
              <div>
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection name..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:border-yellow-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCollection()}
                  />
                  <button
                    onClick={handleAddCollection}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium transition"
                  >
                    ➕
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {collections.length > 0 ? (
                    collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-gray-200 font-medium">{collection.name}</p>
                            <p className="text-xs text-gray-400">
                              {collection.bookmarks.length} bookmarks
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleExportCollection(collection.id)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Export"
                            >
                              📥
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(collection.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No collections yet</p>
                  )}
                </div>
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

export default React.memo(BookmarkPanel);
