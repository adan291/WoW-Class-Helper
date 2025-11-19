import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '../services/cacheService.ts';
import type { WowClass, Specialization } from '../types.ts';

interface UseGuideContentOptions {
  wowClass: WowClass;
  spec: Specialization;
  tab: string;
  dungeon?: string;
  sourceUrls?: string;
  onFetch: (sourceUrls?: string) => Promise<string>;
}

interface UseGuideContentResult {
  content: string | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook for lazy loading guide content with caching
 * Prevents duplicate requests and uses cache when available
 */
export const useGuideContent = ({
  wowClass,
  spec,
  tab,
  dungeon,
  sourceUrls,
  onFetch,
}: UseGuideContentOptions): UseGuideContentResult => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = cacheService.generateKey(wowClass.id, spec.id, tab, dungeon);

  const fetchContent = useCallback(async () => {
    // Check cache first
    const cachedContent = cacheService.get<string>(cacheKey);
    if (cachedContent) {
      setContent(cachedContent);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await onFetch(sourceUrls);
      cacheService.set(cacheKey, result);
      setContent(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, onFetch, sourceUrls]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const retry = useCallback(() => {
    // Invalidate cache for this key
    cacheService.invalidatePattern(`^${wowClass.id}:${spec.id}:${tab}`);
    fetchContent();
  }, [fetchContent, wowClass.id, spec.id, tab]);

  return {
    content,
    loading,
    error,
    retry,
  };
};
