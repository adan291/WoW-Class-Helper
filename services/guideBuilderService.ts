/**
 * Guide Builder Service
 * Manages custom guide creation and storage
 */

interface GuideSectionContent {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'code' | 'quote';
  id: string;
  content: string;
}

interface GuideSection {
  id: string;
  name: string;
  sections: GuideSectionContent[];
}

interface CustomGuide {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  likes: number;
  views: number;
  tags: string[];
  sections: GuideSection[];
  relatedGuides: string[];
  thumbnail?: string;
}

interface GuideTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  sections: Omit<GuideSection, 'id'>[];
}

export class GuideBuilderService {
  private readonly GUIDES_KEY = 'wow_class_helper_custom_guides';

  private readonly TEMPLATES: GuideTemplate[] = [
    {
      id: 'template_dungeon_guide',
      name: 'Dungeon Guide',
      category: 'dungeon',
      description: 'Guide for a specific dungeon',
      sections: [
        {
          name: 'Dungeon Overview',
          sections: [{ type: 'heading', id: 'intro', content: 'Dungeon Introduction' }],
        },
        {
          name: 'Boss Mechanics',
          sections: [{ type: 'heading', id: 'bosses', content: 'Boss Mechanics' }],
        },
        {
          name: 'Loot Overview',
          sections: [{ type: 'heading', id: 'loot', content: 'Loot Table' }],
        },
      ],
    },
    {
      id: 'template_spec_guide',
      name: 'Specialization Guide',
      category: 'specialization',
      description: 'Detailed guide for a class specialization',
      sections: [
        {
          name: 'Specialization Overview',
          sections: [{ type: 'heading', id: 'intro', content: 'Specialization Introduction' }],
        },
        {
          name: 'Rotation',
          sections: [{ type: 'heading', id: 'rotation', content: 'Combat Rotation' }],
        },
        {
          name: 'Gearing',
          sections: [{ type: 'heading', id: 'gearing', content: 'Gearing Strategy' }],
        },
        {
          name: 'Key Abilities',
          sections: [{ type: 'heading', id: 'abilities', content: 'Key Abilities' }],
        },
      ],
    },
    {
      id: 'template_class_guide',
      name: 'Class Guide',
      category: 'class',
      description: 'Complete guide for a WoW class',
      sections: [
        {
          name: 'Class Overview',
          sections: [{ type: 'heading', id: 'intro', content: 'Class Introduction' }],
        },
        {
          name: 'Specializations',
          sections: [{ type: 'heading', id: 'specs', content: 'Available Specializations' }],
        },
        {
          name: 'Pro Tips',
          sections: [{ type: 'heading', id: 'tips', content: 'Pro Tips' }],
        },
      ],
    },
  ];

  /**
   * Get all published guides
   */
  getPublishedGuides(): CustomGuide[] {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];

