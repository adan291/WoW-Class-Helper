import { GoogleGenAI } from '@google/genai';
import type { GeminiReadyContext } from './classOrchestratorService.ts';
import { validateSourceUrls, validateApiResponse } from './validationService.ts';
import { toastService } from './toastService.ts';

// Class Helper usa su propia API key, con fallback a la general
const apiKey =
  import.meta.env.VITE_GEMINI_API_KEY_CLASS_HELPER || import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const PROMPT_MAX_LENGTH = 30000;

/**
 * Implements exponential backoff for retries
 */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Checks if an error is retryable based on error message
 */
const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('temporarily') ||
    msg.includes('503') ||
    msg.includes('429')
  );
};

/**
 * Callback for retry progress updates
 */
export type RetryProgressCallback = (retryCount: number, waitTime: number) => void;

let retryProgressCallback: RetryProgressCallback | null = null;

/**
 * Set callback for retry progress updates
 */
export const setRetryProgressCallback = (callback: RetryProgressCallback | null) => {
  retryProgressCallback = callback;
};

/**
 * Generates content with retry logic and comprehensive error handling
 */
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string,
  retryCount = 0
): Promise<string> => {
  try {
    // Validate API key
    if (!apiKey) {
      throw new Error(
        'API key not configured. Please set VITE_GEMINI_API_KEY environment variable.'
      );
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Invalid prompt provided to API');
    }

    let finalPrompt = prompt;

    // Validate and process source URLs
    if (sourceUrls && sourceUrls.trim() !== '') {
      const validation = validateSourceUrls(sourceUrls);

      const urlValidation = validation as {
        valid?: boolean;
        errors?: string[];
        urls?: string[];
      } | null;

      if (urlValidation && !urlValidation.valid) {
        const errorMsg = urlValidation.errors?.join('\n') || 'Invalid URLs';
        throw new Error(`Invalid source URLs:\n${errorMsg}`);
      }

      if (urlValidation?.urls && urlValidation.urls.length > 0) {
        const urls = urlValidation.urls.map((url: string) => `- ${url}`).join('\n');
        finalPrompt = `IMPORTANT: Your primary task is to act as an expert World of Warcraft guide writer. You MUST use the information from the following web pages to construct your answer. If the information from these sources conflicts with your base knowledge, you MUST prioritize the information from the provided URLs. At the end of your response, you MUST cite the URLs you used under a "Sources:" heading.\n\nProvided URLs:\n${urls}\n\n---\n\nOriginal Request:\n${prompt}`;
      }
    }

    // Validate prompt length
    if (finalPrompt.length > PROMPT_MAX_LENGTH) {
      throw new Error('Prompt is too long. Please reduce the content size.');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });

    const content = response.candidates?.[0]?.content?.parts?.[0];

    if (!content || !('text' in content)) {
      throw new Error('Invalid response format from API');
    }

    const text = content.text || '';

    // Validate response
    if (!validateApiResponse(text)) {
      console.warn('API response validation failed');
    }

    return text;
  } catch (error) {
    if (retryCount < MAX_RETRIES && isRetryableError(error)) {
      const waitTime = Math.pow(2, retryCount) * RETRY_DELAY_MS;

      if (retryProgressCallback) {
        retryProgressCallback(retryCount + 1, waitTime);
      }

      await delay(waitTime);
      return generateContentWithGemini(prompt, sourceUrls, retryCount + 1);
    }

    throw error;
  }
};

/**
 * Main guide generation function
 */
export const generateGuide = async (context: GeminiReadyContext): Promise<string> => {
  try {
    const prompt = buildPrompt(context);
    const sourceUrlsStr =
      context.verifiedSourceUrls?.length > 0 ? context.verifiedSourceUrls.join('\n') : undefined;
    const content = await generateContentWithGemini(prompt, sourceUrlsStr);
    return content;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Guide generation failed:', message);
    toastService.error(`Failed to generate guide: ${message}`);
    throw error;
  }
};

/**
 * Builds the prompt for guide generation
 */
function buildPrompt(context: GeminiReadyContext): string {
  const { className, specName, dungeonName } = context;

  let prompt = `You are an expert World of Warcraft guide writer. Generate a comprehensive guide for the following:\n\n`;
  prompt += `Class: ${className}\n`;
  if (specName) {
    prompt += `Specialization: ${specName}\n`;
  }

  if (dungeonName) {
    prompt += `Dungeon: ${dungeonName}\n`;
  }

  prompt += `\nProvide the guide in markdown format with clear sections and formatting. Include practical tips and strategies.`;

  return prompt;
}

export default {
  generateGuide,
  setRetryProgressCallback,
};
