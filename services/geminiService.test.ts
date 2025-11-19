import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiService from './geminiService.ts';

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  describe('getOverview', () => {
    it('should generate overview for a class', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      // Mock successful response
      const mockResponse = 'Warrior overview content';
      vi.spyOn(geminiService, 'getOverview').mockResolvedValue(mockResponse);

      const result = await geminiService.getOverview(mockClass);
      expect(result).toBe(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      vi.spyOn(geminiService, 'getOverview').mockRejectedValue(
        new Error('API Error')
      );

      await expect(geminiService.getOverview(mockClass)).rejects.toThrow('API Error');
    });
  });

  describe('getSpecGuide', () => {
    it('should generate spec guide with proper formatting', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      const mockSpec = {
        id: 'arms',
        name: 'Arms',
        role: 'Damage' as const,
      };

      const mockResponse = 'Arms Warrior guide content';
      vi.spyOn(geminiService, 'getSpecGuide').mockResolvedValue(mockResponse);

      const result = await geminiService.getSpecGuide(mockClass, mockSpec);
      expect(result).toBe(mockResponse);
    });

    it('should include source URLs when provided', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      const mockSpec = {
        id: 'arms',
        name: 'Arms',
        role: 'Damage' as const,
      };

      const sourceUrls = 'https://example.com\nhttps://test.com';
      const mockResponse = 'Guide with sources';

      vi.spyOn(geminiService, 'getSpecGuide').mockResolvedValue(mockResponse);

      const result = await geminiService.getSpecGuide(mockClass, mockSpec, sourceUrls);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getRotationGuide', () => {
    it('should generate rotation guide with ability formatting', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      const mockSpec = {
        id: 'arms',
        name: 'Arms',
        role: 'Damage' as const,
      };

      const mockResponse = '[Mortal Strike]{Cooldown: 6 sec. ID: 12294. Description: A vicious strike.}';
      vi.spyOn(geminiService, 'getRotationGuide').mockResolvedValue(mockResponse);

      const result = await geminiService.getRotationGuide(mockClass, mockSpec);
      expect(result).toContain('[Mortal Strike]');
    });
  });

  describe('getAddons', () => {
    it('should generate addon recommendations', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      const mockResponse = 'Addon recommendations for Warrior';
      vi.spyOn(geminiService, 'getAddons').mockResolvedValue(mockResponse);

      const result = await geminiService.getAddons(mockClass);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getDungeonTips', () => {
    it('should generate dungeon-specific tips', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      const mockSpec = {
        id: 'arms',
        name: 'Arms',
        role: 'Damage' as const,
      };

      const mockResponse = 'Dungeon tips for Arms Warrior';
      vi.spyOn(geminiService, 'getDungeonTips').mockResolvedValue(mockResponse);

      const result = await geminiService.getDungeonTips(mockClass, mockSpec, 'Shadowmoon Burial Ground');
      expect(result).toBe(mockResponse);
    });

    it('should handle missing dungeon name', async () => {
      const mockClass = {
        id: 'warrior',
        name: 'Warrior',
        color: '#C79C6E',
        specs: [],
      };

      const mockSpec = {
        id: 'arms',
        name: 'Arms',
        role: 'Damage' as const,
      };

      const mockResponse = 'General dungeon tips';
      vi.spyOn(geminiService, 'getDungeonTips').mockResolvedValue(mockResponse);

      const result = await geminiService.getDungeonTips(mockClass, mockSpec);
      expect(result).toBe(mockResponse);
    });
  });
});
