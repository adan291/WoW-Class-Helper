/**
 * useValidatedGuideContent Hook
 * 
 * Enhanced hook that validates class data before fetching guides from Gemini.
 * Integrates curator validation to ensure data accuracy and prevent hallucinations.
 */

import { useState, useCallback, useEffect } from 'react';
import type { WowClass, Specialization } from '../types.ts';
import * as geminiService from '../services/geminiService.ts';
import { useGuideValidation } from './useClassOrchestrator.ts';

export interface UseValidatedGuideContentOptions {
  autoFetch?: boolean;
  customSourceUrls?: string[];
}

export interface UseValidatedGuideContentReturn {
  // Content
  content: string | null;
  
  // Loading states
  isLoading: boolean;
  isValidating: boolean;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
  dataQuality: number;
  
  // Methods
  fetchOverview: (wowClass: WowClass) => Promise<void>;
  fetchSpecGuide: (wowClass: WowClass, spec: Specialization) => Promise<void>;
  fetchRotationGuide: (wowClass: WowClass, spec: Specialization) => Promise<void>;
  fetchAddons: (wowClass: WowClass) => Promise<void>;
  fetchDungeonTips: (wowClass: WowClass, spec: Specialization, dungeonName?: string) => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for fetching validated guide content
 */
export const useValidatedGuideContent = (
  options: UseValidatedGuideContentOptions = {}
): UseValidatedGuideContentReturn => {
  const { customSourceUrls = [] } = options;

  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dataQuality, setDataQuality] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchWithValidation = useCallback(
    async (
      fetchFn: (sourceUrls?: string[], customUrls?: string[]) => Promise<string>,
      classId: string,
      specId?: string,
      dungeonName?: string
    ) => {
      setIsLoading(true);
      setIsValidating(true);
      setError(null);

      try {
        // Validate data before fetching
        const validation = useGuideValidation(classId, specId, dungeonName);
        
        if (!validation.isValid) {
          setIsValid(false);
          setValidationErrors(validation.errors);
          setDataQuality(0);
          throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
        }

        setIsValid(true);
        setValidationErrors([]);
        setDataQuality(validation.context?.dataQuality || 0);

        // Fetch content with validated data
        const result = await fetchFn(undefined, customSourceUrls);
        setContent(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch guide content';
        setError(errorMessage);
        setContent(null);
        console.error('Error fetching guide content:', err);
      } finally {
        setIsLoading(false);
        setIsValidating(false);
      }
    },
    [customSourceUrls]
  );

  const fetchOverview = useCallback(
    async (wowClass: WowClass) => {
      await fetchWithValidation(
        (sourceUrls, customUrls) => geminiService.getOverview(wowClass, sourceUrls?.join('\n'), customUrls),
        wowClass.id
      );
    },
    [fetchWithValidation]
  );

  const fetchSpecGuide = useCallback(
    async (wowClass: WowClass, spec: Specialization) => {
      await fetchWithValidation(
        (sourceUrls, customUrls) => geminiService.getSpecGuide(wowClass, spec, sourceUrls?.join('\n'), customUrls),
        wowClass.id,
        spec.id
      );
    },
    [fetchWithValidation]
  );

  const fetchRotationGuide = useCallback(
    async (wowClass: WowClass, spec: Specialization) => {
      await fetchWithValidation(
        (sourceUrls, customUrls) => geminiService.getRotationGuide(wowClass, spec, sourceUrls?.join('\n'), customUrls),
        wowClass.id,
        spec.id
      );
    },
    [fetchWithValidation]
  );

  const fetchAddons = useCallback(
    async (wowClass: WowClass) => {
      await fetchWithValidation(
        (sourceUrls, customUrls) => geminiService.getAddons(wowClass, sourceUrls?.join('\n'), customUrls),
        wowClass.id
      );
    },
    [fetchWithValidation]
  );

  const fetchDungeonTips = useCallback(
    async (wowClass: WowClass, spec: Specialization, dungeonName?: string) => {
      await fetchWithValidation(
        (sourceUrls, customUrls) => geminiService.getDungeonTips(wowClass, spec, dungeonName, sourceUrls?.join('\n'), customUrls),
        wowClass.id,
        spec.id,
        dungeonName
      );
    },
    [fetchWithValidation]
  );

  return {
    content,
    isLoading,
    isValidating,
    isValid,
    validationErrors,
    dataQuality,
    fetchOverview,
    fetchSpecGuide,
    fetchRotationGuide,
    fetchAddons,
    fetchDungeonTips,
    error,
    clearError,
  };
};

/**
 * Hook for a specific guide type with automatic validation
 */
export const useValidatedGuide = (
  wowClass: WowClass | null,
  spec: Specialization | null,
  guideType: 'overview' | 'spec' | 'rotation' | 'addons' | 'dungeon' = 'spec',
  dungeonName?: string,
  options: UseValidatedGuideContentOptions = {}
) => {
  const guide = useValidatedGuideContent(options);
  const { autoFetch = true } = options;

  useEffect(() => {
    if (!autoFetch || !wowClass) return;

    const fetchGuide = async () => {
      try {
        switch (guideType) {
          case 'overview':
            await guide.fetchOverview(wowClass);
            break;
          case 'spec':
            if (spec) await guide.fetchSpecGuide(wowClass, spec);
            break;
          case 'rotation':
            if (spec) await guide.fetchRotationGuide(wowClass, spec);
            break;
          case 'addons':
            await guide.fetchAddons(wowClass);
            break;
          case 'dungeon':
            if (spec) await guide.fetchDungeonTips(wowClass, spec, dungeonName);
            break;
        }
      } catch (err) {
        console.error(`Error fetching ${guideType} guide:`, err);
      }
    };

    fetchGuide();
  }, [wowClass, spec, guideType, dungeonName, autoFetch, guide]);

  return guide;
};
