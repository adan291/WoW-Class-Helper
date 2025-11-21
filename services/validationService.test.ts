import { describe, it, expect } from 'vitest';
import {
  validateString,
  validateEmail,
  validateUrl,
  validateNumber,
  validateInteger,
  validateArray,
  validateArrayOf,
  validateObject,
  validateSearchQuery,
  validateAdminConfig,
  validateClass,
  validateSpecialization,
  validateDungeon,
  validateApiResponse,
  validateSourceUrls,
  validateTabSelection,
  validateUserRole,
  validateClassSelection,
  validateDungeonSelection,
} from './validationService';
import { WOW_CLASSES, DUNGEONS } from '../constants';

describe('validationService', () => {
  describe('validateString', () => {
    it('should accept valid strings', () => {
      const result = validateString('hello');
      expect(result.valid).toBe(true);
    });

    it('should reject non-strings', () => {
      const result = validateString(123);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Value must be a string');
    });

    it('should enforce minimum length', () => {
      const result = validateString('hi', 3);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum length is 3');
    });

    it('should enforce maximum length', () => {
      const result = validateString('hello world', 0, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum length is 5');
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid emails', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
    });

    it('should reject non-strings', () => {
      const result = validateEmail(123);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTP URLs', () => {
      const result = validateUrl('http://example.com');
      expect(result.valid).toBe(true);
    });

    it('should accept valid HTTPS URLs', () => {
      const result = validateUrl('https://example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = validateUrl('not a url');
      expect(result.valid).toBe(false);
    });

    it('should reject non-HTTP protocols', () => {
      const result = validateUrl('ftp://example.com');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateNumber', () => {
    it('should accept valid numbers', () => {
      const result = validateNumber(42);
      expect(result.valid).toBe(true);
    });

    it('should reject non-numbers', () => {
      const result = validateNumber('42');
      expect(result.valid).toBe(false);
    });

    it('should enforce minimum value', () => {
      const result = validateNumber(5, 10);
      expect(result.valid).toBe(false);
    });

    it('should enforce maximum value', () => {
      const result = validateNumber(15, 0, 10);
      expect(result.valid).toBe(false);
    });

    it('should reject NaN', () => {
      const result = validateNumber(NaN);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInteger', () => {
    it('should accept integers', () => {
      const result = validateInteger(42);
      expect(result.valid).toBe(true);
    });

    it('should reject floats', () => {
      const result = validateInteger(42.5);
      expect(result.valid).toBe(false);
    });

    it('should reject non-numbers', () => {
      const result = validateInteger('42');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateArray', () => {
    it('should accept valid arrays', () => {
      const result = validateArray([1, 2, 3]);
      expect(result.valid).toBe(true);
    });

    it('should reject non-arrays', () => {
      const result = validateArray('not an array');
      expect(result.valid).toBe(false);
    });

    it('should enforce minimum length', () => {
      const result = validateArray([1], 2);
      expect(result.valid).toBe(false);
    });

    it('should enforce maximum length', () => {
      const result = validateArray([1, 2, 3], 0, 2);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateArrayOf', () => {
    it('should validate array of strings', () => {
      const isString = (v: unknown): v is string => typeof v === 'string';
      const result = validateArrayOf(['a', 'b', 'c'], isString);
      expect(result.valid).toBe(true);
    });

    it('should reject mixed types', () => {
      const isString = (v: unknown): v is string => typeof v === 'string';
      const result = validateArrayOf(['a', 1, 'c'], isString);
      expect(result.valid).toBe(false);
      expect(result.invalidIndex).toBe(1);
    });
  });

  describe('validateObject', () => {
    it('should validate object against schema', () => {
      const schema = {
        name: (v: unknown) => validateString(v, 1, 100),
        age: (v: unknown) => validateNumber(v, 0, 150),
      };

      const result = validateObject({ name: 'John', age: 30 }, schema);
      expect(result.valid).toBe(true);
    });

    it('should collect errors for invalid fields', () => {
      const schema = {
        name: (v: unknown) => validateString(v, 1, 100),
        age: (v: unknown) => validateNumber(v, 0, 150),
      };

      const result = validateObject({ name: '', age: 200 }, schema);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('validateSearchQuery', () => {
    it('should accept valid search queries', () => {
      const result = validateSearchQuery('warrior');
      expect(result.valid).toBe(true);
    });

    it('should reject empty queries', () => {
      const result = validateSearchQuery('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Search query cannot be empty');
    });

    it('should reject queries shorter than 2 chars', () => {
      const result = validateSearchQuery('a');
      expect(result.valid).toBe(false);
    });

    it('should reject queries longer than 100 chars', () => {
      const result = validateSearchQuery('a'.repeat(101));
      expect(result.valid).toBe(false);
    });

    it('should reject invalid characters', () => {
      const result = validateSearchQuery('warrior@#$');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAdminConfig', () => {
    it('should accept valid config', () => {
      const result = validateAdminConfig({ sourceUrls: '' });
      expect(result.valid).toBe(true);
    });

    it('should reject non-objects', () => {
      const result = validateAdminConfig('not an object');
      expect(result.valid).toBe(false);
    });

    it('should validate sourceUrls if present', () => {
      const result = validateAdminConfig({ sourceUrls: 'invalid-url' });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateClass', () => {
    it('should accept valid class', () => {
      const validClass = WOW_CLASSES[0];
      const result = validateClass(validClass);
      expect(result).toBe(true);
    });

    it('should reject null', () => {
      const result = validateClass(null);
      expect(result).toBe(false);
    });

    it('should reject invalid class', () => {
      const result = validateClass({ id: 'invalid', name: 'Invalid', color: '', specs: [] });
      expect(result).toBe(false);
    });
  });

  describe('validateTabSelection', () => {
    it('should accept valid tabs', () => {
      expect(validateTabSelection('overview')).toBe(true);
      expect(validateTabSelection('specs')).toBe(true);
      expect(validateTabSelection('rotations')).toBe(true);
    });

    it('should reject invalid tabs', () => {
      expect(validateTabSelection('invalid')).toBe(false);
    });
  });

  describe('validateUserRole', () => {
    it('should accept valid roles', () => {
      expect(validateUserRole('user')).toBe(true);
      expect(validateUserRole('master')).toBe(true);
      expect(validateUserRole('admin')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(validateUserRole('invalid')).toBe(false);
    });
  });

  describe('validateSourceUrls', () => {
    it('should accept valid URLs', () => {
      const result = validateSourceUrls('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.urls).toContain('https://example.com');
    });

    it('should reject invalid URLs', () => {
      const result = validateSourceUrls('not a url');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should enforce maximum URLs', () => {
      const urls = Array(11).fill('https://example.com').join('\n');
      const result = validateSourceUrls(urls);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateApiResponse', () => {
    it('should accept valid responses', () => {
      const result = validateApiResponse('Valid response');
      expect(result).toBe(true);
    });

    it('should reject empty responses', () => {
      const result = validateApiResponse('');
      expect(result).toBe(false);
    });

    it('should reject non-strings', () => {
      const result = validateApiResponse(123);
      expect(result).toBe(false);
    });
  });

  describe('validateClassSelection', () => {
    it('should accept valid selection', () => {
      const validClass = WOW_CLASSES[0];
      const validSpec = validClass.specs[0];
      const result = validateClassSelection(validClass, validSpec);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid class', () => {
      const result = validateClassSelection(null, null);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDungeonSelection', () => {
    it('should accept valid dungeon', () => {
      const validDungeon = DUNGEONS[0];
      const result = validateDungeonSelection(validDungeon, validDungeon.expansion);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid dungeon', () => {
      const result = validateDungeonSelection(null, null);
      expect(result.valid).toBe(false);
    });
  });
});
