/**
 * Versioning Service
 * Manages content versions and history
 */

export interface ContentVersion {
  id: string;
  classId: string;
  tab: string;
  specId?: string;
  content: string;
  createdAt: Date;
  message?: string;
}

class VersioningService {
  private versions: Map<string, ContentVersion[]> = new Map();
  private maxVersions = 20;
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to version changes
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
   * Save a version
   */
  saveVersion(
    classId: string,
    tab: string,
    content: string,
    specId?: string,
    message?: string
  ): string {
    const key = `${classId}_${tab}_${specId || 'none'}`;
    const versionId = `v_${Date.now()}`;

    const version: ContentVersion = {
      id: versionId,
      classId,
      tab,
      specId,
      content,
      createdAt: new Date(),
      message,
    };

    if (!this.versions.has(key)) {
      this.versions.set(key, []);
    }

    const versionList = this.versions.get(key)!;
    versionList.unshift(version);

    // Keep only max versions
    if (versionList.length > this.maxVersions) {
      versionList.pop();
    }

    this.save();
    this.notifyListeners();
    return versionId;
  }

  /**
   * Get all versions for a guide
   */
  getVersions(classId: string, tab: string, specId?: string): ContentVersion[] {
    const key = `${classId}_${tab}_${specId || 'none'}`;
    return this.versions.get(key) || [];
  }

  /**
   * Get a specific version
   */
  getVersion(versionId: string, classId: string, tab: string, specId?: string): ContentVersion | null {
    const versions = this.getVersions(classId, tab, specId);
    return versions.find(v => v.id === versionId) || null;
  }

  /**
   * Revert to a version
   */
  revertToVersion(versionId: string, classId: string, tab: string, specId?: string): string | null {
    const version = this.getVersion(versionId, classId, tab, specId);
    if (!version) return null;

    // Save current as new version before reverting
    this.saveVersion(classId, tab, version.content, specId, `Reverted to ${version.createdAt.toLocaleString()}`);
    return version.content;
  }

  /**
   * Compare two versions
   */
  compareVersions(
    versionId1: string,
    versionId2: string,
    classId: string,
    tab: string,
    specId?: string
  ): { added: string[]; removed: string[]; similarity: number } {
    const v1 = this.getVersion(versionId1, classId, tab, specId);
    const v2 = this.getVersion(versionId2, classId, tab, specId);

    if (!v1 || !v2) {
      return { added: [], removed: [], similarity: 0 };
    }

    const lines1 = v1.content.split('\n');
    const lines2 = v2.content.split('\n');

    const added = lines2.filter(line => !lines1.includes(line));
    const removed = lines1.filter(line => !lines2.includes(line));

    const commonLines = lines1.filter(line => lines2.includes(line)).length;
    const totalLines = Math.max(lines1.length, lines2.length);
    const similarity = totalLines > 0 ? Math.round((commonLines / totalLines) * 100) : 0;

    return { added, removed, similarity };
  }

  /**
   * Delete a version
   */
  deleteVersion(versionId: string, classId: string, tab: string, specId?: string): boolean {
    const key = `${classId}_${tab}_${specId || 'none'}`;
    const versions = this.versions.get(key);

    if (!versions) return false;

    const index = versions.findIndex(v => v.id === versionId);
    if (index === -1) return false;

    versions.splice(index, 1);
    this.save();
    this.notifyListeners();
    return true;
  }

  /**
   * Clear all versions for a guide
   */
  clearVersions(classId: string, tab: string, specId?: string): void {
    const key = `${classId}_${tab}_${specId || 'none'}`;
    this.versions.delete(key);
    this.save();
    this.notifyListeners();
  }

  /**
   * Save to localStorage
   */
  private save(): void {
    try {
      const data: Record<string, any[]> = {};
      this.versions.forEach((versions, key) => {
        data[key] = versions.map(v => ({
          ...v,
          createdAt: v.createdAt.toISOString(),
        }));
      });
      localStorage.setItem('wow_class_helper_versions', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save versions:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_versions');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, versions]: [string, any]) => {
          this.versions.set(
            key,
            versions.map((v: any) => ({
              ...v,
              createdAt: new Date(v.createdAt),
            }))
          );
        });
      }
    } catch (error) {
      console.warn('Failed to load versions:', error);
    }
  }
}

export const versioningService = new VersioningService();
versioningService.load();
