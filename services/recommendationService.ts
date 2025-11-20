/**
 * Recommendation Service
 * AI-powered guide recommendations
 */

import { analyticsService } from './analyticsService.ts';
import { favoritesService } from './favoritesService.ts';

export interface Recommendation {
  classId: string;
  tab: string;
  specId?: string;
  title: string;
  score: number;
  reason: string;
}

class RecommendationService {
  /**
   * Get recommendations based on user history
   */
  getRecommendations(limit: number = 5): Recommendation[] {
    const analytics = analyticsService.getAnalytics();
    const favorites = favoritesService.getFavorites();
    const recommendations: Recommendation[] = [];

    // Get most viewed guides
    if (analytics.mostViewedGuides.length > 0) {
      analytics.mostViewedGuides.forEach(guide => {
        const isFavorite = favorites.some(
          f => f.classId === guide.classId && f.tab === guide.tab && f.specId === guide.specId
        );

        if (!isFavorite) {
          recommendations.push({
            classId: guide.classId,
            tab: guide.tab,
            specId: guide.specId,
            title: `${guide.classId} - ${guide.tab}`,
            score: guide.viewCount * 10,
            reason: `Popular guide (${guide.viewCount} views)`,
          });
        }
      });
    }

    // Get popular classes
    if (analytics.popularClasses.length > 0) {
      analytics.popularClasses.forEach(cls => {
        const hasClass = recommendations.some(r => r.classId === cls.classId);
        if (!hasClass) {
          recommendations.push({
            classId: cls.classId,
            tab: 'overview',
            title: `${cls.classId} Overview`,
            score: cls.count * 5,
            reason: `Popular class (${cls.count} views)`,
          });
        }
      });
    }

    // Sort by score and return top N
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get related guides
   */
  getRelatedGuides(classId: string, tab: string, specId?: string, limit: number = 3): Recommendation[] {
    const analytics = analyticsService.getAnalytics();
    const recommendations: Recommendation[] = [];

    // Find guides with same class
    analytics.mostViewedGuides.forEach(guide => {
      if (guide.classId === classId && !(guide.tab === tab && guide.specId === specId)) {
        recommendations.push({
          classId: guide.classId,
          tab: guide.tab,
          specId: guide.specId,
          title: `${guide.classId} - ${guide.tab}`,
          score: guide.viewCount * 10,
          reason: `Related ${guide.tab} guide`,
        });
      }
    });

    // Find guides with same tab
    analytics.mostViewedGuides.forEach(guide => {
      if (guide.tab === tab && guide.classId !== classId) {
        const exists = recommendations.some(
          r => r.classId === guide.classId && r.tab === guide.tab
        );
        if (!exists) {
          recommendations.push({
            classId: guide.classId,
            tab: guide.tab,
            specId: guide.specId,
            title: `${guide.classId} - ${guide.tab}`,
            score: guide.viewCount * 5,
            reason: `Similar ${tab} guide`,
          });
        }
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get trending guides
   */
  getTrendingGuides(limit: number = 5): Recommendation[] {
    const analytics = analyticsService.getAnalytics();
    const recommendations: Recommendation[] = [];

    // Get most viewed guides
    analytics.mostViewedGuides.forEach(guide => {
      recommendations.push({
        classId: guide.classId,
        tab: guide.tab,
        specId: guide.specId,
        title: `${guide.classId} - ${guide.tab}`,
        score: guide.viewCount,
        reason: `Trending (${guide.viewCount} views)`,
      });
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get personalized recommendations
   */
  getPersonalizedRecommendations(limit: number = 5): Recommendation[] {
    const favorites = favoritesService.getFavorites();
    const recommendations: Recommendation[] = [];

    // Get favorite classes
    const favoriteClasses = new Set(favorites.map(f => f.classId));

    // Recommend other tabs for favorite classes
    favoriteClasses.forEach(classId => {
      const tabs = ['overview', 'specs', 'rotations', 'addons', 'dungeons'];
      const favoriteTabs = new Set(
        favorites.filter(f => f.classId === classId).map(f => f.tab)
      );

      tabs.forEach(tab => {
        if (!favoriteTabs.has(tab)) {
          recommendations.push({
            classId,
            tab,
            title: `${classId} - ${tab}`,
            score: 50,
            reason: `Explore ${tab} for your favorite class`,
          });
        }
      });
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const recommendationService = new RecommendationService();
