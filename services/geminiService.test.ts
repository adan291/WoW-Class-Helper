import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiService from './geminiService.ts';
import type { GeminiReadyContext } from './classOrchestratorService.ts';

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

  describe('generateGuide', () => {
    it('should generate guide for a class', async () => {
      const mockContext: GeminiReadyContext = {
        classId: 'warrior',
        className: 'Warrior',
        specId: 'arms',
        specName: 'Arms',
        dungeonName: undefined,
        isValid: true,
        verifiedSourceUrls: [],
        dataQuality: 100,
        warnings: [],
      };

      // Mock successful response
      const mockResponse = 'Warrior Arms guide content';
      vi.spyOn(geminiService, 'generateGuide').mockResolvedValue(mockResponse);

      const result = await geminiService.generateGuide(mockContext);
      expect(result).toBe(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockContext: GeminiReadyContext = {
        classId: 'warrior',
        className: 'Warrior',
        specId: 'arms',
        specName: 'Arms',
        dungeonName: undefined,
        isValid: true,
        verifiedSourceUrls: [],
        dataQuality: 100,
        warnings: [],
      };

      vi.spyOn(geminiService, 'generateGuide').mockRejectedValue(
        new Error('API Error')
      );

      await expect(geminiService.generateGuide(mockContext)).rejects.toThrow('API Error');
    });

    it('should include source URLs when provided', async () => {
      const mockContext: GeminiReadyContext = {
        classId: 'warrior',
        className: 'Warrior',
        specId: 'arms',
        specName: 'Arms',
        dungeonName: undefined,
        isValid: true,
        verifiedSourceUrls: ['https://example.com', 'https://test.com'],
        dataQuality: 100,
        warnings: [],
      };

      const mockResponse = 'Guide with sources';
      vi.spyOn(geminiService, 'generateGuide').mockResolvedValue(mockResponse);

      const result = await geminiService.generateGuide(mockContext);
      expect(result).toBe(mockResponse);
    });

    it('should generate guide with dungeon context', async () => {
      const mockContext: GeminiReadyContext = {
        classId: 'warrior',
        className: 'Warrior',
        specId: 'arms',
        specName: 'Arms',
        dungeonName: 'Shadowmoon Burial Ground',
        isValid: true,
        verifiedSourceUrls: [],
        dataQuality: 100,
        warnings: [],
      };

      const mockResponse = 'Dungeon guide for Arms Warrior';
      vi.spyOn(geminiService, 'generateGuide').mockResolvedValue(mockResponse);

      const result = await geminiService.generateGuide(mockContext);
      expect(result).toBe(mockResponse);
    });

    it('should handle missing optional fields', async () => {
      const mockContext: GeminiReadyContext = {
        classId: 'warrior',
        className: 'Warrior',
        specId: undefined,
        specName: undefined,
        dungeonName: undefined,
        isValid: true,
        verifiedSourceUrls: [],
        dataQuality: 100,
        warnings: [],
      };

      const mockResponse = 'General Warrior guide';
      vi.spyOn(geminiService, 'generateGuide').mockResolvedValue(mockResponse);

      const result = await geminiService.generateGuide(mockContext);
      expect(result).toBe(mockResponse);
    });
  });
});
