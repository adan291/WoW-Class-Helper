/**
 * Tests for Class Orchestrator Service
 * Validates guide request preparation
 */

import { describe, it, expect } from 'vitest';
import { validateAndPrepareGuideRequest } from './classOrchestratorService.ts';
import { WOW_CLASSES } from '../constants.ts';

describe('Class Orchestrator Service', () => {
  describe('validateAndPrepareGuideRequest', () => {
    it('should validate class only', () => {
      const result = validateAndPrepareGuideRequest('warrior');
      expect(result.isValid).toBe(true);
      expect(result.context).not.toBeNull();
    });

    it('should validate class and spec', () => {
      const result = validateAndPrepareGuideRequest('warrior', 'arms');
      expect(result.isValid).toBe(true);
      expect(result.context?.specId).toBe('arms');
      expect(result.context?.specName).toBe('Arms');
    });

    it('should validate class, spec, and dungeon', () => {
      const result = validateAndPrepareGuideRequest(
        'warrior',
        'arms',
        'Ara-Kara, City of Echoes'
      );
      expect(result.isValid).toBe(true);
      expect(result.context?.dungeonName).toBe('Ara-Kara, City of Echoes');
    });

    it('should reject invalid class', () => {
      const result = validateAndPrepareGuideRequest('invalid_class');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid spec', () => {
      const result = validateAndPrepareGuideRequest('warrior', 'invalid_spec');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should include context for valid request', () => {
      const result = validateAndPrepareGuideRequest('warrior');
      expect(result.context).toBeDefined();
      expect(result.context?.classId).toBe('warrior');
      expect(result.context?.className).toBe('Warrior');
      expect(result.context?.dataQuality).toBe(100);
      expect(result.context?.isValid).toBe(true);
    });

    it('should handle custom source URLs', () => {
      const customUrls = ['https://example.com/guide'];
      const result = validateAndPrepareGuideRequest('warrior', undefined, undefined, customUrls);
      expect(result.isValid).toBe(true);
      expect(result.context?.verifiedSourceUrls).toContain('https://example.com/guide');
    });

    it('should validate all classes', () => {
      WOW_CLASSES.forEach(wowClass => {
        const result = validateAndPrepareGuideRequest(wowClass.id);
        expect(result.isValid).toBe(true);
        expect(result.context?.className).toBe(wowClass.name);
      });
    });

    it('should validate all specs for each class', () => {
      WOW_CLASSES.forEach(wowClass => {
        wowClass.specs.forEach(spec => {
          const result = validateAndPrepareGuideRequest(wowClass.id, spec.id);
          expect(result.isValid).toBe(true);
          expect(result.context?.specName).toBe(spec.name);
        });
      });
    });

    it('should return no errors for valid requests', () => {
      const result = validateAndPrepareGuideRequest('warrior', 'arms');
      expect(result.errors.length).toBe(0);
    });

    it('should have high data quality', () => {
      const result = validateAndPrepareGuideRequest('warrior');
      expect(result.context?.dataQuality).toBeGreaterThanOrEqual(80);
    });
  });
});
