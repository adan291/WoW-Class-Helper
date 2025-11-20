/**
 * Class Orchestrator Service
 * 
 * Main orchestration layer that coordinates data curation, validation, and patch monitoring.
 * Ensures all data passed to Gemini API is accurate, current, and verified.
 */

import { WOW_CLASSES } from '../constants.ts';
import {
  validateClassData,
  getVerifiedSources,
  generateCuratorReport,
  needsDataRefresh,
  type CuratorReport,
} from './dataCurator.ts';
import {
  validateGuideRequest,
  calculateDataQualityMetrics,
  generateIntegrityReport,
  type ValidationResult,
  type DataQualityMetrics,
} from './dataIntegrityValidator.ts';
import {
  getCurrentPatchVersion,
  checkForPatchUpdates,
  wasClassAffectedByLatestPatch,
  generatePatchReport,
  type PatchCheckResult,
} from './patchMonitor.ts';

export interface OrchestratorStatus {
  classId: string;
  className: string;
  timestamp: Date;
  curatorStatus: CuratorReport;
  validationStatus: ValidationResult;
  patchStatus: PatchCheckResult;
  isReadyForGemini: boolean;
  issues: string[];
  recommendations: string[];
}

export interface OrchestratorContext {
  classId: string;
  specId?: string;
  dungeonName?: string;
  customSourceUrls?: string[];
}

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
 * Orchestrates a complete class data check
 */
export const orchestrateClassCheck = (classId: string): OrchestratorStatus => {
  const wowClass = WOW_CLASSES.find(c => c.id === classId);
  
  if (!wowClass) {
    return {
      classId,
      className: 'Unknown',
      timestamp: new Date(),
      curatorStatus: {
        classId,
        className: 'Unknown',
        timestamp: new Date(),
        status: 'critical',
        issues: [`Class not found: ${classId}`],
        recommendations: ['Verify class ID'],
        nextCheckDue: new Date(),
      },
      validationStatus: {
        isValid: false,
        confidence: 0,
        warnings: [],
        errors: [`Class not found: ${classId}`],
        verifiedSources: [],
      },
      patchStatus: {
        currentPatch: getCurrentPatchVersion(),
        previousPatch: '',
        hasNewPatch: false,
        affectedClasses: [],
        affectedSpecs: [],
        recommendations: [],
      },
      isReadyForGemini: false,
      issues: [`Class not found: ${classId}`],
      recommendations: ['Verify class ID'],
    };
  }

  const curatorStatus = validateClassData(classId);
  const validationStatus = validateGuideRequest(classId);
  const patchStatus = checkForPatchUpdates(getCurrentPatchVersion());

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Collect all issues
  issues.push(...curatorStatus.issues);
  issues.push(...validationStatus.errors);

  // Collect all recommendations
  recommendations.push(...curatorStatus.recommendations);
  recommendations.push(...validationStatus.warnings);
  recommendations.push(...patchStatus.recommendations);

  // Check if class needs data refresh due to patch
  if (wasClassAffectedByLatestPatch(classId)) {
    recommendations.push(`Class was affected by latest patch - review guides`);
  }

  const isReadyForGemini = validationStatus.isValid && 
                          curatorStatus.status !== 'critical' &&
                          validationStatus.confidence >= 80;

  return {
    classId: wowClass.id,
    className: wowClass.name,
    timestamp: new Date(),
    curatorStatus,
    validationStatus,
    patchStatus,
    isReadyForGemini,
    issues,
    recommendations,
  };
};

/**
 * Prepares a context for Gemini API with verified data
 */
export const prepareGeminiContext = (context: OrchestratorContext): GeminiReadyContext | null => {
  const orchestratorStatus = orchestrateClassCheck(context.classId);

  if (!orchestratorStatus.isReadyForGemini) {
    console.warn(`Class ${context.classId} is not ready for Gemini:`, orchestratorStatus.issues);
    return null;
  }

  const wowClass = WOW_CLASSES.find(c => c.id === context.classId);
  if (!wowClass) {
    return null;
  }

  let specName: string | undefined;
  if (context.specId) {
    const spec = wowClass.specs.find(s => s.id === context.specId);
    specName = spec?.name;
  }

  // Get verified sources
  let verifiedSourceUrls = getVerifiedSources(context.classId);
  
  // Add custom sources if provided
  if (context.customSourceUrls && context.customSourceUrls.length > 0) {
    verifiedSourceUrls = [...verifiedSourceUrls, ...context.customSourceUrls];
  }

  return {
    classId: wowClass.id,
    className: wowClass.name,
    specId: context.specId,
    specName,
    dungeonName: context.dungeonName,
    verifiedSourceUrls,
    dataQuality: orchestratorStatus.validationStatus.confidence,
    isValid: orchestratorStatus.isReadyForGemini,
    warnings: orchestratorStatus.validationStatus.warnings,
  };
};

