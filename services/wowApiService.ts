/**
 * WoW API Service
 * Integrates with Blizzard WoW API for real data
 */

export interface WowClass {
  id: number;
  name: string;
  powerType: string;
}

export interface WowSpec {
  id: number;
  classId: number;
  name: string;
  role: string;
  icon: string;
}

export interface WowItem {
  id: number;
  name: string;
  quality: string;
  itemLevel: number;
  slot: string;
  stats: Record<string, number>;
}

export interface WowSpell {
  id: number;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
}

export interface PatchInfo {
  version: string;
  releaseDate: string;
  changes: string[];
}

class WowApiService {
  private readonly CACHE_KEY = 'wow_api_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly API_BASE = 'https://us.api.blizzard.com/data/wow';

  /**
   * Get all WoW classes
   */
  async getClasses(): Promise<WowClass[]> {
    const cached = this.getFromCache('classes');
    if (cached) return cached;

    try {
      // Mock data for now (real API would require authentication)
      const classes: WowClass[] = [
        { id: 1, name: 'Warrior', powerType: 'Rage' },
        { id: 2, name: 'Paladin', powerType: 'Mana' },
        { id: 3, name: 'Hunter', powerType: 'Focus' },
        { id: 4, name: 'Rogue', powerType: 'Energy' },
        { id: 5, name: 'Priest', powerType: 'Mana' },
        { id: 6, name: 'Death Knight', powerType: 'Runic Power' },
        { id: 7, name: 'Shaman', powerType: 'Mana' },
        { id: 8, name: 'Mage', powerType: 'Mana' },
        { id: 9, name: 'Warlock', powerType: 'Mana' },
        { id: 10, name: 'Monk', powerType: 'Chi' },
        { id: 11, name: 'Druid', powerType: 'Mana' },
        { id: 12, name: 'Demon Hunter', powerType: 'Fury' },
        { id: 13, name: 'Evoker', powerType: 'Mana' },
      ];

      this.saveToCache('classes', classes);
      return classes;
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      return [];
    }
  }

  /**
   * Get specializations for a class
   */
  async getSpecializations(classId: number): Promise<WowSpec[]> {
    const cached = this.getFromCache(`specs_${classId}`);
    if (cached) return cached;

    try {
      // Mock data for now
      const specsByClass: Record<number, WowSpec[]> = {
        1: [
          { id: 71, classId: 1, name: 'Arms', role: 'DPS', icon: 'warrior_arms' },
          { id: 72, classId: 1, name: 'Fury', role: 'DPS', icon: 'warrior_fury' },
          { id: 73, classId: 1, name: 'Protection', role: 'Tank', icon: 'warrior_protection' },
        ],
        2: [
          { id: 65, classId: 2, name: 'Holy', role: 'Healer', icon: 'paladin_holy' },
          { id: 66, classId: 2, name: 'Protection', role: 'Tank', icon: 'paladin_protection' },
          { id: 70, classId: 2, name: 'Retribution', role: 'DPS', icon: 'paladin_retribution' },
        ],
      };

      const specs = specsByClass[classId] || [];
      this.saveToCache(`specs_${classId}`, specs);
      return specs;
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
      return [];
    }
  }

  /**
   * Get current patch information
   */
  async getPatchInfo(): Promise<PatchInfo | null> {
    const cached = this.getFromCache('patch_info');
    if (cached) return cached;

    try {
      // Mock data for now
      const patchInfo: PatchInfo = {
        version: '10.2.5',
        releaseDate: '2024-01-16',
        changes: [
          'Balance adjustments for all classes',
          'New raid tier released',
          'Dungeon difficulty rebalancing',
          'PvP season updates',
        ],
      };

      this.saveToCache('patch_info', patchInfo);
      return patchInfo;
    } catch (error) {
      console.error('Failed to fetch patch info:', error);
      return null;
    }
  }

  /**
   * Get item information
   */
  async getItem(itemId: number): Promise<WowItem | null> {
    const cached = this.getFromCache(`item_${itemId}`);
    if (cached) return cached;

    try {
      // Mock data for now
      const item: WowItem = {
        id: itemId,
        name: `Item ${itemId}`,
        quality: 'epic',
        itemLevel: 489,
        slot: 'head',
        stats: {
          stamina: 100,
          intellect: 80,
          haste: 60,
        },
      };

      this.saveToCache(`item_${itemId}`, item);
      return item;
    } catch (error) {
      console.error('Failed to fetch item:', error);
      return null;
    }
  }

  /**
   * Get spell information
   */
  async getSpell(spellId: number): Promise<WowSpell | null> {
    const cached = this.getFromCache(`spell_${spellId}`);
    if (cached) return cached;

    try {
      // Mock data for now
      const spell: WowSpell = {
        id: spellId,
        name: `Spell ${spellId}`,
        description: 'A powerful spell',
        icon: 'spell_icon',
        cooldown: 10,
      };

      this.saveToCache(`spell_${spellId}`, spell);
      return spell;
    } catch (error) {
      console.error('Failed to fetch spell:', error);
      return null;
    }
  }

  /**
   * Get realm status
   */
  async getRealmStatus(realmName: string): Promise<{ status: string; population: string } | null> {
    try {
      // Mock data for now
      return {
        status: 'up',
        population: 'high',
      };
    } catch (error) {
      console.error('Failed to fetch realm status:', error);
      return null;
    }
  }

  /**
   * Get character information
   */
  async getCharacter(realm: string, characterName: string): Promise<any | null> {
    try {
      // Mock data for now
      return {
        name: characterName,
        realm: realm,
        class: 'Warrior',
        spec: 'Arms',
        level: 70,
        itemLevel: 489,
      };
    } catch (error) {
      console.error('Failed to fetch character:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch {
      console.error('Failed to clear cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    try {
      const data = localStorage.getItem(this.CACHE_KEY);
      if (!data) return { size: 0, entries: 0 };

      const cache = JSON.parse(data);
      return {
        size: new Blob([data]).size,
        entries: Object.keys(cache).length,
      };
    } catch {
      return { size: 0, entries: 0 };
    }
  }

  // Private helper methods

  private getFromCache(key: string): any {
    try {
      const data = localStorage.getItem(this.CACHE_KEY);
      if (!data) return null;

      const cache = JSON.parse(data);
      const entry = cache[key];

      if (!entry) return null;

      // Check if cache is expired
      if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
        delete cache[key];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      return entry.value;
    } catch {
      return null;
    }
  }

  private saveToCache(key: string, value: any): void {
    try {
      const data = localStorage.getItem(this.CACHE_KEY);
      const cache = data ? JSON.parse(data) : {};

      cache[key] = {
        value,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch {
      console.error('Failed to save to cache');
    }
  }
}

export const wowApiService = new WowApiService();
