
import { GoogleGenAI } from "@google/genai";
import type { WowClass, Specialization } from '../types.ts';
import { validateSourceUrls, validateApiResponse } from './validationService.ts';
import {
  validateAndPrepareGuideRequest,
  type GeminiReadyContext,
} from './classOrchestratorService.ts';
import {
  getMockOverview,
  getMockSpecGuide,
  getMockRotationGuide,
  getMockAddons,
  getMockDungeonTips,
} from './mockGuideService.ts';
import { statsService } from './statsService.ts';
import { toastService } from './toastService.ts';

// Per coding guidelines, `process.env.API_KEY` is assumed to be available.
// The GoogleGenAI instance is initialized directly without fallbacks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const PROMPT_MAX_LENGTH = 30000;
const RESPONSE_MAX_LENGTH = 100000;

/**
 * Implements exponential backoff for retries
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Checks if an error is retryable based on error message
 */
const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('timeout') || msg.includes('network') || 
         msg.includes('temporarily') || msg.includes('503') || msg.includes('429');
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
 * Integrates curator validation to ensure data accuracy
 */
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string,
  retryCount = 0
): Promise<string> => {
  try {
    // Validate API key
    if (!process.env.API_KEY) {
      throw new Error('API key not configured. Please set GEMINI_API_KEY environment variable.');
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Invalid prompt provided to API');
    }

    let finalPrompt = prompt;

    // Validate and process source URLs
    if (sourceUrls && sourceUrls.trim() !== '') {
      const validation = validateSourceUrls(sourceUrls);

      if (!validation.valid) {
        const errorMsg = validation.errors.join('\n');
        throw new Error(`Invalid source URLs:\n${errorMsg}`);
      }

      if (validation.urls.length > 0) {
        const urls = validation.urls.map(url => `- ${url}`).join('\n');
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

    // Validate response
    if (!validateApiResponse(response?.text)) {
      throw new Error('Empty response from API');
    }

    // Track successful API call
    statsService.recordApiSuccess();
    toastService.success('✨ Guide generated successfully!');
    return response.text;
  } catch (error) {
    console.error(`Error calling Gemini API (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);

    if (isRetryableError(error) && retryCount < MAX_RETRIES) {
      const waitTime = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Retrying in ${waitTime}ms...`);
      
      // Report retry progress
      if (retryProgressCallback) {
        retryProgressCallback(retryCount + 1, Math.ceil(waitTime / 1000));
      }
      
      // Wait with progress updates
      const startTime = Date.now();
      while (Date.now() - startTime < waitTime) {
        const elapsed = Math.ceil((Date.now() - startTime) / 1000);
        const remaining = Math.ceil(waitTime / 1000) - elapsed;
        if (retryProgressCallback && remaining > 0) {
          retryProgressCallback(retryCount + 1, remaining);
        }
        await delay(100);
      }
      
      return generateContentWithGemini(prompt, sourceUrls, retryCount + 1);
    }

    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API configuration error. Please check your GEMINI_API_KEY environment variable.');
      }
      if (error.message.includes('URL')) {
        throw new Error(`URL validation error: ${error.message}`);
      }
      if (error.message.includes('Invalid prompt')) {
        throw new Error('The request could not be processed. Please try again.');
      }
      // Return mock data on API overload or unavailability
      if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
        console.warn('API unavailable, using mock data');
        statsService.recordApiFailure();
        statsService.recordMockUsage();
        toastService.warning('⚠️ API unavailable - showing demo content');
        return `${prompt}\n\n---\n\n**[DEMO MODE]** This is demonstration content. The API is currently unavailable. Please try again in a few moments.`;
      }
      statsService.recordApiFailure();
      toastService.error(`❌ ${error.message}`);
      throw error;
    }

    throw new Error('Failed to generate content from AI. Please try again later.');
  }
};

/**
 * Validates class data before generating content
 * Ensures data integrity and prevents hallucinations
 */
const validateClassDataBeforeGeneration = (
  classId: string,
  specId?: string,
  dungeonName?: string,
  customSourceUrls?: string[]
): { isValid: boolean; context: GeminiReadyContext | null; error?: string } => {
  try {
    const validation = validateAndPrepareGuideRequest(
      classId,
      specId,
      dungeonName,
      customSourceUrls
    );

    if (!validation.isValid) {
      const errorDetails = validation.errors.join('; ');
      console.warn(`Data validation failed: ${errorDetails}`);
      return {
        isValid: false,
        context: null,
        error: `Data validation failed: ${errorDetails}`,
      };
    }

    if (validation.context && validation.context.dataQuality < 80) {
      console.warn(`Data quality below threshold: ${validation.context.dataQuality}%`);
    }

    return {
      isValid: true,
      context: validation.context,
    };
  } catch (error) {
    console.error('Error during data validation:', error);
    return {
      isValid: false,
      context: null,
      error: 'Failed to validate class data',
    };
  }
};

