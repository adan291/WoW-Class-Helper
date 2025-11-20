/**
 * Analytics Service
 * Tracks user engagement and guide popularity
 */

export interface GuideView {
  classId: string;
  tab: string;
  specId?: string;
  timestamp: Date;
  duration: number; // in seconds
}

export interface GuideStats {
  classId: string;
  tab: string;
  specId?: string;
  viewCount: number;
  totalDuration: number;
  averageDuration: number;
  lastViewed: Date;
}

export interface AnalyticsData {
  totalViews: number;
  totalDuration: number;
  averageSessionDuration: number;
  mostViewedGuides: GuideStats[];
  popularClasses: Array<{ classId: string; count: number }>;
  popularTabs: Array<{ tab: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

class AnalyticsService {
  private views: GuideView[] = [];
  private maxViews = 10000;
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to analytics changes
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
   * Record a guide view
   */
  recordView(classId: string, tab: string, specId?: string, duration: number = 0): void {
    const view: GuideView = {
      classId,
      tab,
      specId,
      timestamp: new Date(),
      duration,
    };

    this.views.push(view);

    // Keep only recent views
    if (this.views.length > this.maxViews) {
      this.views = this.views.slice(-this.maxViews);
    }

    this.save();
    this.notifyListeners();
  }

  /**
   * Get analytics data
   */
  getAnalytics(): AnalyticsData {
    const totalViews = this.views.length;
    const totalDuration = this.views.reduce((sum, v) => sum + v.duration, 0);
    const averageSessionDuration = totalViews > 0 ? totalDuration / totalViews : 0;

    // Most viewed guides
    const guideMap = new Map<string, GuideStats>();
    this.views.forEach(view => {
      const key = `${view.classId}_${view.tab}_${view.specId || ''}`;
      const existing = guideMap.get(key);

      if (existing) {
        existing.viewCount++;
        existing.totalDuration += view.duration;
        existing.averageDuration = existing.totalDuration / existing.viewCount;
        existing.lastViewed = view.timestamp;
      } else {
        guideMap.set(key, {
          classId: view.classId,
          tab: view.tab,
          specId: view.specId,
          viewCount: 1,
          totalDuration: view.duration,
          averageDuration: view.duration,
          lastViewed: view.timestamp,
        });
      }
    });

    const mostViewedGuides = Array.from(guideMap.values())
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);

    // Popular classes
    const classMap = new Map<string, number>();
    this.views.forEach(view => {
      classMap.set(view.classId, (classMap.get(view.classId) || 0) + 1);
    });

    const popularClasses = Array.from(classMap.entries())
      .map(([classId, count]) => ({ classId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Popular tabs
    const tabMap = new Map<string, number>();
    this.views.forEach(view => {
      tabMap.set(view.tab, (tabMap.get(view.tab) || 0) + 1);
    });

    const popularTabs = Array.from(tabMap.entries())
      .map(([tab, count]) => ({ tab, count }))
      .sort((a, b) => b.count - a.count);

    // Peak hours
    const hourMap = new Map<number, number>();
    this.views.forEach(view => {
      const hour = view.timestamp.getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const peakHours = Array.from(hourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalViews,
      totalDuration,
      averageSessionDuration,
      mostViewedGuides,
      popularClasses,
      popularTabs,
      peakHours,
    };
  }

  /**
   * Get views for a specific guide
   */
  getGuideViews(classId: string, tab: string, specId?: string): GuideView[] {
    return this.views.filter(
      v => v.classId === classId && v.tab === tab && v.specId === specId
    );
  }

  /**
   * Get views in time range
   */
  getViewsInRange(startDate: Date, endDate: Date): GuideView[] {
    return this.views.filter(
      v => v.timestamp >= startDate && v.timestamp <= endDate
    );
  }

  /**
   * Clear all analytics
   */
  clear(): void {
    this.views = [];
    localStorage.removeItem('wow_class_helper_analytics');
    this.notifyListeners();
  }

  /**
   * Export analytics as JSON
   */
  export(): string {
    const analytics = this.getAnalytics();
    return JSON.stringify(analytics, null, 2);
  }

  /**
   * Save to localStorage
   */
  private save(): void {
    try {
      const data = this.views.map(v => ({
        ...v,
        timestamp: v.timestamp.toISOString(),
      }));
      localStorage.setItem('wow_class_helper_analytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save analytics:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_analytics');
      if (stored) {
        const data = JSON.parse(stored);
        this.views = data.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load analytics:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
analyticsService.load();
