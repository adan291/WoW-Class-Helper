/**
 * Favorites Service
 * Manages favorite guides and quick access
 */

export interface Favorite {
  id: string;
  classId: string;
  tab: string;
  specId?: string;
  title: string;
  createdAt: Date;
  lastAccessed: Date;
}

export interface RecentGuide {
  classId: string;
  tab: string;
  specId?: string;
  title: string;
  accessedAt: Date;
}

class FavoritesService {
  private favorites: Map<string, Favorite> = new Map();
  private recentGuides: RecentGuide[] = [];
  private maxRecent = 10;
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to favorites changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Add a favorite
   */
  addFavorite(classId: string, tab: string, title: string, specId?: string): string {
    const id = `fav_${classId}_${tab}_${specId || 'none'}`;
    const favorite: Favorite = {
      id,
      classId,
      tab,
      specId,
      title,
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    this.favorites.set(id, favorite);
    this.save();
    this.notifyListeners();
    return id;
  }

  /**
   * Remove a favorite
   */
  removeFavorite(id: string): void {
    this.favorites.delete(id);
    this.save();
    this.notifyListeners();
  }

  /**
   * Check if is favorite
   */
  isFavorite(classId: string, tab: string, specId?: string): boolean {
    const id = `fav_${classId}_${tab}_${specId || 'none'}`;
    return this.favorites.has(id);
  }

  /**
   * Get all favorites
   */
  getFavorites(): Favorite[] {
    return Array.from(this.favorites.values()).sort(
      (a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime()
    );
  }

  /**
   * Record a guide access
   */
  recordAccess(classId: string, tab: string, title: string, specId?: string): void {
    // Update favorite last accessed
    const favId = `fav_${classId}_${tab}_${specId || 'none'}`;
    const fav = this.favorites.get(favId);
    if (fav) {
      fav.lastAccessed = new Date();
    }

    // Add to recent
    const recent: RecentGuide = {
      classId,
      tab,
      specId,
      title,
      accessedAt: new Date(),
    };

    // Remove if already exists
    this.recentGuides = this.recentGuides.filter(
      r => !(r.classId === classId && r.tab === tab && r.specId === specId)
    );

    // Add to beginning
    this.recentGuides.unshift(recent);

    // Keep only max
    this.recentGuides = this.recentGuides.slice(0, this.maxRecent);

    this.save();
    this.notifyListeners();
  }

  /**
   * Get recent guides
   */
  getRecent(): RecentGuide[] {
    return [...this.recentGuides];
  }

  /**
   * Clear recent
   */
  clearRecent(): void {
    this.recentGuides = [];
    this.save();
    this.notifyListeners();
  }

  /**
   * Get favorite class
   */
  getFavoriteClass(): string | null {
    const favorites = this.getFavorites();
    if (favorites.length === 0) return null;

    const classMap = new Map<string, number>();
    favorites.forEach(fav => {
      classMap.set(fav.classId, (classMap.get(fav.classId) || 0) + 1);
    });

    let maxClass = '';
    let maxCount = 0;
    classMap.forEach((count, classId) => {
      if (count > maxCount) {
        maxCount = count;
        maxClass = classId;
      }
    });

    return maxClass || null;
  }

  /**
   * Save to localStorage
   */
  private save(): void {
    try {
      const favArray = Array.from(this.favorites.values()).map(f => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        lastAccessed: f.lastAccessed.toISOString(),
      }));

      const recentArray = this.recentGuides.map(r => ({
        ...r,
        accessedAt: r.accessedAt.toISOString(),
      }));

      localStorage.setItem('wow_class_helper_favorites', JSON.stringify(favArray));
      localStorage.setItem('wow_class_helper_recent', JSON.stringify(recentArray));
    } catch (error) {
      console.warn('Failed to save favorites:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load(): void {
    try {
      const favStored = localStorage.getItem('wow_class_helper_favorites');
      if (favStored) {
        const favArray = JSON.parse(favStored);
        favArray.forEach((fav: any) => {
          this.favorites.set(fav.id, {
            ...fav,
            createdAt: new Date(fav.createdAt),
            lastAccessed: new Date(fav.lastAccessed),
          });
        });
      }

      const recentStored = localStorage.getItem('wow_class_helper_recent');
      if (recentStored) {
        const recentArray = JSON.parse(recentStored);
        this.recentGuides = recentArray.map((r: any) => ({
          ...r,
          accessedAt: new Date(r.accessedAt),
        }));
      }
    } catch (error) {
      console.warn('Failed to load favorites:', error);
    }
  }
}

export const favoritesService = new FavoritesService();
favoritesService.load();
