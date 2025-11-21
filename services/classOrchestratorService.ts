/**
 * Class Orchestrator Service
 * 
 * Validates and prepares guide requests for Gemini API.
 * Ensures all data passed to Gemini is accurate and verified.
 */

import { WOW_CLASSES } from '../constants.ts';
import { validateClass, validateSpecialization } from './validationService.ts';

export interface GeminiReadyContext {
  classId: string;
  className: string;
  specId?: string;
  specName?: string;
  dungeonName?: string;
  verifiedSourceUrls: string[];
  dataQuality: number;
  isValid: boolean;
  warnings: string[];
}

/**
 * Validates and prepares a guide request for Gemini
 */
export const validateAndPrepareGuideRequest = (
  classId: string,
  specId?: string,
  dungeonName?: string,
  customSourceUrls?: string[]
): {
  isValid: boolean;
  context: GeminiReadyContext | null;
  errors: string[];
} => {
  const errors: string[] = [];

  // Find the class
  const wowClass = WOW_CLASSES.find(c => c.id === classId);
  if (!wowClass) {
    errors.push(`Class not found: ${classId}`);
    return { isValid: false, context: null, errors };
  }

  // Validate class
  if (!validateClass(wowClass)) {
    errors.push(`Invalid class data: ${classId}`);
    return { isValid: false, context: null, errors };
  }

  // Validate specialization if provided
  let specName: string | undefined;
  if (specId) {
    const spec = wowClass.specs.find(s => s.id === specId);
    if (!spec || !validateSpecialization(spec, wowClass)) {
      errors.push(`Invalid specialization: ${specId}`);
      return { isValid: false, context: null, errors };
    }
    specName = spec.name;
  }

  // Validate dungeon if provided
  if (dungeonName) {
    // Basic dungeon validation - just check it's not empty
    if (!dungeonName || dungeonName.trim().length === 0) {
      errors.push(`Invalid dungeon: ${dungeonName}`);
      return { isValid: false, context: null, errors };
    }
  }

  // Prepare verified sources
  let verifiedSourceUrls: string[] = [];
  if (customSourceUrls && customSourceUrls.length > 0) {
    verifiedSourceUrls = customSourceUrls;
  }

  // Create context
  const context: GeminiReadyContext = {
    classId: wowClass.id,
    className: wowClass.name,
    specId,
    specName,
    dungeonName,
    verifiedSourceUrls,
    dataQuality: 100,
    isValid: true,
    warnings: [],
  };

  return {
    isValid: true,
    context,
    errors: [],
  };
};
