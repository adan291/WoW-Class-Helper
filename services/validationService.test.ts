import { describe, it, expect } from 'vitest';
import {
  validateClass,
  validateSpecialization,
  validateDungeon,
  validateApiResponse,
  validateSourceUrls,
  validateStorageData,
} from './validationService.ts';
import { WOW_CLASSES, DUNGEONS } from '../constants.ts';

describe('validationService', () => {
  describe('validateClass', () => {
    it('should return true for valid class', () => {
      const validClass = WOW_CLASSES[0];
      expect(validateClass(validClass)).toBe(true);
    });

    it('should return false for null', () => {
      expect(validateClass(null)).toBe(false);
    });

    it('should return false for invalid class', () => {
      expect(validateClass({ id: 'invalid', name: 'Invalid', color: '#000', specs: [] })).toBe(false);
    });
  });

  describe('validateSpecialization', () => {
    it('should return true for valid spec in class', () => {
      const wowClass = WOW_CLASSES[0];
      const spec = wowClass.specs[0];
      expect(validateSpecialization(spec, wowClass)).toBe(true);
    });

    it('should return false for null spec', () => {
      const wowClass = WOW_CLASSES[0];
      expect(validateSpecialization(null, wowClass)).toBe(false);
    });

    it('should return false for spec not in class', () => {
      const wowClass = WOW_CLASSES[0];
      const invalidSpec = { id: 'invalid', name: 'Invalid', role: 'Tank' as const };
      expect(validateSpecialization(invalidSpec, wowClass)).toBe(false);
    });
  });

  describe('validateDungeon', () => {
    it('should return true for valid dungeon', () => {
      const validDungeon = DUNGEONS[0];
      expect(validateDungeon(validDungeon)).toBe(true);
    });

    it('should return false for null', () => {
      expect(validateDungeon(null)).toBe(false);
    });

    it('should return false for invalid dungeon', () => {
      expect(validateDungeon({ name: 'Invalid', expansion: 'Invalid' })).toBe(false);
    });
  });

  describe('validateApiResponse', () => {
    it('should return true for valid string response', () => {
      expect(validateApiResponse('Valid response')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(validateApiResponse('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(validateApiResponse('   ')).toBe(false);
    });

    it('should return false for non-string', () => {
      expect(validateApiResponse(123)).toBe(false);
      expect(validateApiResponse(null)).toBe(false);
      expect(validateApiResponse(undefined)).toBe(false);
    });
  });

  describe('validateSourceUrls', () => {
    it('should return valid for empty string', () => {
      const result = validateSourceUrls('');
      expect(result.valid).toBe(true);
      expect(result.urls).toEqual([]);
    });

    it('should return valid for single valid URL', () => {
      const result = validateSourceUrls('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.urls).toContain('https://example.com');
      expect(result.errors).toEqual([]);
    });

    it('should return valid for multiple valid URLs', () => {
      const urls = 'https://example.com\nhttps://test.com';
      const result = validateSourceUrls(urls);
      expect(result.valid).toBe(true);
      expect(result.urls).toHaveLength(2);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid for malformed URLs', () => {
      const result = validateSourceUrls('not a url');
      expect(result.valid).toBe(false);
      expect(result.urls).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should filter out invalid URLs and keep valid ones', () => {
      const urls = 'https://example.com\ninvalid\nhttps://test.com';
      const result = validateSourceUrls(urls);
      expect(result.valid).toBe(true);
      expect(result.urls).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
    });

    it('should trim whitespace from URLs', () => {
      const result = validateSourceUrls('  https://example.com  ');
      expect(result.urls).toContain('https://example.com');
    });
  });

  describe('validateStorageData', () => {
    it('should return true for valid object', () => {
      expect(validateStorageData({ key: 'value' })).toBe(true);
    });

    it('should return false for null', () => {
      expect(validateStorageData(null)).toBe(false);
    });

    it('should return false for array', () => {
      expect(validateStorageData([1, 2, 3])).toBe(false);
    });

    it('should return false for primitive types', () => {
      expect(validateStorageData('string')).toBe(false);
      expect(validateStorageData(123)).toBe(false);
      expect(validateStorageData(true)).toBe(false);
    });
  });
});
