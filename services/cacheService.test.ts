import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheService } from './cacheService.ts';

describe('cacheService', () => {
  beforeEach(() => {
    cacheService.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateKey', () => {
    it('should generate key from class, spec, and tab', () => {
      const key = cacheService.generateKey('Warrior', 'Arms', 'overview');
      expect(key).toBe('Warrior:Arms:overview');
    });

    it('should include dungeon in key when provided', () => {
      const key = cacheService.generateKey('Warrior', 'Arms', 'dungeon', 'Shadowmoon');
      expect(key).toBe('Warrior:Arms:dungeon:Shadowmoon');
    });

    it('should not include dungeon when not provided', () => {
      const key = cacheService.generateKey('Warrior', 'Arms', 'dungeon');
      expect(key).toBe('Warrior:Arms:dungeon');
    });
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const key = 'test:key';
      const data = 'test data';

      cacheService.set(key, data);
      const result = cacheService.get(key);

      expect(result).toBe(data);
    });

    it('should return null for non-existent key', () => {
      const result = cacheService.get('non:existent');
      expect(result).toBeNull();
    });

    it('should store different data types', () => {
      const stringKey = 'string:key';
      const objectKey = 'object:key';
      const arrayKey = 'array:key';

      cacheService.set(stringKey, 'string value');
      cacheService.set(objectKey, { name: 'test', value: 123 });
      cacheService.set(arrayKey, [1, 2, 3]);

      expect(cacheService.get(stringKey)).toBe('string value');
      expect(cacheService.get(objectKey)).toEqual({ name: 'test', value: 123 });
      expect(cacheService.get(arrayKey)).toEqual([1, 2, 3]);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const key = 'expiring:key';
      const data = 'test data';

      cacheService.set(key, data);
      expect(cacheService.get(key)).toBe(data);

      // Advance time by 1 hour + 1 second
      vi.advanceTimersByTime(60 * 60 * 1000 + 1000);

      expect(cacheService.get(key)).toBeNull();
    });

    it('should not expire entries before TTL', () => {
      const key = 'valid:key';
      const data = 'test data';

      cacheService.set(key, data);

      // Advance time by 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);

      expect(cacheService.get(key)).toBe(data);
    });

    it('should remove expired entry from cache', () => {
      const key = 'expiring:key';
      cacheService.set(key, 'data');

      vi.advanceTimersByTime(60 * 60 * 1000 + 1000);

      cacheService.get(key); // This should trigger cleanup
      expect(cacheService.has(key)).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for valid cached entry', () => {
      const key = 'valid:key';
      cacheService.set(key, 'data');

      expect(cacheService.has(key)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cacheService.has('non:existent')).toBe(false);
    });

    it('should return false for expired entry', () => {
      const key = 'expiring:key';
      cacheService.set(key, 'data');

      vi.advanceTimersByTime(60 * 60 * 1000 + 1000);

      expect(cacheService.has(key)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cacheService.set('key1', 'data1');
      cacheService.set('key2', 'data2');
      cacheService.set('key3', 'data3');

      expect(cacheService.getStats().size).toBe(3);

      cacheService.clear();

      expect(cacheService.getStats().size).toBe(0);
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBeNull();
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate entries matching pattern', () => {
      cacheService.set('Warrior:Arms:overview', 'data1');
      cacheService.set('Warrior:Arms:rotation', 'data2');
      cacheService.set('Warrior:Fury:overview', 'data3');
      cacheService.set('Mage:Fire:overview', 'data4');

      cacheService.invalidatePattern('^Warrior:Arms');

      expect(cacheService.has('Warrior:Arms:overview')).toBe(false);
      expect(cacheService.has('Warrior:Arms:rotation')).toBe(false);
      expect(cacheService.has('Warrior:Fury:overview')).toBe(true);
      expect(cacheService.has('Mage:Fire:overview')).toBe(true);
    });

    it('should invalidate by class pattern', () => {
      cacheService.set('Warrior:Arms:overview', 'data1');
      cacheService.set('Warrior:Fury:overview', 'data2');
      cacheService.set('Mage:Fire:overview', 'data3');

      cacheService.invalidatePattern('^Warrior');

      expect(cacheService.has('Warrior:Arms:overview')).toBe(false);
      expect(cacheService.has('Warrior:Fury:overview')).toBe(false);
      expect(cacheService.has('Mage:Fire:overview')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cacheService.set('key1', 'data1');
      cacheService.set('key2', 'data2');

      const stats = cacheService.getStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('should return empty stats when cache is empty', () => {
      const stats = cacheService.getStats();

      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });
});
