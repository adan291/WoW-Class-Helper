/**
 * Patch Notes Service
 * Manages patch notes and version tracking
 */

export interface PatchNote {
  id: string;
  version: string;
  releaseDate: number;
  title: string;
  sections: PatchSection[];
  highlights: string[];
  isLatest: boolean;
}

export interface PatchSection {
  id: string;
  category: 'classes' | 'dungeons' | 'raids' | 'pvp' | 'items' | 'general' | 'bug-fixes';
  title: string;
  changes: PatchChange[];
}

export interface PatchChange {
  id: string;
  type: 'buff' | 'nerf' | 'fix' | 'new' | 'removed' | 'changed';
  description: string;
  affectedItems?: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface VersionHistory {
  version: string;
  releaseDate: number;
  summary: string;
}

class PatchNotesService {
  private readonly PATCH_NOTES_KEY = 'wow_class_helper_patch_notes';
  private readonly VERSION_HISTORY_KEY = 'wow_class_helper_version_history';

  /**
   * Create patch note
   */
  createPatchNote(
    version: string,
    title: string,
    releaseDate: number,
    highlights: string[]
  ): PatchNote {
    const patchNote: PatchNote = {
      id: this.generateId(),
      version,
      releaseDate,
      title,
      sections: [],
      highlights,
      isLatest: true,
    };

    // Mark previous as not latest
    this.markPreviousAsOld();

    this.savePatchNote(patchNote);
    return patchNote;
  }

