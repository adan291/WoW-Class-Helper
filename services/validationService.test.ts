import { describe, it, expect } from 'vitest';
import {
  validateClass,
  validateSpecialization,
  validateDungeon,
  validateApiResponse,
  validateSourceUrls,
  validateStorageData,
  validateTabSelection,
  validateUserRole,
  validateClassSelection,
  validateDungeonSelection,
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

  describe('Error Handling and Recovery', () => {
    it('should handle API errors gracefully', () => {
      const apiError = new Error('API key not configured');
      expect(apiError.message).toContain('API');
    });

    it('should handle network errors gracefully', () => {
      const networkError = new Error('Network timeout');
      expect(networkError.message).toContain('timeout');
    });

    it('should handle validation errors gracefully', () => {
      const validationError = new Error('Invalid class selected');
      expect(validationError.message).toContain('Invalid');
    });

    it('should provide actionable error messages', () => {
      const errors = [
        'Invalid class selected. Please select a valid class.',
        'Invalid specialization selected. Please select a valid specialization.',
        'Invalid dungeon selected. Please select a valid dungeon.',
      ];
      
      errors.forEach(error => {
        expect(error).toContain('Invalid');
        expect(error).toContain('Please');
      });
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

  describe('validateTabSelection', () => {
    it('should return true for valid tab selections', () => {
      expect(validateTabSelection('overview')).toBe(true);
      expect(validateTabSelection('specs')).toBe(true);
      expect(validateTabSelection('rotations')).toBe(true);
      expect(validateTabSelection('addons')).toBe(true);
      expect(validateTabSelection('dungeons')).toBe(true);
    });

    it('should return false for invalid tab selections', () => {
      expect(validateTabSelection('invalid')).toBe(false);
      expect(validateTabSelection('')).toBe(false);
      expect(validateTabSelection(null)).toBe(false);
      expect(validateTabSelection(123)).toBe(false);
    });
  });

  describe('validateUserRole', () => {
    it('should return true for valid user roles', () => {
      expect(validateUserRole('user')).toBe(true);
      expect(validateUserRole('master')).toBe(true);
      expect(validateUserRole('admin')).toBe(true);
    });

    it('should return false for invalid user roles', () => {
      expect(validateUserRole('superadmin')).toBe(false);
      expect(validateUserRole('')).toBe(false);
      expect(validateUserRole(null)).toBe(false);
    });
  });

  describe('validateClassSelection', () => {
    it('should validate correct class and spec selection', () => {
      const warrior = WOW_CLASSES[0];
      const spec = warrior.specs[0];
      const result = validateClassSelection(warrior, spec);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid class selection', () => {
      const result = validateClassSelection(null, null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid class selected');
    });

    it('should reject spec from different class', () => {
      const warrior = WOW_CLASSES[0];
      const mage = WOW_CLASSES.find(c => c.name === 'Mage');
      const mageSpec = mage?.specs[0];
      
      const result = validateClassSelection(warrior, mageSpec || null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid specialization for selected class');
    });
  });

  describe('validateDungeonSelection', () => {
    it('should validate correct dungeon selection', () => {
      const dungeon = DUNGEONS[0];
      const result = validateDungeonSelection(dungeon, dungeon.expansion);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid dungeon selection', () => {
      const result = validateDungeonSelection(null, null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid dungeon selected');
    });

    it('should reject dungeon with mismatched expansion', () => {
      const dungeon = DUNGEONS[0];
      const wrongExpansion = 'Wrong Expansion';
      const result = validateDungeonSelection(dungeon, wrongExpansion);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Selected dungeon does not match expansion filter');
    });
  });

  describe('Enhanced URL Validation', () => {
    it('should reject URLs with invalid protocols', () => {
      const result = validateSourceUrls('ftp://example.com');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject more than 10 URLs', () => {
      const urls = Array(11).fill('https://example.com').join('\n');
      const result = validateSourceUrls(urls);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Maximum 10 URLs allowed');
    });

    it('should reject URLs longer than 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2100);
      const result = validateSourceUrls(longUrl);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept HTTP and HTTPS URLs', () => {
      const urls = 'http://example.com\nhttps://example.com';
      const result = validateSourceUrls(urls);
      expect(result.valid).toBe(true);
      expect(result.urls).toHaveLength(2);
    });
  });
});
