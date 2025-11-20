/**
 * Collections Service
 * Manages guide collections and playlists
 */

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  guides: string[]; // Guide IDs in order
  isPublic: boolean;
  followers: string[];
  tags: string[];
  thumbnail?: string;
  collaborative: boolean;
  collaborators: string[];
}

export interface CollectionStats {
  totalCollections: number;
  totalGuides: number;
  totalFollowers: number;
  mostFollowed: Collection | null;
}

class CollectionsService {
  private readonly COLLECTIONS_KEY = 'wow_class_helper_collections';
  private readonly COLLECTION_FOLLOWS_KEY = 'wow_class_helper_collection_follows';

  /**
   * Create a new collection
   */
  createCollection(
    name: string,
    description: string,
    createdBy: string,
    isPublic = true
  ): Collection {
    const collection: Collection = {
      id: this.generateId(),
      name,
      description,
      createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      guides: [],
      isPublic,
      followers: [],
      tags: [],
      collaborative: false,
      collaborators: [createdBy],
    };

    this.saveCollection(collection);
    return collection;
  }

  /**
   * Get collection by ID
   */
  getCollection(collectionId: string): Collection | null {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) return null;

      const collections: Collection[] = JSON.parse(data);
      return collections.find((c) => c.id === collectionId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Update collection
   */
  updateCollection(collectionId: string, updates: Partial<Collection>): Collection | null {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) return null;

      const collections: Collection[] = JSON.parse(data);
      const collection = collections.find((c) => c.id === collectionId);

      if (!collection) return null;

      const updated = {
        ...collection,
        ...updates,
        id: collectionId, // Ensure ID doesn't change
        createdBy: collection.createdBy, // Ensure creator doesn't change
        createdAt: collection.createdAt, // Ensure creation date doesn't change
        updatedAt: Date.now(),
      };

      const index = collections.findIndex((c) => c.id === collectionId);
      collections[index] = updated;

      localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
      return updated;
    } catch {
      return null;
    }
  }

  /**
   * Delete collection
   */
  deleteCollection(collectionId: string): boolean {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) return false;

      const collections: Collection[] = JSON.parse(data);
      const filtered = collections.filter((c) => c.id !== collectionId);

      localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(filtered));

      // Also remove follows
      this.removeAllFollows(collectionId);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add guide to collection
   */
  addGuideToCollection(collectionId: string, guideId: string, position?: number): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    if (collection.guides.includes(guideId)) return true;

    if (position !== undefined && position >= 0 && position <= collection.guides.length) {
      collection.guides.splice(position, 0, guideId);
    } else {
      collection.guides.push(guideId);
    }

    return this.updateCollection(collectionId, { guides: collection.guides }) !== null;
  }

  /**
   * Remove guide from collection
   */
  removeGuideFromCollection(collectionId: string, guideId: string): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    collection.guides = collection.guides.filter((g) => g !== guideId);
    return this.updateCollection(collectionId, { guides: collection.guides }) !== null;
  }

  /**
   * Reorder guides in collection
   */
  reorderGuides(collectionId: string, guides: string[]): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    // Validate all guides exist in collection
    if (!guides.every((g) => collection.guides.includes(g))) return false;

    return this.updateCollection(collectionId, { guides }) !== null;
  }

  /**
   * Get user collections
   */
  getUserCollections(userId: string): Collection[] {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) return [];

      const collections: Collection[] = JSON.parse(data);
      return collections
        .filter((c) => c.createdBy === userId)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  /**
   * Get public collections
   */
  getPublicCollections(): Collection[] {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) return [];

      const collections: Collection[] = JSON.parse(data);
      return collections
        .filter((c) => c.isPublic)
        .sort((a, b) => b.followers.length - a.followers.length);
    } catch {
      return [];
    }
  }

  /**
   * Search collections
   */
  searchCollections(query: string): Collection[] {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) return [];

      const collections: Collection[] = JSON.parse(data);
      const lowerQuery = query.toLowerCase();

      return collections.filter(
        (c) =>
          c.isPublic &&
          (c.name.toLowerCase().includes(lowerQuery) ||
            c.description.toLowerCase().includes(lowerQuery) ||
            c.tags.some((t) => t.toLowerCase().includes(lowerQuery)))
      );
    } catch {
      return [];
    }
  }

  /**
   * Follow collection
   */
  followCollection(userId: string, collectionId: string): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    if (!collection.followers.includes(userId)) {
      collection.followers.push(userId);
      this.updateCollection(collectionId, { followers: collection.followers });
    }

    try {
      const data = localStorage.getItem(this.COLLECTION_FOLLOWS_KEY);
      const follows: Array<{ userId: string; collectionId: string; followedAt: number }> = data
        ? JSON.parse(data)
        : [];

      if (!follows.some((f) => f.userId === userId && f.collectionId === collectionId)) {
        follows.push({
          userId,
          collectionId,
          followedAt: Date.now(),
        });
        localStorage.setItem(this.COLLECTION_FOLLOWS_KEY, JSON.stringify(follows));
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unfollow collection
   */
  unfollowCollection(userId: string, collectionId: string): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    collection.followers = collection.followers.filter((f) => f !== userId);
    this.updateCollection(collectionId, { followers: collection.followers });

    try {
      const data = localStorage.getItem(this.COLLECTION_FOLLOWS_KEY);
      if (!data) return true;

      const follows: Array<{ userId: string; collectionId: string; followedAt: number }> =
        JSON.parse(data);
      const filtered = follows.filter(
        (f) => !(f.userId === userId && f.collectionId === collectionId)
      );

      localStorage.setItem(this.COLLECTION_FOLLOWS_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user follows collection
   */
  isFollowingCollection(userId: string, collectionId: string): boolean {
    try {
      const data = localStorage.getItem(this.COLLECTION_FOLLOWS_KEY);
      if (!data) return false;

      const follows: Array<{ userId: string; collectionId: string; followedAt: number }> =
        JSON.parse(data);
      return follows.some((f) => f.userId === userId && f.collectionId === collectionId);
    } catch {
      return false;
    }
  }

  /**
   * Get user's followed collections
   */
  getFollowedCollections(userId: string): Collection[] {
    try {
      const data = localStorage.getItem(this.COLLECTION_FOLLOWS_KEY);
      if (!data) return [];

      const follows: Array<{ userId: string; collectionId: string; followedAt: number }> =
        JSON.parse(data);
      const collectionIds = follows
        .filter((f) => f.userId === userId)
        .map((f) => f.collectionId);

      const collectionsData = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!collectionsData) return [];

      const collections: Collection[] = JSON.parse(collectionsData);
      return collections.filter((c) => collectionIds.includes(c.id));
    } catch {
      return [];
    }
  }

  /**
   * Add collaborator to collection
   */
  addCollaborator(collectionId: string, userId: string): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    if (!collection.collaborators.includes(userId)) {
      collection.collaborators.push(userId);
      collection.collaborative = true;
      return this.updateCollection(collectionId, collection) !== null;
    }

    return true;
  }

  /**
   * Remove collaborator from collection
   */
  removeCollaborator(collectionId: string, userId: string): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) return false;

    collection.collaborators = collection.collaborators.filter((c) => c !== userId);
    return this.updateCollection(collectionId, collection) !== null;
  }

  /**
   * Get collection statistics
   */
  getCollectionStats(): CollectionStats {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) {
        return {
          totalCollections: 0,
          totalGuides: 0,
          totalFollowers: 0,
          mostFollowed: null,
        };
      }

      const collections: Collection[] = JSON.parse(data);
      const totalGuides = collections.reduce((sum, c) => sum + c.guides.length, 0);
      const totalFollowers = collections.reduce((sum, c) => sum + c.followers.length, 0);
      const mostFollowed = collections.reduce((max, c) =>
        c.followers.length > (max?.followers.length || 0) ? c : max
      );

      return {
        totalCollections: collections.length,
        totalGuides,
        totalFollowers,
        mostFollowed: mostFollowed || null,
      };
    } catch {
      return {
        totalCollections: 0,
        totalGuides: 0,
        totalFollowers: 0,
        mostFollowed: null,
      };
    }
  }

  /**
   * Get trending collections
   */
  getTrendingCollections(limit = 10): Collection[] {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      if (!data) return [];

      const collections: Collection[] = JSON.parse(data);
      return collections
        .filter((c) => c.isPublic)
        .sort((a, b) => b.followers.length - a.followers.length)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  // Private helper methods

  private saveCollection(collection: Collection): void {
    try {
      const data = localStorage.getItem(this.COLLECTIONS_KEY);
      const collections: Collection[] = data ? JSON.parse(data) : [];
      collections.push(collection);
      localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
    } catch {
      console.error('Failed to save collection');
    }
  }

  private removeAllFollows(collectionId: string): void {
    try {
      const data = localStorage.getItem(this.COLLECTION_FOLLOWS_KEY);
      if (!data) return;

      const follows: Array<{ userId: string; collectionId: string; followedAt: number }> =
        JSON.parse(data);
      const filtered = follows.filter((f) => f.collectionId !== collectionId);

      localStorage.setItem(this.COLLECTION_FOLLOWS_KEY, JSON.stringify(filtered));
    } catch {
      console.error('Failed to remove collection follows');
    }
  }

  private generateId(): string {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const collectionsService = new CollectionsService();