/**
 * Generates a comprehensive orchestrator report for all classes
 */
export const generateOrchestratorReport = (): {
  timestamp: Date;
  totalClasses: number;
  readyClasses: number;
  warningClasses: number;
  criticalClasses: number;
  classStatuses: OrchestratorStatus[];
  dataQuality: DataQualityMetrics;
  recommendations: string[];
} => {
  const classStatuses = WOW_CLASSES.map(wc => orchestrateClassCheck(wc.id));
  const dataQuality = calculateDataQualityMetrics();

  const readyClasses = classStatuses.filter(s => s.isReadyForGemini).length;
  const warningClasses = classStatuses.filter(s => !s.isReadyForGemini && s.curatorStatus.status === 'warning').length;
  const criticalClasses = classStatuses.filter(s => s.curatorStatus.status === 'critical').length;

  const recommendations: string[] = [];

  if (criticalClasses > 0) {
    recommendations.push(`${criticalClasses} classes have critical issues`);
  }

  if (warningClasses > 0) {
    recommendations.push(`${warningClasses} classes have warnings`);
  }

  if (dataQuality.overallQuality < 85) {
    recommendations.push('Overall data quality is below target - perform audit');
  }

  return {
    timestamp: new Date(),
    totalClasses: WOW_CLASSES.length,
    readyClasses,
    warningClasses,
    criticalClasses,
    classStatuses,
    dataQuality,
    recommendations,
  };
};

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
  warnings: string[];
} => {
  const context: OrchestratorContext = {
    classId,
    specId,
    dungeonName,
    customSourceUrls,
  };

  const geminiContext = prepareGeminiContext(context);
  const orchestratorStatus = orchestrateClassCheck(classId);

  return {
    isValid: geminiContext !== null,
    context: geminiContext,
    errors: orchestratorStatus.issues,
    warnings: orchestratorStatus.validationStatus.warnings,
  };
};

/**
 * Gets a summary of which classes need data updates
 */
export const getClassesNeedingUpdate = (): string[] => {
  const currentPatch = getCurrentPatchVersion();
  const classesNeedingUpdate: string[] = [];

  WOW_CLASSES.forEach(wc => {
    if (needsDataRefresh(wc.id, currentPatch)) {
      classesNeedingUpdate.push(wc.name);
    }
  });

  return classesNeedingUpdate;
};

/**
 * Generates a health check report for the entire orchestrator system
 */
export const generateHealthCheckReport = (): {
  timestamp: Date;
  systemHealth: 'healthy' | 'warning' | 'critical';
  curatorReport: ReturnType<typeof generateCuratorReport>;
  integrityReport: ReturnType<typeof generateIntegrityReport>;
  patchReport: ReturnType<typeof generatePatchReport>;
  orchestratorReport: ReturnType<typeof generateOrchestratorReport>;
  overallRecommendations: string[];
} => {
  const curatorReport = generateCuratorReport();
  const integrityReport = generateIntegrityReport();
  const patchReport = generatePatchReport();
  const orchestratorReport = generateOrchestratorReport();

  const criticalIssues = [
    ...integrityReport.issues,
    ...(curatorReport.filter(r => r.status === 'critical').length > 0 ? ['Critical curator issues detected'] : []),
  ];

  const systemHealth = criticalIssues.length > 0 ? 'critical' : 
                      orchestratorReport.warningClasses > 0 ? 'warning' : 
                      'healthy';

  const overallRecommendations = [
    ...integrityReport.recommendations,
    ...patchReport.recommendations,
    ...orchestratorReport.recommendations,
  ];

  return {
    timestamp: new Date(),
    systemHealth,
    curatorReport,
    integrityReport,
    patchReport,
    orchestratorReport,
    overallRecommendations,
  };
};