export const getOverview = async (
  wowClass: WowClass,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {
  // Validate class data before generation
  const validation = validateClassDataBeforeGeneration(
    wowClass.id,
    undefined,
    undefined,
    customSourceUrls
  );

  if (!validation.isValid) {
    throw new Error(validation.error || 'Class data validation failed');
  }

  // Use verified sources from curator if available
  const finalSourceUrls = validation.context?.verifiedSourceUrls.join('\n') || sourceUrls;

  const expansionContext = expansion && expansion !== 'All' ? ` for ${expansion}` : ' for the latest expansion';
  const prompt = `Provide a detailed and engaging overview for the ${wowClass.name} class in World of Warcraft${expansionContext}. Include its core identity, playstyle, strengths, weaknesses, and a summary of the most significant changes in that expansion. Format the response using markdown.`;
  
  try {
    return await generateContentWithGemini(prompt, finalSourceUrls);
  } catch (error) {
    // Use mock data on API failure
    console.warn('Using mock data for overview');
    statsService.recordMockUsage();
    toastService.info('📚 Using cached overview');
    return getMockOverview(wowClass, expansion);
  }
};

export const getSpecGuide = async (
  wowClass: WowClass,
  spec: Specialization,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {
  // Validate class and spec data before generation
  const validation = validateClassDataBeforeGeneration(
    wowClass.id,
    spec.id,
    undefined,
    customSourceUrls
  );

  if (!validation.isValid) {
    throw new Error(validation.error || 'Specialization data validation failed');
  }

  // Use verified sources from curator if available
  const finalSourceUrls = validation.context?.verifiedSourceUrls.join('\n') || sourceUrls;

  const expansionContext = expansion && expansion !== 'All' ? ` in ${expansion}` : ' in World of Warcraft\'s latest expansion';
  const prompt = `Generate a comprehensive, expert-level guide focusing on the build, stats, and advanced strategies for the ${spec.name} ${wowClass.name} specialization${expansionContext}. Format the response using markdown. Include the following detailed sections:

1.  **Stat Priority:**
    *   List the optimal secondary stats (e.g., Haste > Mastery > Critical Strike > Versatility) for this specialization.
    *   Provide a clear explanation of *why* each stat is important and how it interacts with the spec's kit.

2.  **Mythic+ Talent Build:**
    *   **Core Strengths & Use Case:** Start this section with a bold brief explanation (e.g., "**Ideal for:** Sustained AoE and high utility in Mythic+ keys.").
    *   Explain the core philosophy of the Mythic+ build.
    *   List the "must-have" talents.
    *   Highlight key choice nodes and explain when to take which option for dungeons.

3.  **Alternative Talent Builds:**
    *   Provide 1-2 brief example builds for other content types (e.g., "Single-Target Raid", "PvP").
    *   For each, include a "**Core Strengths:**" summary line.

4.  **Advanced Tips:**
    *   **Nuanced Mechanics:** Explain any complex interactions or hidden mechanics that average players might miss.
    *   **Common Mistakes:** Detail specific errors players often make with this spec (rotational or positional) and how to avoid them.
    *   **Pro-Tips:** specific tricks to maximize throughput or survivability in high-difficulty content.`;
  
  try {
    return await generateContentWithGemini(prompt, finalSourceUrls);
  } catch (error) {
    // Use mock data on API failure
    console.warn('Using mock data for spec guide');
    statsService.recordMockUsage();
    toastService.info('📚 Using cached spec guide');
    return getMockSpecGuide(wowClass, spec, expansion);
  }
};

export const getRotationGuide = async (
  wowClass: WowClass,
  spec: Specialization,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {
  // Validate class and spec data before generation
  const validation = validateClassDataBeforeGeneration(
    wowClass.id,
    spec.id,
    undefined,
    customSourceUrls
  );

  if (!validation.isValid) {
    throw new Error(validation.error || 'Rotation guide data validation failed');
  }

  // Use verified sources from curator if available
  const finalSourceUrls = validation.context?.verifiedSourceUrls.join('\n') || sourceUrls;

  const expansionContext = expansion && expansion !== 'All' ? ` in ${expansion}` : ' in World of Warcraft\'s latest expansion';
  const prompt = `Generate a detailed rotation and ability priority guide for the ${spec.name} ${wowClass.name} specialization${expansionContext}. Format the response using markdown.

CRITICAL FORMATTING INSTRUCTION:
When listing specific class abilities, major offensive cooldowns, or defensive cooldowns, you MUST format them exactly like this:
\`[Ability Name]{Cooldown: X sec. ID: SpellID. Description: A brief 1-sentence description of what the ability does.}\`

Examples:
\`[Mortal Strike]{Cooldown: 6 sec. ID: 12294. Description: A vicious strike that deals high physical damage and reduces healing received.}\`
\`[Heroic Leap]{Cooldown: 45 sec. ID: 6544. Description: Leaps to a target location, dealing damage to all enemies within 8 yards.}\`

*   **Cooldown:** Provide the base cooldown.
*   **ID:** Provide the main Spell ID for the ability (best estimate for current patch).
*   **Description:** Provide a short summary *inside* the curly braces after the ID.

Include the following sections:

1.  **Single-Target Rotation:**
    *   A strict priority list of abilities. Explain *why* for each line.

2.  **Multi-Target (AoE) Rotation:**
    *   A priority list for fighting multiple enemies. Mention target counts.

3.  **Offensive Cooldown Usage:**
    *   Explain how to integrate major offensive cooldowns (Avatar, Combustion, Wings, etc.) for maximum burst.
    *   Use the specific \`[Ability]{...}\` format.

4.  **Defensive Cooldowns & Survival:**
    *   **Dedicated Section:** List each major defensive cooldown using the \`[Ability]{...}\` format.
    *   For each defensive, provide specific bullet points on **When to Use**:
        *   "Use on high incoming magic damage."
        *   "Save for Boss X's specific ability."
    *   Include Spell IDs for all defensives.`;
  
  try {
    return await generateContentWithGemini(prompt, finalSourceUrls);
  } catch (error) {
    // Use mock data on API failure
    console.warn('Using mock data for rotation guide');
    statsService.recordMockUsage();
    toastService.info('📚 Using cached rotation guide');
    return getMockRotationGuide(wowClass, spec, expansion);
  }
};

export const getAddons = async (
  wowClass: WowClass,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {
  // Validate class data before generation
  const validation = validateClassDataBeforeGeneration(
    wowClass.id,
    undefined,
    undefined,
    customSourceUrls
  );

  if (!validation.isValid) {
    throw new Error(validation.error || 'Addons guide data validation failed');
  }

  // Use verified sources from curator if available
  const finalSourceUrls = validation.context?.verifiedSourceUrls.join('\n') || sourceUrls;

  const expansionContext = expansion && expansion !== 'All' ? ` for ${expansion}` : ' for World of Warcraft\'s latest expansion';
  const prompt = `List the most essential addons and WeakAuras for a ${wowClass.name} player${expansionContext}. Format the response using markdown.
- **Addons:** Categorize them into "General Must-Haves" (like DBM, Details!) and "${wowClass.name} Specific". Briefly explain why each is useful.
- **WeakAuras:** 
  - Describe the key things a ${wowClass.name} must track, including major offensive cooldowns, defensive cooldowns, procs, and resource levels. 
  - Provide specific examples of WeakAura search terms for wago.io to find popular, comprehensive packs (e.g., "Afenar Warrior", "Luxthos Shaman").`;
  
  try {
    return await generateContentWithGemini(prompt, finalSourceUrls);
  } catch (error) {
    // Use mock data on API failure
    console.warn('Using mock data for addons guide');
    statsService.recordMockUsage();
    toastService.info('📚 Using cached addons guide');
    return getMockAddons(wowClass, expansion);
  }
};

export const getDungeonTips = async (
  wowClass: WowClass,
  spec: Specialization,
  dungeonName?: string,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {
  // Validate class, spec, and dungeon data before generation
  const validation = validateClassDataBeforeGeneration(
    wowClass.id,
    spec.id,
    dungeonName,
    customSourceUrls
  );

  if (!validation.isValid) {
    throw new Error(validation.error || 'Dungeon tips data validation failed');
  }

  // Use verified sources from curator if available
  const finalSourceUrls = validation.context?.verifiedSourceUrls.join('\n') || sourceUrls;

  let targetDungeon = dungeonName || "two popular Mythic+ dungeons from the current season";
  const expansionContext = expansion && expansion !== 'All' ? ` from ${expansion}` : '';
  
  const prompt = `For a ${spec.name} ${wowClass.name}, provide specific, expert-level tips for ${targetDungeon}${expansionContext} in World of Warcraft.
    
    Structure the response as follows:
    
    1.  **General Dungeon Strategy:**
        *   **Key Utility:** Where can this spec's utility (stuns, dispels, knocks) be used on specific trash packs?
    
    2.  **Boss Breakdown (Major Bosses):**
        *   Iterate through the main bosses of the dungeon.
        *   For each boss, provide **Spec-Specific Tips**:
            *   "Use [Defensive Cooldown] during Phase 2 when..."
            *   "Save burst for the add spawn at..."
            *   "Position yourself at X to bait Y mechanic."
    
    Format the response in markdown. Use the \`[Ability Name]{Cooldown: X sec. ID: Y}\` format if referencing specific class spells.`;
  
  try {
    return await generateContentWithGemini(prompt, finalSourceUrls);
  } catch (error) {
    // Use mock data on API failure
    console.warn('Using mock data for dungeon tips');
    statsService.recordMockUsage();
    toastService.info('📚 Using cached dungeon tips');
    return getMockDungeonTips(wowClass, spec, dungeonName, expansion);
  }
};
