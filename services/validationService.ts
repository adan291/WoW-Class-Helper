import type { WowClass, Specialization, Dungeon } from '../types.ts';
import { WOW_CLASSES, DUNGEONS } from '../constants.ts';

/**
 * Validates that a class exists in the constants
 */
export const validateClass = (wowClass: WowClass | null): wowClass is WowClass => {
  if (!wowClass) return false;
  return WOW_CLASSES.some(c => c.id === wowClass.id && c.name === wowClass.name);
};

/**
 * Validates that a specialization belongs to the given class
 */
export const validateSpecialization = (
  spec: Specialization | null,
  wowClass: WowClass
): spec is Specialization => {
  if (!spec) return false;
  return wowClass.specs.some(s => s.id === spec.id && s.name === spec.name);
};

/**
 * Validates that a dungeon exists in the constants
 */
export const validateDungeon = (dungeon: Dungeon | null): dungeon is Dungeon => {
  if (!dungeon) return false;
  return DUNGEONS.some(d => d.name === dungeon.name && d.expansion === dungeon.expansion);
};

/**
 * Validates API response has required structure
 */
export const validateApiResponse = (response: unknown): response is string => {
  return typeof response === 'string' && response.trim().length > 0;
};

/**
 * Validates custom source URLs format
 */
export const validateSourceUrls = (urls: string): { valid: boolean; urls: string[]; errors: string[] } => {
  const errors: string[] = [];
  const validUrls: string[] = [];

  if (!urls || urls.trim().length === 0) {
    return { valid: true, urls: [], errors: [] };
  }

  const urlList = urls.split('\n').filter(url => url.trim() !== '');

  urlList.forEach((url, index) => {
    try {
      new URL(url.trim());
      validUrls.push(url.trim());
    } catch {
      errors.push(`Line ${index + 1}: Invalid URL format - "${url.trim()}"`);
    }
  });

  return {
    valid: validUrls.length > 0 || urlList.length === 0,
    urls: validUrls,
    errors,
  };
};

/**
 * Validates localStorage data structure
 */
export const validateStorageData = (data: unknown): data is Record<string, unknown> => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};
