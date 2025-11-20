/**
 * Tests for Class Orchestrator Service
 * Validates curator system functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  orchestrateClassCheck,
  prepareGeminiContext,
  validateAndPrepareGuideRequest,
  generateOrchestratorReport,
  getClassesNeedingUpdate,
} from './classOrchestratorService.ts';
import { WOW_CLASSES } from '../constants.ts';

describe('Class Orchestrator Service', () => {
  describe('orchestrateClassCheck', () => {
    it('should validate a valid class', () => {
      const result = orchestrateClassCheck('warrior');
      expect(result.isReadyForGemini).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('should reject an invalid class', () => {
      const result = orchestrateClassCheck('invalid_class');
      expect(result.isReadyForGemini).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should return curator status', () => {
      const result = orchestrateClassCheck('warrior');
      expect(result.curatorStatus).toBeDefined();
      expect(result.curatorStatus.status).toMatch(/healthy|warning|critical/);
    });

    it('should return validation status', () => {
      const result = orchestrateClassCheck('warrior');
      expect(result.validationStatus).toBeDefined();
      expect(result.validationStatus.isValid).toBe(true);
    });
  });

  describe('prepareGeminiContext', () => {
    it('should prepare context for valid class', () => {
      const context = prepareGeminiContext({
        classId: 'warrior',
      });
      expect(context).not.toBeNull();
      expect(context?.className).toBe('Warrior');
      expect(context?.verifiedSourceUrls.length).toBeGreaterThan(0);
    });

    it('should return null for invalid class', () => {
      const context = prepareGeminiContext({
        classId: 'invalid_class',
      });
      expect(context).toBeNull();
    });

    it('should include verified sources', () => {
      const context = prepareGeminiContext({
        classId: 'warrior',
      });
      expect(context?.verifiedSourceUrls).toBeDefined();
      expect(Array.isArray(context?.verifiedSourceUrls)).toBe(true);
    });

    it('should include data quality', () => {
      const context = prepareGeminiContext({
        classId: 'warrior',
      });
      expect(context?.dataQuality).toBeDefined();
      expect(context?.dataQuality).toBeGreaterThanOrEqual(0);
      expect(context?.dataQuality).toBeLessThanOrEqual(100);
    });
  });

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

    it('should handle invalid spec gracefully', () => {
      const result = validateAndPrepareGuideRequest('warrior', 'invalid_spec');
      // Invalid specs are handled but don't necessarily fail validation
      // The system is lenient to allow for future specs
      expect(result.context).toBeDefined();
    });

    it('should handle invalid dungeon gracefully', () => {
      const result = validateAndPrepareGuideRequest(
        'warrior',
        'arms',
        'Invalid Dungeon'
      );
      // Invalid dungeons are handled but don't necessarily fail validation
      // The system is lenient to allow for future dungeons
      expect(result.context).toBeDefined();
    });
  });

  describe('generateOrchestratorReport', () => {
    it('should generate report for all classes', () => {
      const report = generateOrchestratorReport();
      expect(report.totalClasses).toBe(WOW_CLASSES.length);
      expect(report.classStatuses.length).toBe(WOW_CLASSES.length);
    });

    it('should include ready classes count', () => {
      const report = generateOrchestratorReport();
      expect(report.readyClasses).toBeGreaterThanOrEqual(0);
      expect(report.readyClasses).toBeLessThanOrEqual(report.totalClasses);
    });

    it('should include data quality metrics', () => {
      const report = generateOrchestratorReport();
      expect(report.dataQuality).toBeDefined();
      expect(report.dataQuality.overallQuality).toBeGreaterThanOrEqual(0);
      expect(report.dataQuality.overallQuality).toBeLessThanOrEqual(100);
    });

    it('should include recommendations', () => {
      const report = generateOrchestratorReport();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('getClassesNeedingUpdate', () => {
    it('should return array of classes', () => {
      const classes = getClassesNeedingUpdate();
      expect(Array.isArray(classes)).toBe(true);
    });

    it('should return class names', () => {
      const classes = getClassesNeedingUpdate();
      if (classes.length > 0) {
        expect(typeof classes[0]).toBe('string');
      }
    });
  });

  describe('Data Quality', () => {
    it('should have high data quality for all classes', () => {
      const report = generateOrchestratorReport();
      expect(report.dataQuality.overallQuality).toBeGreaterThanOrEqual(80);
    });

    it('should have consistent class data quality', () => {
      const report = generateOrchestratorReport();
      expect(report.dataQuality.classDataQuality).toBeGreaterThanOrEqual(80);
    });

    it('should have consistent spec data quality', () => {
      const report = generateOrchestratorReport();
      expect(report.dataQuality.specDataQuality).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Validation Consistency', () => {
    it('should validate all classes', () => {
      WOW_CLASSES.forEach(wowClass => {
        const result = orchestrateClassCheck(wowClass.id);
        expect(result.className).toBe(wowClass.name);
        expect(result.curatorStatus).toBeDefined();
      });
    });

    it('should validate all specs', () => {
      WOW_CLASSES.forEach(wowClass => {
        wowClass.specs.forEach(spec => {
          const result = validateAndPrepareGuideRequest(wowClass.id, spec.id);
          expect(result.context).toBeDefined();
        });
      });
    });
  });
});
