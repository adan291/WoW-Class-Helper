/**
 * Guide Builder Service
 * Manages custom guide creation and editing
 */

export interface GuideSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'code' | 'quote';
  content: string;
  metadata?: Record<string, any>;
}

export interface CustomGuide {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  sections: GuideSection[];
  tags: string[];
  isPublished: boolean;
  views: number;
  likes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail?: string;
  relatedGuides: string[];
}

class GuideService {
  private readonly GUIDES_KEY = 'wow_class_helper_guides';

  /**
   * Create a new custom guide
   */
  createGuide(
    title: string,
    description: string,
    author: string,
    category: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): CustomGuide {
    const guide: CustomGuide = {
      id: this.generateId(),
      title,
      description,
      author,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections: [],
      tags: [],
      isPublished: false,
      views: 0,
      likes: 0,
      difficulty,
      category,
      relatedGuides: [],
    };

    this.saveGuide(guide);
    return guide;
  }

  /**
   * Get guide by ID
   */
  getGuide(guideId: string): CustomGuide | null {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      if (!data) return null;

      const guides: CustomGuide[] = JSON.parse(data);
      return guides.find((g) => g.id === guideId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Update guide
   */
  updateGuide(guideId: string, updates: Partial<CustomGuide>): CustomGuide | null {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      if (!data) return null;

      const guides: CustomGuide[] = JSON.parse(data);
      const guide = guides.find((g) => g.id === guideId);

      if (!guide) return null;

      const updated = {
        ...guide,
        ...updates,
        id: guideId,
        createdAt: guide.createdAt,
        updatedAt: Date.now(),
      };

      const index = guides.findIndex((g) => g.id === guideId);
      guides[index] = updated;

      localStorage.setItem(this.GUIDES_KEY, JSON.stringify(guides));
      return updated;
    } catch {
      return null;
    }
  }

  /**
   * Delete guide
   */
  deleteGuide(guideId: string): boolean {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      if (!data) return false;

      const guides: CustomGuide[] = JSON.parse(data);
      const filtered = guides.filter((g) => g.id !== guideId);

      localStorage.setItem(this.GUIDES_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add section to guide
   */
  addSection(guideId: string, section: Omit<GuideSection, 'id'>): GuideSection | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    const newSection: GuideSection = {
      ...section,
      id: this.generateId(),
    };

    guide.sections.push(newSection);
    this.updateGuide(guideId, { sections: guide.sections });

    return newSection;
  }

  /**
   * Update section
   */
  updateSection(guideId: string, sectionId: string, updates: Partial<GuideSection>): boolean {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    const section = guide.sections.find((s) => s.id === sectionId);
    if (!section) return false;

    Object.assign(section, updates);
    return this.updateGuide(guideId, { sections: guide.sections }) !== null;
  }

  /**
   * Delete section
   */
  deleteSection(guideId: string, sectionId: string): boolean {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    guide.sections = guide.sections.filter((s) => s.id !== sectionId);
    return this.updateGuide(guideId, { sections: guide.sections }) !== null;
  }

  /**
   * Publish guide
   */
  publishGuide(guideId: string): boolean {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    if (guide.sections.length === 0) return false;

    return this.updateGuide(guideId, { isPublished: true }) !== null;
  }

  /**
   * Get user guides
   */
  getUserGuides(author: string): CustomGuide[] {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      if (!data) return [];

      const guides: CustomGuide[] = JSON.parse(data);
      return guides
        .filter((g) => g.author === author)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  /**
   * Get published guides
   */
  getPublishedGuides(): CustomGuide[] {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      if (!data) return [];

      const guides: CustomGuide[] = JSON.parse(data);
      return guides
        .filter((g) => g.isPublished)
        .sort((a, b) => b.views - a.views);
    } catch {
      return [];
    }
  }

  /**
   * Search guides
   */
  searchGuides(query: string): CustomGuide[] {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      if (!data) return [];

      const guides: CustomGuide[] = JSON.parse(data);
      const lowerQuery = query.toLowerCase();

      return guides.filter(
        (g) =>
          g.isPublished &&
          (g.title.toLowerCase().includes(lowerQuery) ||
            g.description.toLowerCase().includes(lowerQuery) ||
            g.tags.some((t) => t.toLowerCase().includes(lowerQuery)))
      );
    } catch {
      return [];
    }
  }

  /**
   * Like guide
   */
  likeGuide(guideId: string): number | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    guide.likes++;
    return this.updateGuide(guideId, { likes: guide.likes })?.likes || null;
  }

  /**
   * View guide
   */
  viewGuide(guideId: string): number | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    guide.views++;
    return this.updateGuide(guideId, { views: guide.views })?.views || null;
  }

  /**
   * Get guide statistics
   */
  getGuideStats(): {
    totalGuides: number;
    publishedGuides: number;
    totalViews: number;
    totalLikes: number;
  } {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      if (!data) {
        return {
          totalGuides: 0,
          publishedGuides: 0,
          totalViews: 0,
          totalLikes: 0,
        };
      }

      const guides: CustomGuide[] = JSON.parse(data);
      const published = guides.filter((g) => g.isPublished);
      const totalViews = guides.reduce((sum, g) => sum + g.views, 0);
      const totalLikes = guides.reduce((sum, g) => sum + g.likes, 0);

      return {
        totalGuides: guides.length,
        publishedGuides: published.length,
        totalViews,
        totalLikes,
      };
    } catch {
      return {
        totalGuides: 0,
        publishedGuides: 0,
        totalViews: 0,
        totalLikes: 0,
      };
    }
  }

  /**
   * Export guide as JSON
   */
  exportGuide(guideId: string): string | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    return JSON.stringify(guide, null, 2);
  }

  /**
   * Import guide from JSON
   */
  importGuide(json: string, author: string): CustomGuide | null {
    try {
      const data = JSON.parse(json);
      const guide: CustomGuide = {
        ...data,
        id: this.generateId(),
        author,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.saveGuide(guide);
      return guide;
    } catch {
      return null;
    }
  }

  // Private helper methods

  private saveGuide(guide: CustomGuide): void {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];
      guides.push(guide);
      localStorage.setItem(this.GUIDES_KEY, JSON.stringify(guides));
    } catch {
      console.error('Failed to save guide');
    }
  }

  private generateId(): string {
    return `guide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const guideService = new GuideService();
