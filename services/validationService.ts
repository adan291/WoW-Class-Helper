import type { WowClass, Specialization, Dungeon } from '../types.ts';
import { WOW_CLASSES, DUNGEONS } from '../constants.ts';

/**
 * Validates that a class exists in the constants
 */
export const validateClass = (wowClass: WowClass | null): wowClass is WowClass => {
  if (!wowClass) return false;
  if (typeof wowClass !== 'object') return false;
  if (!wowClass.id || !wowClass.name) return false;
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
  if (typeof spec !== 'object') return false;
  if (!spec.id || !spec.name) return false;
  if (!validateClass(wowClass)) return false;
  return wowClass.specs.some(s => s.id === spec.id && s.name === spec.name);
};

/**
 * Validates that a dungeon exists in the constants
 */
export const validateDungeon = (dungeon: Dungeon | null): dungeon is Dungeon => {
  if (!dungeon) return false;
  if (typeof dungeon !== 'object') return false;
  if (!dungeon.name || !dungeon.expansion) return false;
  return DUNGEONS.some(d => d.name === dungeon.name && d.expansion === dungeon.expansion);
};

/**
 * Validates API response has required structure
 */
export const validateApiResponse = (response: unknown): response is string => {
  if (typeof response !== 'string') return false;
  const trimmed = response.trim();
  return trimmed.length > 0 && trimmed.length < 100000; // Reasonable upper limit
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

  if (urlList.length > 10) {
    errors.push('Maximum 10 URLs allowed');
    return { valid: false, urls: [], errors };
  }

  urlList.forEach((url, index) => {
    const trimmedUrl = url.trim();
    
    // Check URL length
    if (trimmedUrl.length > 2048) {
      errors.push(`Line ${index + 1}: URL is too long (max 2048 characters)`);
      return;
    }

    try {
      const urlObj = new URL(trimmedUrl);
      // Validate protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push(`Line ${index + 1}: Only HTTP and HTTPS protocols are allowed`);
        return;
      }
      validUrls.push(trimmedUrl);
    } catch {
      errors.push(`Line ${index + 1}: Invalid URL format - "${trimmedUrl}"`);
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

/**
 * Validates tab selection
 */
export const validateTabSelection = (tab: unknown): tab is string => {
  const validTabs = ['overview', 'specs', 'rotations', 'addons', 'dungeons'];
  return typeof tab === 'string' && validTabs.includes(tab);
};

/**
 * Validates user role
 */
export const validateUserRole = (role: unknown): role is string => {
  const validRoles = ['user', 'master', 'admin'];
  return typeof role === 'string' && validRoles.includes(role);
};

/**
 * Comprehensive validation for class selection
 */
export const validateClassSelection = (
  wowClass: WowClass | null,
  spec: Specialization | null
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateClass(wowClass)) {
    errors.push('Invalid class selected');
  }

  if (wowClass && !validateSpecialization(spec, wowClass)) {
    errors.push('Invalid specialization for selected class');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Comprehensive validation for dungeon selection
 */
export const validateDungeonSelection = (
  dungeon: Dungeon | null,
  expansion: string | null
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateDungeon(dungeon)) {
    errors.push('Invalid dungeon selected');
  }

  if (dungeon && expansion && dungeon.expansion !== expansion) {
    errors.push('Selected dungeon does not match expansion filter');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
