/**
 * Notes Service
 * Manages personal notes and annotations
 */

export interface Note {
  id: string;
  classId: string;
  tab: string;
  specId?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

class NotesService {
  private notes: Map<string, Note> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to notes changes
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
   * Get or create note
   */
  getOrCreateNote(classId: string, tab: string, specId?: string): Note {
    const id = `note_${classId}_${tab}_${specId || 'none'}`;
    let note = this.notes.get(id);

    if (!note) {
      note = {
        id,
        classId,
        tab,
        specId,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.notes.set(id, note);
    }

    return note;
  }

  /**
   * Get note
   */
  getNote(classId: string, tab: string, specId?: string): Note | null {
    const id = `note_${classId}_${tab}_${specId || 'none'}`;
    return this.notes.get(id) || null;
  }

  /**
   * Update note
   */
  updateNote(classId: string, tab: string, content: string, specId?: string): void {
    const note = this.getOrCreateNote(classId, tab, specId);
    note.content = content;
    note.updatedAt = new Date();
    this.save();
    this.notifyListeners();
  }

  /**
   * Delete note
   */
  deleteNote(classId: string, tab: string, specId?: string): void {
    const id = `note_${classId}_${tab}_${specId || 'none'}`;
    this.notes.delete(id);
    this.save();
    this.notifyListeners();
  }

  /**
   * Get all notes
   */
  getAllNotes(): Note[] {
    return Array.from(this.notes.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  /**
   * Check if has note
   */
  hasNote(classId: string, tab: string, specId?: string): boolean {
    const note = this.getNote(classId, tab, specId);
    return note !== null && note.content.trim().length > 0;
  }

  /**
   * Export notes as markdown
   */
  exportAsMarkdown(): string {
    const notes = this.getAllNotes();
    let markdown = '# My Notes\n\n';

    notes.forEach(note => {
      markdown += `## ${note.classId} - ${note.tab}\n`;
      if (note.specId) {
        markdown += `**Spec**: ${note.specId}\n\n`;
      }
      markdown += `${note.content}\n\n`;
      markdown += `*Last updated: ${note.updatedAt.toLocaleString()}*\n\n`;
      markdown += '---\n\n';
    });

    return markdown;
  }

  /**
   * Save to localStorage
   */
  private save(): void {
    try {
      const notesArray = Array.from(this.notes.values()).map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      }));
      localStorage.setItem('wow_class_helper_notes', JSON.stringify(notesArray));
    } catch (error) {
      console.warn('Failed to save notes:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_notes');
      if (stored) {
        const notesArray = JSON.parse(stored);
        notesArray.forEach((note: any) => {
          this.notes.set(note.id, {
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          });
        });
      }
    } catch (error) {
      console.warn('Failed to load notes:', error);
    }
  }
}

export const notesService = new NotesService();
notesService.load();
