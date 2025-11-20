/**
 * Bookmark Service
 * Manages bookmarked guides and collections
 */

export interface Bookmark {
  id: string;
  title: string;
  classId: string;
  specId?: string;
  tab: string;
  dungeonName?: string;
  expansion?: string;
  createdAt: Date;
  notes?: string;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  bookmarks: string[]; // bookmark IDs
  createdAt: Date;
  updatedAt: Date;
}

class BookmarkService {
  private bookmarks: Map<string, Bookmark> = new Map();
  private collections: Map<string, BookmarkCollection> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to bookmark changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Add a bookmark
   */
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): string {
    const id = `bookmark_${Date.now()}`;
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      createdAt: new Date(),
    };

    this.bookmarks.set(id, newBookmark);
    this.save();
    this.notifyListeners();
    return id;
  }

  /**
   * Remove a bookmark
   */
  removeBookmark(id: string): void {
    this.bookmarks.delete(id);
    // Remove from collections
    this.collections.forEach(collection => {
      collection.bookmarks = collection.bookmarks.filter(bid => bid !== id);
    });
    this.save();
    this.notifyListeners();
  }

  /**
   * Get all bookmarks
   */
  getBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  /**
   * Check if a guide is bookmarked
   */
  isBookmarked(classId: string, tab: string, specId?: string): boolean {
    return Array.from(this.bookmarks.values()).some(
      b => b.classId === classId && b.tab === tab && b.specId === specId
    );
  }

  /**
   * Create a collection
   */
  createCollection(name: string, description?: string): string {
    const id = `collection_${Date.now()}`;
    const collection: BookmarkCollection = {
      id,
      name,
      description,
      bookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.collections.set(id, collection);
    this.save();
    this.notifyListeners();
    return id;
  }

  /**
   * Add bookmark to collection
   */
  addToCollection(collectionId: string, bookmarkId: string): void {
    const collection = this.collections.get(collectionId);
    if (collection && !collection.bookmarks.includes(bookmarkId)) {
      collection.bookmarks.push(bookmarkId);
      collection.updatedAt = new Date();
      this.save();
      this.notifyListeners();
    }
  }

  /**
   * Remove bookmark from collection
   */
  removeFromCollection(collectionId: string, bookmarkId: string): void {
    const collection = this.collections.get(collectionId);
    if (collection) {
      collection.bookmarks = collection.bookmarks.filter(id => id !== bookmarkId);
      collection.updatedAt = new Date();
      this.save();
      this.notifyListeners();
    }
  }

  /**
   * Get all collections
   */
  getCollections(): BookmarkCollection[] {
    return Array.from(this.collections.values());
  }

  /**
   * Get collection with bookmarks
   */
  getCollectionWithBookmarks(collectionId: string): (BookmarkCollection & { bookmarkDetails: Bookmark[] }) | null {
    const collection = this.collections.get(collectionId);
    if (!collection) return null;

    return {
      ...collection,
      bookmarkDetails: collection.bookmarks
        .map(id => this.bookmarks.get(id))
        .filter((b): b is Bookmark => b !== undefined),
    };
  }

  /**
   * Delete collection
   */
  deleteCollection(collectionId: string): void {
    this.collections.delete(collectionId);
    this.save();
    this.notifyListeners();
  }

  /**
   * Export collection as JSON
   */
  exportCollection(collectionId: string): string {
    const collection = this.getCollectionWithBookmarks(collectionId);
    if (!collection) return '';
    return JSON.stringify(collection, null, 2);
  }

  /**
   * Import collection from JSON
   */
  importCollection(json: string): string | null {
    try {
      const data = JSON.parse(json);
      const id = `collection_${Date.now()}`;
      const collection: BookmarkCollection = {
        id,
        name: data.name,
        description: data.description,
        bookmarks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Import bookmarks
      if (data.bookmarkDetails && Array.isArray(data.bookmarkDetails)) {
        data.bookmarkDetails.forEach((bookmark: any) => {
          const bookmarkId = this.addBookmark({
            title: bookmark.title,
            classId: bookmark.classId,
            specId: bookmark.specId,
            tab: bookmark.tab,
            dungeonName: bookmark.dungeonName,
            expansion: bookmark.expansion,
            notes: bookmark.notes,
          });
          collection.bookmarks.push(bookmarkId);
        });
      }

      this.collections.set(id, collection);
      this.save();
      this.notifyListeners();
      return id;
    } catch (error) {
      console.error('Failed to import collection:', error);
      return null;
    }
  }

  /**
   * Save to localStorage
   */
  private save(): void {
    try {
      const data = {
        bookmarks: Array.from(this.bookmarks.entries()),
        collections: Array.from(this.collections.entries()),
      };
      localStorage.setItem('wow_class_helper_bookmarks', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save bookmarks:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_bookmarks');
      if (stored) {
        const data = JSON.parse(stored);
        this.bookmarks = new Map(data.bookmarks);
        this.collections = new Map(data.collections);
      }
    } catch (error) {
      console.warn('Failed to load bookmarks:', error);
    }
  }
}

export const bookmarkService = new BookmarkService();
bookmarkService.load();