  /**
   * Get patch note by version
   */
  getPatchNote(version: string): PatchNote | null {
    try {
      const data = localStorage.getItem(this.PATCH_NOTES_KEY);
      if (!data) return null;

      const notes: PatchNote[] = JSON.parse(data);
      return notes.find((n) => n.version === version) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get latest patch note
   */
  getLatestPatchNote(): PatchNote | null {
    try {
      const data = localStorage.getItem(this.PATCH_NOTES_KEY);
      if (!data) return null;

      const notes: PatchNote[] = JSON.parse(data);
      return notes.find((n) => n.isLatest) || notes[notes.length - 1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Get all patch notes
   */
  getAllPatchNotes(): PatchNote[] {
    try {
      const data = localStorage.getItem(this.PATCH_NOTES_KEY);
      if (!data) return [];

      const notes: PatchNote[] = JSON.parse(data);
      return notes.sort((a, b) => b.releaseDate - a.releaseDate);
    } catch {
      return [];
    }
  }

  /**
   * Add section to patch note
   */
  addSection(
    version: string,
    category: PatchSection['category'],
    title: string
  ): PatchSection | null {
    const patchNote = this.getPatchNote(version);
    if (!patchNote) return null;

    const section: PatchSection = {
      id: this.generateId(),
      category,
      title,
      changes: [],
    };

    patchNote.sections.push(section);
    this.updatePatchNote(version, patchNote);

    return section;
  }

  /**
   * Add change to section
   */
  addChange(
    version: string,
    sectionId: string,
    type: PatchChange['type'],
    description: string,
    impact: 'high' | 'medium' | 'low' = 'medium'
  ): PatchChange | null {
    const patchNote = this.getPatchNote(version);
    if (!patchNote) return null;

    const section = patchNote.sections.find((s) => s.id === sectionId);
    if (!section) return null;

    const change: PatchChange = {
      id: this.generateId(),
      type,
      description,
      impact,
    };

    section.changes.push(change);
    this.updatePatchNote(version, patchNote);

    return change;
  }

  /**
   * Get changes by type
   */
  getChangesByType(version: string, type: PatchChange['type']): PatchChange[] {
    const patchNote = this.getPatchNote(version);
    if (!patchNote) return [];

    const changes: PatchChange[] = [];
    patchNote.sections.forEach((section) => {
      changes.push(...section.changes.filter((c) => c.type === type));
    });

    return changes;
  }

  /**
   * Get high impact changes
   */
  getHighImpactChanges(version: string): PatchChange[] {
    const patchNote = this.getPatchNote(version);
    if (!patchNote) return [];

    const changes: PatchChange[] = [];
    patchNote.sections.forEach((section) => {
      changes.push(...section.changes.filter((c) => c.impact === 'high'));
    });

    return changes;
  }

  /**
   * Get changes for specific category
   */
  getCategoryChanges(version: string, category: PatchSection['category']): PatchChange[] {
    const patchNote = this.getPatchNote(version);
    if (!patchNote) return [];

    const section = patchNote.sections.find((s) => s.category === category);
    return section?.changes || [];
  }

  /**
   * Search patch notes
   */
  searchPatchNotes(query: string): PatchNote[] {
    try {
      const data = localStorage.getItem(this.PATCH_NOTES_KEY);
      if (!data) return [];

      const notes: PatchNote[] = JSON.parse(data);
      const lowerQuery = query.toLowerCase();

      return notes.filter(
        (n) =>
          n.version.toLowerCase().includes(lowerQuery) ||
          n.title.toLowerCase().includes(lowerQuery) ||
          n.highlights.some((h) => h.toLowerCase().includes(lowerQuery)) ||
          n.sections.some(
            (s) =>
              s.title.toLowerCase().includes(lowerQuery) ||
              s.changes.some((c) => c.description.toLowerCase().includes(lowerQuery))
          )
      );
    } catch {
      return [];
    }
  }

  /**
   * Get version history
   */
  getVersionHistory(): VersionHistory[] {
    try {
      const data = localStorage.getItem(this.VERSION_HISTORY_KEY);
      if (!data) return [];

      const history: VersionHistory[] = JSON.parse(data);
      return history.sort((a, b) => b.releaseDate - a.releaseDate);
    } catch {
      return [];
    }
  }

  /**
   * Add to version history
   */
  addToVersionHistory(version: string, summary: string): void {
    try {
      const data = localStorage.getItem(this.VERSION_HISTORY_KEY);
      const history: VersionHistory[] = data ? JSON.parse(data) : [];

      history.push({
        version,
        releaseDate: Date.now(),
        summary,
      });

      localStorage.setItem(this.VERSION_HISTORY_KEY, JSON.stringify(history));
    } catch {
      console.error('Failed to add to version history');
    }
  }

  /**
   * Get patch statistics
   */
  getPatchStats(version: string): {
    totalChanges: number;
    buffs: number;
    nerfs: number;
    fixes: number;
    highImpact: number;
  } {
    const patchNote = this.getPatchNote(version);
    if (!patchNote) {
      return {
        totalChanges: 0,
        buffs: 0,
        nerfs: 0,
        fixes: 0,
        highImpact: 0,
      };
    }

    let totalChanges = 0;
    let buffs = 0;
    let nerfs = 0;
    let fixes = 0;
    let highImpact = 0;

    patchNote.sections.forEach((section) => {
      section.changes.forEach((change) => {
        totalChanges++;
        if (change.type === 'buff') buffs++;
        if (change.type === 'nerf') nerfs++;
        if (change.type === 'fix') fixes++;
        if (change.impact === 'high') highImpact++;
      });
    });

    return {
      totalChanges,
      buffs,
      nerfs,
      fixes,
      highImpact,
    };
  }

  /**
   * Compare two versions
   */
  compareVersions(version1: string, version2: string): {
    added: PatchChange[];
    removed: PatchChange[];
  } {
    const note1 = this.getPatchNote(version1);
    const note2 = this.getPatchNote(version2);

    if (!note1 || !note2) {
      return { added: [], removed: [] };
    }

    const changes1 = this.getAllChanges(note1);
    const changes2 = this.getAllChanges(note2);

    const added = changes2.filter(
      (c2) => !changes1.some((c1) => c1.description === c2.description)
    );
    const removed = changes1.filter(
      (c1) => !changes2.some((c2) => c2.description === c1.description)
    );

    return { added, removed };
  }

  /**
   * Export patch notes
   */
  exportPatchNotes(version: string): string | null {
    const patchNote = this.getPatchNote(version);
    if (!patchNote) return null;

    return JSON.stringify(patchNote, null, 2);
  }

  /**
   * Get recent patches
   */
  getRecentPatches(limit = 5): PatchNote[] {
    return this.getAllPatchNotes().slice(0, limit);
  }

  // Private helper methods

  private updatePatchNote(version: string, patchNote: PatchNote): void {
    try {
      const data = localStorage.getItem(this.PATCH_NOTES_KEY);
      if (!data) return;

      const notes: PatchNote[] = JSON.parse(data);
      const index = notes.findIndex((n) => n.version === version);

      if (index >= 0) {
        notes[index] = patchNote;
        localStorage.setItem(this.PATCH_NOTES_KEY, JSON.stringify(notes));
      }
    } catch {
      console.error('Failed to update patch note');
    }
  }

  private savePatchNote(patchNote: PatchNote): void {
    try {
      const data = localStorage.getItem(this.PATCH_NOTES_KEY);
      const notes: PatchNote[] = data ? JSON.parse(data) : [];
      notes.push(patchNote);
      localStorage.setItem(this.PATCH_NOTES_KEY, JSON.stringify(notes));
    } catch {
      console.error('Failed to save patch note');
    }
  }

  private markPreviousAsOld(): void {
    try {
      const data = localStorage.getItem(this.PATCH_NOTES_KEY);
      if (!data) return;

      const notes: PatchNote[] = JSON.parse(data);
      notes.forEach((n) => {
        n.isLatest = false;
      });

      localStorage.setItem(this.PATCH_NOTES_KEY, JSON.stringify(notes));
    } catch {
      console.error('Failed to mark previous as old');
    }
  }

  private getAllChanges(patchNote: PatchNote): PatchChange[] {
    const changes: PatchChange[] = [];
    patchNote.sections.forEach((section) => {
      changes.push(...section.changes);
    });
    return changes;
  }

  private generateId(): string {
    return `patch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const patchNotesService = new PatchNotesService();
