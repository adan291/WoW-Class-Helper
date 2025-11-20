/**
 * Collection Builder Component
 * Create and manage guide collections
 */

import React, { useState, useCallback, useMemo } from 'react';
import { collectionsService, Collection } from '../services/collectionsService';

interface CollectionBuilderProps {
  userId: string;
  onCollectionCreated?: (collection: Collection) => void;
}

export const CollectionBuilder: React.FC<CollectionBuilderProps> = ({
  userId,
  onCollectionCreated,
}) => {
  const [collections, setCollections] = useState<Collection[]>(() =>
    collectionsService.getUserCollections(userId)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'public' | 'followed'>('my');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    tags: '',
  });

  const [editFormData, setEditFormData] = useState<Partial<Collection>>({});

  const stats = useMemo(() => collectionsService.getCollectionStats(), []);
  const publicCollections = useMemo(() => collectionsService.getPublicCollections(), []);
  const followedCollections = useMemo(
    () => collectionsService.getFollowedCollections(userId),
    [userId]
  );

  const handleCreateCollection = useCallback(() => {
    if (!formData.name.trim()) return;

    const collection = collectionsService.createCollection(
      formData.name,
      formData.description,
      userId,
      formData.isPublic
    );

    if (formData.tags) {
      const tags = formData.tags.split(',').map((t) => t.trim());
      collectionsService.updateCollection(collection.id, { tags });
    }

    setCollections((prev) => [collection, ...prev]);
    setFormData({ name: '', description: '', isPublic: true, tags: '' });
    setIsCreating(false);

    onCollectionCreated?.(collection);
  }, [formData, userId, onCollectionCreated]);

  const handleUpdateCollection = useCallback(
    (collectionId: string) => {
      const updated = collectionsService.updateCollection(collectionId, editFormData);
      if (updated) {
        setCollections((prev) =>
          prev.map((c) => (c.id === collectionId ? updated : c))
        );
        setEditingId(null);
        setEditFormData({});
      }
    },
    [editFormData]
  );

  const handleDeleteCollection = useCallback((collectionId: string) => {
    if (window.confirm('Delete this collection?')) {
      collectionsService.deleteCollection(collectionId);
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    }
  }, []);

  const handleFollowCollection = useCallback(
    (collectionId: string) => {
      collectionsService.followCollection(userId, collectionId);
    },
    [userId]
  );

  const handleUnfollowCollection = useCallback(
    (collectionId: string) => {
      collectionsService.unfollowCollection(userId, collectionId);
    },
    [userId]
  );

  const displayCollections = useMemo(() => {
    switch (activeTab) {
      case 'my':
        return collections;
      case 'public':
        return publicCollections;
      case 'followed':
        return followedCollections;
    }
  }, [activeTab, collections, publicCollections, followedCollections]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Collections</h2>
            <p className="text-gray-400 text-sm mt-1">
              Create and manage guide collections
            </p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isCreating ? 'Cancel' : '+ New Collection'}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-blue-400">{stats.totalCollections}</p>
            <p className="text-xs text-gray-400">Collections</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-green-400">{stats.totalGuides}</p>
            <p className="text-xs text-gray-400">Total Guides</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-purple-400">{stats.totalFollowers}</p>
            <p className="text-xs text-gray-400">Total Followers</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Create New Collection</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Collection Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Beginner Warrior Guides"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your collection..."
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., warrior, beginner, pve"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Make this collection public</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleCreateCollection}
              disabled={!formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Create Collection
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-700 flex">
        {(['my', 'public', 'followed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'my' && `My Collections (${collections.length})`}
            {tab === 'public' && `Public (${publicCollections.length})`}
            {tab === 'followed' && `Following (${followedCollections.length})`}
          </button>
        ))}
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCollections.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-400">
            <p>No collections yet</p>
          </div>
        ) : (
          displayCollections.map((collection) => {
            const isOwner = collection.createdBy === userId;
            const isFollowing = collectionsService.isFollowingCollection(userId, collection.id);

            return (
              <div
                key={collection.id}
                className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition"
              >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 border-b border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white flex-1">{collection.name}</h3>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditingId(collection.id);
                          setEditFormData(collection);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2">{collection.description}</p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {collection.guides.length} guides
                    </span>
                    <span className="text-gray-400">
                      {collection.followers.length} followers
                    </span>
                  </div>

                  {/* Tags */}
                  {collection.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {collection.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {collection.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{collection.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="flex-1 px-3 py-1 text-sm bg-red-900 text-red-200 rounded hover:bg-red-800 transition"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          isFollowing
                            ? handleUnfollowCollection(collection.id)
                            : handleFollowCollection(collection.id)
                        }
                        className={`flex-1 px-3 py-1 text-sm rounded transition ${
                          isFollowing
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Edit Collection</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={editFormData.description || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editFormData.isPublic || false}
                onChange={(e) => setEditFormData({ ...editFormData, isPublic: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-300">Public</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateCollection(editingId)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditFormData({});
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
