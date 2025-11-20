/**
 * Data Integrity Validator
 * 
 * Ensures that data used by Gemini API is accurate, current, and verified.
 * Prevents hallucinations by validating against known good sources.
 */

import { WOW_CLASSES, DUNGEONS } from '../constants.ts';
import { validateClassData } from './dataCurator.ts';

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-100
  warnings: string[];
  errors: string[];
  verifiedSources: string[];
}

export interface DataQualityMetrics {
  classDataQuality: number;
  specDataQuality: number;
  dungeonDataQuality: number;
  overallQuality: number;
  lastValidated: Date;
}

/**
 * Validates that a WoW class exists and is properly configured
 */
export const validateWowClass = (classId: string): ValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if class exists
  const wowClass = WOW_CLASSES.find(c => c.id === classId);
  if (!wowClass) {
    errors.push(`Class not found: ${classId}`);
    return {
      isValid: false,
      confidence: 0,
      warnings,
      errors,
      verifiedSources: [],
    };
  }

  // Validate class structure
  if (!wowClass.name || !wowClass.color || !wowClass.specs) {
    errors.push(`Invalid class structure for: ${classId}`);
  }

  if (wowClass.specs.length === 0) {
    errors.push(`Class has no specializations: ${classId}`);
  }

  // Validate each spec
  wowClass.specs.forEach(spec => {
    if (!spec.id || !spec.name || !spec.role) {
      errors.push(`Invalid spec structure in ${wowClass.name}: ${spec.id}`);
    }

    const validRoles = ['Tank', 'Healer', 'Damage'];
    if (!validRoles.includes(spec.role)) {
      errors.push(`Invalid role for ${spec.name}: ${spec.role}`);
    }
  });

  // Check curator status
  const curatorReport = validateClassData(classId);
  if (curatorReport.status === 'critical') {
    warnings.push(`Curator report shows critical issues for ${wowClass.name}`);
  } else if (curatorReport.status === 'warning') {
    warnings.push(`Curator report shows warnings for ${wowClass.name}`);
  }

  const confidence = Math.max(0, 100 - (errors.length * 20 + warnings.length * 10));

  return {
    isValid: errors.length === 0,
    confidence,
    warnings,
    errors,
    verifiedSources: [],
  };
};

/**
 * Validates that a specialization exists for a class
 */
export const validateSpecialization = (
  classId: string,
  specId: string
): ValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // First validate the class
  const classValidation = validateWowClass(classId);
  if (!classValidation.isValid) {
    return classValidation;
  }

  const wowClass = WOW_CLASSES.find(c => c.id === classId);
  if (!wowClass) {
    errors.push(`Class not found: ${classId}`);
    return {
      isValid: false,
      confidence: 0,
      warnings,
      errors,
      verifiedSources: [],
    };
  }

  // Check if spec exists
  const spec = wowClass.specs.find(s => s.id === specId);
  if (!spec) {
    errors.push(`Specialization not found: ${specId} for class ${classId}`);
    return {
      isValid: false,
      confidence: 0,
      warnings,
      errors,
      verifiedSources: [],
    };
  }

  const confidence = Math.max(0, 100 - (errors.length * 20 + warnings.length * 10));

  return {
    isValid: errors.length === 0,
    confidence,
    warnings,
    errors,
    verifiedSources: classValidation.verifiedSources,
  };
};

/**
 * Validates that a dungeon exists in the database
 */
export const validateDungeon = (dungeonName: string): ValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  const dungeon = DUNGEONS.find(d => d.name.toLowerCase() === dungeonName.toLowerCase());
  
  if (!dungeon) {
    errors.push(`Dungeon not found: ${dungeonName}`);
    return {
      isValid: false,
      confidence: 0,
      warnings,
      errors,
      verifiedSources: [],
    };
  }

  // Validate dungeon structure
  if (!dungeon.expansion) {
    errors.push(`Dungeon missing expansion info: ${dungeonName}`);
  }

  const confidence = Math.max(0, 100 - (errors.length * 20 + warnings.length * 10));

  return {
    isValid: errors.length === 0,
    confidence,
    warnings,
    errors,
    verifiedSources: [],
  };
};

