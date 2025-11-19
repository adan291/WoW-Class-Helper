import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGuideContent } from './useGuideContent.ts';
import { cacheService } from '../services/cacheService.ts';
import type { WowClass, Specialization } from '../types.ts';

const mockClass: WowClass = {
  id: 'warrior',
  name: 'Warrior',
  color: '#C79C6E',
  specs: [],
};

const mockSpec: Specialization = {
  id: 'arms',
  name: 'Arms',
  role: 'Damage',
};

describe('useGuideContent', () => {
  beforeEach(() => {
    cacheService.clear();
    vi.clearAllMocks();
  });

  it('should fetch content on mount', async () => {
    const mockFetch = vi.fn().mockResolvedValue('Guide content');

    const { result } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'overview',
        onFetch: mockFetch,
      })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toBe('Guide content');
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('should use cached content on subsequent calls', async () => {
    const mockFetch = vi.fn().mockResolvedValue('Guide content');

    // First render
    const { unmount } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'overview',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    unmount();

    // Second render with same parameters
    const { result } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'overview',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(result.current.content).toBe('Guide content');
    });

    // Should not call fetch again due to cache
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('should handle fetch errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'overview',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.content).toBeNull();
  });

  it('should retry and invalidate cache', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce('Old content')
      .mockResolvedValueOnce('New content');

    const { result } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'overview',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(result.current.content).toBe('Old content');
    });

    // Retry should invalidate cache and fetch again
    result.current.retry();

    await waitFor(() => {
      expect(result.current.content).toBe('New content');
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should pass sourceUrls to fetch function', async () => {
    const mockFetch = vi.fn().mockResolvedValue('Guide content');
    const sourceUrls = 'https://example.com\nhttps://test.com';

    renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'overview',
        sourceUrls,
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(sourceUrls);
    });
  });

  it('should handle different tabs separately', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce('Overview content')
      .mockResolvedValueOnce('Rotation content');

    // First tab
    const { unmount: unmount1 } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'overview',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    unmount1();

    // Different tab
    const { result } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'rotation',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(result.current.content).toBe('Rotation content');
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle dungeon parameter in cache key', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce('General tips')
      .mockResolvedValueOnce('Shadowmoon tips');

    // Without dungeon
    const { unmount: unmount1 } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'dungeon',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    unmount1();

    // With dungeon
    const { result } = renderHook(() =>
      useGuideContent({
        wowClass: mockClass,
        spec: mockSpec,
        tab: 'dungeon',
        dungeon: 'Shadowmoon',
        onFetch: mockFetch,
      })
    );

    await waitFor(() => {
      expect(result.current.content).toBe('Shadowmoon tips');
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
