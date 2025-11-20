/**
 * Ratings Service
 * Manages guide ratings and reviews
 */

export interface Review {
  id: string;
  classId: string;
  tab: string;
  specId?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  helpful: number;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>; // 1-5 star counts
}

class RatingsService {
  private reviews: Map<string, Review[]> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to rating changes
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
   * Add a review
   */
  addReview(
    classId: string,
    tab: string,
    rating: number,
    comment: string,
    specId?: string
  ): string {
    const id = `review_${Date.now()}`;
    const review: Review = {
      id,
      classId,
      tab,
      specId,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      createdAt: new Date(),
      helpful: 0,
    };

    const key = `${classId}_${tab}_${specId || 'none'}`;
    if (!this.reviews.has(key)) {
      this.reviews.set(key, []);
    }

    this.reviews.get(key)!.unshift(review);
    this.save();
    this.notifyListeners();
    return id;
  }

  /**
   * Get reviews for a guide
   */
  getReviews(classId: string, tab: string, specId?: string): Review[] {
    const key = `${classId}_${tab}_${specId || 'none'}`;
    return this.reviews.get(key) || [];
  }

  /**
   * Get rating stats
   */
  getRatingStats(classId: string, tab: string, specId?: string): RatingStats {
    const reviews = this.getReviews(classId, tab, specId);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    let totalRating = 0;
    reviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: reviews.length,
      distribution,
    };
  }

  /**
   * Mark review as helpful
   */
  markHelpful(reviewId: string, classId: string, tab: string, specId?: string): void {
    const reviews = this.getReviews(classId, tab, specId);
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful++;
      this.save();
      this.notifyListeners();
    }
  }

  /**
   * Delete a review
   */
  deleteReview(reviewId: string, classId: string, tab: string, specId?: string): void {
    const key = `${classId}_${tab}_${specId || 'none'}`;
    const reviews = this.reviews.get(key);
    if (reviews) {
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews.splice(index, 1);
        this.save();
        this.notifyListeners();
      }
    }
  }

  /**
   * Save to localStorage
   */
  private save(): void {
    try {
      const data: Record<string, any[]> = {};
      this.reviews.forEach((reviews, key) => {
        data[key] = reviews.map(r => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }));
      });
      localStorage.setItem('wow_class_helper_ratings', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save ratings:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_ratings');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, reviews]: [string, any]) => {
          this.reviews.set(
            key,
            reviews.map((r: any) => ({
              ...r,
              createdAt: new Date(r.createdAt),
            }))
          );
        });
      }
    } catch (error) {
      console.warn('Failed to load ratings:', error);
    }
  }
}

export const ratingsService = new RatingsService();
ratingsService.load();