/**
 * Validates a complete guide request before sending to Gemini
 */
export const validateGuideRequest = (
  classId: string,
  specId?: string,
  dungeonName?: string
): ValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Validate class
  const classValidation = validateWowClass(classId);
  if (!classValidation.isValid) {
    return classValidation;
  }
  warnings.push(...classValidation.warnings);

  // Validate spec if provided
  if (specId) {
    const specValidation = validateSpecialization(classId, specId);
    if (!specValidation.isValid) {
      errors.push(...specValidation.errors);
    }
    warnings.push(...specValidation.warnings);
  }

  // Validate dungeon if provided
  if (dungeonName) {
    const dungeonValidation = validateDungeon(dungeonName);
    if (!dungeonValidation.isValid) {
      errors.push(...dungeonValidation.errors);
    }
    warnings.push(...dungeonValidation.warnings);
  }

  const confidence = Math.max(0, 100 - (errors.length * 20 + warnings.length * 10));

  return {
    isValid: errors.length === 0,
    confidence,
    warnings,
    errors,
    verifiedSources: classValidation.verifiedSources,
  };
};

/**
 * Calculates overall data quality metrics
 */
export const calculateDataQualityMetrics = (): DataQualityMetrics => {
  let classDataQuality = 0;
  let specDataQuality = 0;
  let dungeonDataQuality = 0;

  // Validate all classes
  const classValidations = WOW_CLASSES.map(wc => validateWowClass(wc.id));
  classDataQuality = classValidations.reduce((sum, v) => sum + v.confidence, 0) / classValidations.length;

  // Validate all specs
  const specValidations = WOW_CLASSES.flatMap(wc =>
    wc.specs.map(spec => validateSpecialization(wc.id, spec.id))
  );
  specDataQuality = specValidations.reduce((sum, v) => sum + v.confidence, 0) / specValidations.length;

  // Validate all dungeons
  const dungeonValidations = DUNGEONS.map(d => validateDungeon(d.name));
  dungeonDataQuality = dungeonValidations.reduce((sum, v) => sum + v.confidence, 0) / dungeonValidations.length;

  const overallQuality = (classDataQuality + specDataQuality + dungeonDataQuality) / 3;

  return {
    classDataQuality,
    specDataQuality,
    dungeonDataQuality,
    overallQuality,
    lastValidated: new Date(),
  };
};

/**
 * Generates a detailed data integrity report
 */
export const generateIntegrityReport = (): {
  timestamp: Date;
  metrics: DataQualityMetrics;
  issues: string[];
  recommendations: string[];
} => {
  const metrics = calculateDataQualityMetrics();
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (metrics.classDataQuality < 90) {
    issues.push(`Class data quality is below 90%: ${metrics.classDataQuality.toFixed(1)}%`);
    recommendations.push('Review and update class configurations');
  }

  if (metrics.specDataQuality < 90) {
    issues.push(`Specialization data quality is below 90%: ${metrics.specDataQuality.toFixed(1)}%`);
    recommendations.push('Validate specialization data against current patch');
  }

  if (metrics.dungeonDataQuality < 90) {
    issues.push(`Dungeon data quality is below 90%: ${metrics.dungeonDataQuality.toFixed(1)}%`);
    recommendations.push('Update dungeon information for current season');
  }

  if (metrics.overallQuality < 85) {
    issues.push(`Overall data quality is critical: ${metrics.overallQuality.toFixed(1)}%`);
    recommendations.push('Perform comprehensive data audit and refresh');
  }

  return {
    timestamp: new Date(),
    metrics,
    issues,
    recommendations,
  };
};
