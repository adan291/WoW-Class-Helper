/**
 * useClassOrchestrator Hook
 * 
 * React hook for integrating class orchestrator validation into components.
 * Ensures all guide requests are validated before being sent to Gemini.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  orchestrateClassCheck,
  validateAndPrepareGuideRequest,
  generateHealthCheckReport,
  type OrchestratorStatus,
  type GeminiReadyContext,
} from '../services/classOrchestratorService.ts';

export interface UseClassOrchestratorOptions {
  autoValidate?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export interface UseClassOrchestratorReturn {
  // Status
  isLoading: boolean;
  isValid: boolean;
  orchestratorStatus: OrchestratorStatus | null;
  geminiContext: GeminiReadyContext | null;

  // Data
  issues: string[];
  warnings: string[];
  recommendations: string[];

  // Methods
  validateClass: (classId: string) => Promise<void>;
  validateGuideRequest: (
    classId: string,
    specId?: string,
    dungeonName?: string,
    customSourceUrls?: string[]
  ) => Promise<boolean>;
  getHealthReport: () => Promise<void>;

  // State
  healthReport: ReturnType<typeof generateHealthCheckReport> | null;
}

/**
 * Hook for orchestrating class data validation
 */
export const useClassOrchestrator = (
  options: UseClassOrchestratorOptions = {}
): UseClassOrchestratorReturn => {
  const { autoValidate = true, onValidationChange } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [orchestratorStatus, setOrchestratorStatus] = useState<OrchestratorStatus | null>(null);
  const [geminiContext, setGeminiContext] = useState<GeminiReadyContext | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [healthReport, setHealthReport] = useState<ReturnType<typeof generateHealthCheckReport> | null>(null);

  const validateClass = useCallback(async (classId: string) => {
    setIsLoading(true);
    try {
      const status = orchestrateClassCheck(classId);
      setOrchestratorStatus(status);
      setIssues(status.issues);
      setWarnings(status.validationStatus.warnings);
      setRecommendations(status.recommendations);
      setIsValid(status.isReadyForGemini);

      if (onValidationChange) {
        onValidationChange(status.isReadyForGemini);
      }
    } catch (error) {
      console.error('Error validating class:', error);
      setIsValid(false);
      setIssues(['Failed to validate class']);
    } finally {
      setIsLoading(false);
    }
  }, [onValidationChange]);

  const validateGuideRequest = useCallback(
    async (
      classId: string,
      specId?: string,
      dungeonName?: string,
      customSourceUrls?: string[]
    ): Promise<boolean> => {
      setIsLoading(true);
      try {
        const result = validateAndPrepareGuideRequest(
          classId,
          specId,
          dungeonName,
          customSourceUrls
        );

        setGeminiContext(result.context);
        setIssues(result.errors);
        setWarnings(result.warnings);
        setIsValid(result.isValid);

        if (onValidationChange) {
          onValidationChange(result.isValid);
        }

        return result.isValid;
      } catch (error) {
        console.error('Error validating guide request:', error);
        setIsValid(false);
        setIssues(['Failed to validate guide request']);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [onValidationChange]
  );

  const getHealthReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const report = generateHealthCheckReport();
      setHealthReport(report);
    } catch (error) {
      console.error('Error generating health report:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-validate on mount if enabled
  useEffect(() => {
    if (autoValidate) {
      getHealthReport();
    }
  }, [autoValidate, getHealthReport]);

  return {
    isLoading,
    isValid,
    orchestratorStatus,
    geminiContext,
    issues,
    warnings,
    recommendations,
    validateClass,
    validateGuideRequest,
    getHealthReport,
    healthReport,
  };
};

/**
 * Hook for validating a specific guide request
 */
export const useGuideValidation = (
  classId: string,
  specId?: string,
  dungeonName?: string
) => {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [context, setContext] = useState<GeminiReadyContext | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const validate = async () => {
      setIsLoading(true);
      try {
        const result = validateAndPrepareGuideRequest(classId, specId, dungeonName);
        setIsValid(result.isValid);
        setContext(result.context);
        setErrors(result.errors);
      } catch (error) {
        console.error('Error validating guide:', error);
        setIsValid(false);
        setErrors(['Failed to validate guide']);
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  }, [classId, specId, dungeonName]);

  return { isValid, isLoading, context, errors };
};