      return guides.filter((g) => g.isPublished);
    } catch {
      return [];
    }
  }

  /**
   * Get guides by author
   */
  getGuidesByAuthor(author: string): CustomGuide[] {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];

      return guides.filter((g) => g.author === author);
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
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];
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
   * Get guide by ID
   */
  getGuide(guideId: string): CustomGuide | null {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];

      return guides.find((g) => g.id === guideId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Create a new guide
   */
  createGuide(
    title: string,
    description: string,
    author: string,
    category: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): CustomGuide {
    const guide: CustomGuide = {
      id: this.generateId(),
      title,
      description,
      author,
      category,
      difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false,
      likes: 0,
      views: 0,
      tags: [],
      sections: [],
      relatedGuides: [],
    };

    this.saveGuide(guide);
    return guide;
  }

  /**
   * Create guide from template
   */
  createGuideFromTemplate(templateId: string, title: string, author: string): CustomGuide | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const guide: CustomGuide = {
      id: this.generateId(),
      title,
      description: template.description,
      author,
      category: template.category,
      difficulty: 'intermediate',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false,
      likes: 0,
      views: 0,
      tags: [],
      sections: template.sections.map((s) => ({
        ...s,
        id: this.generateId(),
      })),
      relatedGuides: [],
    };

    this.saveGuide(guide);
    return guide;
  }

  /**
   * Update guide
   */
  updateGuide(guideId: string, updates: Partial<CustomGuide>): CustomGuide | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    const updated = {
      ...guide,
      ...updates,
      updatedAt: new Date(),
    };

    this.saveGuide(updated);
    return updated;
  }

  /**
   * Delete guide
   */
  deleteGuide(guideId: string): boolean {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];

      const filtered = guides.filter((g) => g.id !== guideId);

      if (filtered.length === guides.length) return false;

      localStorage.setItem(this.GUIDES_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Publish guide
   */
  publishGuide(guideId: string): boolean {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    return this.updateGuide(guideId, { isPublished: true }) !== null;
  }

  /**
   * Unpublish guide
   */
  unpublishGuide(guideId: string): boolean {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    return this.updateGuide(guideId, { isPublished: false }) !== null;
  }

  /**
   * Like guide
   */
  likeGuide(guideId: string): number | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    guide.likes++;
    this.saveGuide(guide);
    return guide.likes;
  }

  /**
   * View guide
   */
  viewGuide(guideId: string): number | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    guide.views++;
    this.saveGuide(guide);
    return guide.views;
  }

  /**
   * Reorder sections
   */
  reorderSections(guideId: string, sectionIds: string[]): boolean {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    const sectionMap = new Map(guide.sections.map((s) => [s.id, s]));
    const reordered = sectionIds
      .map((id) => sectionMap.get(id))
      .filter((s) => s !== undefined) as GuideSection[];

    if (reordered.length !== guide.sections.length) return false;

    return this.updateGuide(guideId, { sections: reordered }) !== null;
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
    this.saveGuide(guide);
    return newSection;
  }

  /**
   * Delete section from guide
   */
  deleteSection(guideId: string, sectionId: string): boolean {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    const filtered = guide.sections.filter((s) => s.id !== sectionId);
    if (filtered.length === guide.sections.length) return false;

    return this.updateGuide(guideId, { sections: filtered }) !== null;
  }

  /**
   * Update section
   */
  updateSection(
    guideId: string,
    sectionId: string,
    updates: Partial<GuideSection>
  ): GuideSection | null {
    const guide = this.getGuide(guideId);
    if (!guide) return null;

    const section = guide.sections.find((s) => s.id === sectionId);
    if (!section) return null;

    Object.assign(section, updates);
    this.saveGuide(guide);
    return section;
  }

  /**
   * Get guide statistics
   */
  getGuideStats(): {
    totalGuides: number;
    publishedGuides: number;
    totalViews: number;
    totalLikes: number;
    averageViews: number;
  } {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];

      const published = guides.filter((g) => g.isPublished);
      const totalViews = guides.reduce((sum, g) => sum + g.views, 0);
      const totalLikes = guides.reduce((sum, g) => sum + g.likes, 0);

      return {
        totalGuides: guides.length,
        publishedGuides: published.length,
        totalViews,
        totalLikes,
        averageViews: guides.length > 0 ? totalViews / guides.length : 0,
      };
    } catch {
      return {
        totalGuides: 0,
        publishedGuides: 0,
        totalViews: 0,
        totalLikes: 0,
        averageViews: 0,
      };
    }
  }

  /**
   * Get all templates
   */
  getTemplates(): GuideTemplate[] {
    return this.TEMPLATES;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): GuideTemplate | undefined {
    return this.TEMPLATES.find((t) => t.id === templateId);
  }

  /**
   * Save guide to localStorage
   */
  private saveGuide(guide: CustomGuide): void {
    try {
      const data = localStorage.getItem(this.GUIDES_KEY);
      const guides: CustomGuide[] = data ? JSON.parse(data) : [];

      const index = guides.findIndex((g) => g.id === guide.id);
      if (index >= 0) {
        guides[index] = guide;
      } else {
        guides.push(guide);
      }

      localStorage.setItem(this.GUIDES_KEY, JSON.stringify(guides));
    } catch {
      console.error('Failed to save guide');
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new GuideBuilderService();
