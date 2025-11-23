import type { WowClass, Specialization, Dungeon } from '../types.ts';
import { WOW_CLASSES, DUNGEONS } from '../constants.ts';

/**
 * Validates that a class exists in the constants
 */
export const validateClass = (wowClass: WowClass | null): wowClass is WowClass => {
  if (!wowClass) return false;
  if (typeof wowClass !== 'object') return false;
  if (!wowClass.id || !wowClass.name) return false;
  return WOW_CLASSES.some((c) => c.id === wowClass.id && c.name === wowClass.name);
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
  return wowClass.specs.some((s) => s.id === spec.id && s.name === spec.name);
};

/**
 * Validates that a dungeon exists in the constants
 */
export const validateDungeon = (dungeon: Dungeon | null): dungeon is Dungeon => {
  if (!dungeon) return false;
  if (typeof dungeon !== 'object') return false;
  if (!dungeon.name || !dungeon.expansion) return false;
  return DUNGEONS.some((d) => d.name === dungeon.name && d.expansion === dungeon.expansion);
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
export const validateSourceUrls = (
  urls: string
): { valid: boolean; urls: string[]; errors: string[] } => {
  const errors: string[] = [];
  const validUrls: string[] = [];

  if (!urls || urls.trim().length === 0) {
    return { valid: true, urls: [], errors: [] };
  }

  const urlList = urls.split('\n').filter((url) => url.trim() !== '');

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

// ============================================================================
// REUSABLE VALIDATORS
// ============================================================================

/**
 * Validates a string with optional length constraints
 */
export const validateString = (
  value: unknown,
  minLength = 0,
  maxLength = 1000
): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Value must be a string' };
  }

  if (value.length < minLength) {
    return { valid: false, error: `Minimum length is ${minLength} characters` };
  }

  if (value.length > maxLength) {
    return { valid: false, error: `Maximum length is ${maxLength} characters` };
  }

  return { valid: true };
};

/**
 * Validates an email address
 */
export const validateEmail = (value: unknown): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

/**
 * Validates a URL
 */
export const validateUrl = (value: unknown): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: 'URL must be a string' };
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validates a number with optional range constraints
 */
export const validateNumber = (
  value: unknown,
  min?: number,
  max?: number
): { valid: boolean; error?: string } => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: 'Value must be a number' };
  }

  if (min !== undefined && value < min) {
    return { valid: false, error: `Minimum value is ${min}` };
  }

  if (max !== undefined && value > max) {
    return { valid: false, error: `Maximum value is ${max}` };
  }

  return { valid: true };
};

/**
 * Validates an integer
 */
export const validateInteger = (value: unknown): { valid: boolean; error?: string } => {
  if (!Number.isInteger(value)) {
    return { valid: false, error: 'Value must be an integer' };
  }

  return { valid: true };
};

/**
 * Validates an array with optional length constraints
 */
export const validateArray = (
  value: unknown,
  minLength = 0,
  maxLength = 1000
): { valid: boolean; error?: string } => {
  if (!Array.isArray(value)) {
    return { valid: false, error: 'Value must be an array' };
  }

  if (value.length < minLength) {
    return { valid: false, error: `Minimum array length is ${minLength}` };
  }

  if (value.length > maxLength) {
    return { valid: false, error: `Maximum array length is ${maxLength}` };
  }

  return { valid: true };
};

/**
 * Validates that all items in an array pass a validator
 */
export const validateArrayOf = <T>(
  value: unknown,
  validator: (item: unknown) => item is T,
  minLength = 0,
  maxLength = 1000
): { valid: boolean; error?: string; invalidIndex?: number } => {
  const arrayValidation = validateArray(value, minLength, maxLength);
  if (!arrayValidation.valid) {
    return arrayValidation;
  }

  const arr = value as unknown[];
  for (let i = 0; i < arr.length; i++) {
    if (!validator(arr[i])) {
      return { valid: false, error: `Invalid item at index ${i}`, invalidIndex: i };
    }
  }

  return { valid: true };
};

/**
 * Validates an object against a schema
 */
export const validateObject = (
  value: unknown,
  schema: Record<string, (v: unknown) => { valid: boolean; error?: string }>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof value !== 'object' || value === null) {
    return { valid: false, errors: { _root: 'Value must be an object' } };
  }

  const obj = value as Record<string, unknown>;

  for (const [key, validator] of Object.entries(schema)) {
    const result = validator(obj[key]);
    if (!result.valid && result.error) {
      errors[key] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a search query
 */
export const validateSearchQuery = (query: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!query || query.trim().length === 0) {
    errors.push('Search query cannot be empty');
  }

  if (query.length < 2) {
    errors.push('Search query must be at least 2 characters');
  }

  if (query.length > 100) {
    errors.push('Search query cannot exceed 100 characters');
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(query)) {
    errors.push('Search query contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates admin configuration
 */
export const validateAdminConfig = (config: unknown): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof config !== 'object' || config === null) {
    errors.push('Configuration must be an object');
    return { valid: false, errors };
  }

  const cfg = config as Record<string, unknown>;

  // Validate sourceUrls if present
  if (cfg.sourceUrls !== undefined) {
    if (typeof cfg.sourceUrls !== 'string') {
      errors.push('Source URLs must be a string');
    } else {
      const urlValidation = validateSourceUrls(cfg.sourceUrls);
      if (!urlValidation.valid) {
        errors.push(...urlValidation.errors);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
