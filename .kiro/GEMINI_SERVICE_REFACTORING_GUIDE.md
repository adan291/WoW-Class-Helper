# geminiService.ts - Refactoring Implementation Guide

**Date**: November 20, 2025  
**Purpose**: Step-by-step guide to implement code quality improvements  
**Estimated Time**: 2-3 hours for Phase 1

---

## Phase 1: Extract Prompts (HIGH PRIORITY)

### Step 1: Create `services/geminiPrompts.ts`

```typescript
/**
 * Gemini API Prompt Templates
 * 
 * Centralized management of all prompts used for guide generation.
 * This separation makes prompts easier to maintain, version, and test.
 */

import type { WowClass, Specialization } from '../types.ts';

export const PROMPTS = {
  /**
   * Overview prompt for a WoW class
   */
  overview: (wowClass: WowClass): string => `
Provide a detailed and engaging overview for the ${wowClass.name} class in World of Warcraft for the latest expansion. Include its core identity, playstyle, strengths, weaknesses, and a summary of the most significant changes in the most recent major patch. Format the response using markdown.
  `.trim(),

  /**
   * Specialization guide prompt with detailed sections
   */
  specGuide: (wowClass: WowClass, spec: Specialization): string => `
Generate a comprehensive, expert-level guide focusing on the build, stats, and advanced strategies for the ${spec.name} ${wowClass.name} specialization in World of Warcraft's latest expansion. Format the response using markdown. Include the following detailed sections:

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
    *   **Pro-Tips:** specific tricks to maximize throughput or survivability in high-difficulty content.
  `.trim(),

  /**
   * Rotation guide prompt with ability formatting
   */
  rotationGuide: (wowClass: WowClass, spec: Specialization): string => `
Generate a detailed rotation and ability priority guide for the ${spec.name} ${wowClass.name} specialization in World of Warcraft's latest expansion. Format the response using markdown.

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
    *   Include Spell IDs for all defensives.
  `.trim(),

  /**
   * Addons and WeakAuras prompt
   */
  addons: (wowClass: WowClass): string => `
List the most essential addons and WeakAuras for a ${wowClass.name} player in World of Warcraft's latest expansion. Format the response using markdown.
- **Addons:** Categorize them into "General Must-Haves" (like DBM, Details!) and "${wowClass.name} Specific". Briefly explain why each is useful.
- **WeakAuras:** 
  - Describe the key things a ${wowClass.name} must track, including major offensive cooldowns, defensive cooldowns, procs, and resource levels. 
  - Provide specific examples of WeakAura search terms for wago.io to find popular, comprehensive packs (e.g., "Afenar Warrior", "Luxthos Shaman").
  `.trim(),

  /**
   * Dungeon-specific tips prompt
   */
  dungeonTips: (wowClass: WowClass, spec: Specialization, dungeonName?: string): string => {
    const targetDungeon = dungeonName || "two popular Mythic+ dungeons from the current season";
    
    return `
For a ${spec.name} ${wowClass.name}, provide specific, expert-level tips for ${targetDungeon} in World of Warcraft.

Structure the response as follows:

1.  **General Dungeon Strategy:**
    *   **Key Utility:** Where can this spec's utility (stuns, dispels, knocks) be used on specific trash packs?

2.  **Boss Breakdown (Major Bosses):**
    *   Iterate through the main bosses of the dungeon.
    *   For each boss, provide **Spec-Specific Tips**:
        *   "Use [Defensive Cooldown] during Phase 2 when..."
        *   "Save burst for the add spawn at..."
        *   "Position yourself at X to bait Y mechanic."

Format the response in markdown. Use the \`[Ability Name]{Cooldown: X sec. ID: Y}\` format if referencing specific class spells.
    `.trim();
  },
};
```

### Step 2: Update `services/geminiService.ts`

Replace the inline prompts with imports:

```typescript
import { PROMPTS } from './geminiPrompts.ts';

// Before: 100+ lines of prompt text
export const getOverview = (wowClass: WowClass, sourceUrls?: string): Promise<string> => {
    const prompt = `Provide a detailed and engaging overview for the ${wowClass.name} class...
    [100+ lines]
    `;
    return generateContentWithGemini(prompt, sourceUrls);
};

// After: Clean and focused
export const getOverview = (wowClass: WowClass, sourceUrls?: string): Promise<string> => {
  const prompt = PROMPTS.overview(wowClass);
  return generateContentWithGemini(prompt, sourceUrls);
};

export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
  const prompt = PROMPTS.specGuide(wowClass, spec);
  return generateContentWithGemini(prompt, sourceUrls);
};

export const getRotationGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
  const prompt = PROMPTS.rotationGuide(wowClass, spec);
  return generateContentWithGemini(prompt, sourceUrls);
};

export const getAddons = (wowClass: WowClass, sourceUrls?: string): Promise<string> => {
  const prompt = PROMPTS.addons(wowClass);
  return generateContentWithGemini(prompt, sourceUrls);
};

export const getDungeonTips = (wowClass: WowClass, spec: Specialization, dungeonName?: string, sourceUrls?: string): Promise<string> => {
  const prompt = PROMPTS.dungeonTips(wowClass, spec, dungeonName);
  return generateContentWithGemini(prompt, sourceUrls);
};
```

**Result**: File size reduced from 300+ lines to ~150 lines

---

## Phase 2: Extract Validation Functions (HIGH PRIORITY)

### Step 1: Create validation helper functions

Add these functions to `services/geminiService.ts`:

```typescript
/**
 * Validates that the API key is configured
 */
const validateApiConfiguration = (): void => {
  if (!process.env.API_KEY) {
    throw new Error('API key not configured. Please set GEMINI_API_KEY environment variable.');
  }
};

/**
 * Validates that the prompt is valid
 */
const validatePrompt = (prompt: string): void => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Invalid prompt provided to API');
  }
};

/**
 * Validates that the prompt length is within limits
 */
const validatePromptLength = (prompt: string, maxLength: number = 30000): void => {
  if (prompt.length > maxLength) {
    throw new Error(`Prompt is too long (${prompt.length} chars). Maximum allowed: ${maxLength} chars.`);
  }
};

/**
 * Processes and validates source URLs, then injects them into the prompt
 */
const injectSourceUrls = (basePrompt: string, sourceUrls?: string): string => {
  if (!sourceUrls || !sourceUrls.trim()) {
    return basePrompt;
  }

  const validation = validateSourceUrls(sourceUrls);

  if (!validation.valid) {
    const errorMsg = validation.errors.join('\n');
    throw new Error(`Invalid source URLs:\n${errorMsg}`);
  }

  if (validation.urls.length === 0) {
    return basePrompt;
  }

  const urls = validation.urls.map(url => `- ${url}`).join('\n');
  return `IMPORTANT: Your primary task is to act as an expert World of Warcraft guide writer. You MUST use the information from the following web pages to construct your answer. If the information from these sources conflicts with your base knowledge, you MUST prioritize the information from the provided URLs. At the end of your response, you MUST cite the URLs you used under a "Sources:" heading.\n\nProvided URLs:\n${urls}\n\n---\n\nOriginal Request:\n${basePrompt}`;
};
```

### Step 2: Refactor `generateContentWithGemini`

```typescript
/**
 * Generates content with retry logic and comprehensive error handling
 */
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string,
  retryCount = 0
): Promise<string> => {
  try {
    // Validate inputs
    validateApiConfiguration();
    validatePrompt(prompt);

    // Process source URLs
    let finalPrompt = injectSourceUrls(prompt, sourceUrls);

    // Validate final prompt length
    validatePromptLength(finalPrompt);

    // Call API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });

    // Validate response
    if (!validateApiResponse(response?.text)) {
      throw new Error('Empty response from API');
    }

    return response.text;
  } catch (error) {
    return handleApiError(error, prompt, sourceUrls, retryCount);
  }
};

/**
 * Handles API errors with retry logic and user-friendly messages
 */
const handleApiError = async (
  error: unknown,
  prompt: string,
  sourceUrls: string | undefined,
  retryCount: number
): Promise<string> => {
  console.error(`Error calling Gemini API (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);

  // Determine if error is retryable
  const isRetryable =
    error instanceof Error &&
    (error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('temporarily') ||
      error.message.includes('503') ||
      error.message.includes('429'));

  if (isRetryable && retryCount < MAX_RETRIES) {
    const waitTime = RETRY_DELAY_MS * Math.pow(2, retryCount);
    console.log(`Retrying in ${waitTime}ms...`);
    await delay(waitTime);
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
    throw error;
  }

  throw new Error('Failed to generate content from AI. Please try again later.');
};
```

**Result**: Main function is now ~30 lines instead of ~100 lines, with clear separation of concerns

---

## Phase 3: Add Spec Validation (MEDIUM PRIORITY)

### Add validation to guide functions

```typescript
/**
 * Validates that a specialization belongs to a class
 */
const validateSpecBelongsToClass = (wowClass: WowClass, spec: Specialization): void => {
  if (!wowClass.specs.some(s => s.id === spec.id)) {
    throw new Error(
      `Specialization "${spec.name}" does not belong to class "${wowClass.name}". ` +
      `Valid specs for ${wowClass.name}: ${wowClass.specs.map(s => s.name).join(', ')}`
    );
  }
};

// Update guide functions
export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
  validateSpecBelongsToClass(wowClass, spec);
  const prompt = PROMPTS.specGuide(wowClass, spec);
  return generateContentWithGemini(prompt, sourceUrls);
};

export const getRotationGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
  validateSpecBelongsToClass(wowClass, spec);
  const prompt = PROMPTS.rotationGuide(wowClass, spec);
  return generateContentWithGemini(prompt, sourceUrls);
};

export const getDungeonTips = (wowClass: WowClass, spec: Specialization, dungeonName?: string, sourceUrls?: string): Promise<string> => {
  validateSpecBelongsToClass(wowClass, spec);
  const prompt = PROMPTS.dungeonTips(wowClass, spec, dungeonName);
  return generateContentWithGemini(prompt, sourceUrls);
};
```

---

## Testing the Refactored Code

### Unit tests for prompts

```typescript
// services/geminiPrompts.test.ts
import { describe, it, expect } from 'vitest';
import { PROMPTS } from './geminiPrompts.ts';
import { WOW_CLASSES } from '../constants.ts';

describe('geminiPrompts', () => {
  const warrior = WOW_CLASSES.find(c => c.name === 'Warrior')!;
  const armsSpec = warrior.specs.find(s => s.name === 'Arms')!;

  describe('overview', () => {
    it('should include class name', () => {
      const prompt = PROMPTS.overview(warrior);
      expect(prompt).toContain(warrior.name);
    });

    it('should request markdown format', () => {
      const prompt = PROMPTS.overview(warrior);
      expect(prompt).toContain('markdown');
    });
  });

  describe('specGuide', () => {
    it('should include class and spec names', () => {
      const prompt = PROMPTS.specGuide(warrior, armsSpec);
      expect(prompt).toContain(warrior.name);
      expect(prompt).toContain(armsSpec.name);
    });

    it('should include stat priority section', () => {
      const prompt = PROMPTS.specGuide(warrior, armsSpec);
      expect(prompt).toContain('Stat Priority');
    });
  });

  describe('dungeonTips', () => {
    it('should use provided dungeon name', () => {
      const prompt = PROMPTS.dungeonTips(warrior, armsSpec, 'Shadowmoon');
      expect(prompt).toContain('Shadowmoon');
    });

    it('should use default dungeon text if not provided', () => {
      const prompt = PROMPTS.dungeonTips(warrior, armsSpec);
      expect(prompt).toContain('Mythic+');
    });
  });
});
```

### Unit tests for validation

```typescript
// services/geminiService.test.ts
import { describe, it, expect } from 'vitest';
import { getSpecGuide } from './geminiService.ts';
import { WOW_CLASSES } from '../constants.ts';

describe('geminiService validation', () => {
  const warrior = WOW_CLASSES.find(c => c.name === 'Warrior')!;
  const mage = WOW_CLASSES.find(c => c.name === 'Mage')!;
  const armsSpec = warrior.specs[0];
  const fireSpec = mage.specs[0];

  it('should reject spec from different class', () => {
    expect(() => getSpecGuide(warrior, fireSpec)).toThrow(
      /does not belong to class/
    );
  });

  it('should accept valid spec for class', () => {
    expect(() => getSpecGuide(warrior, armsSpec)).not.toThrow();
  });
});
```

---

## Checklist for Implementation

### Phase 1: Extract Prompts
- [ ] Create `services/geminiPrompts.ts`
- [ ] Copy all prompt templates
- [ ] Update `services/geminiService.ts` to import and use prompts
- [ ] Verify all functions still work
- [ ] Run tests: `npm run test -- geminiService`
- [ ] Verify file size reduction

### Phase 2: Extract Validation
- [ ] Create validation helper functions
- [ ] Refactor `generateContentWithGemini`
- [ ] Extract `handleApiError` function
- [ ] Verify all functions still work
- [ ] Run tests: `npm run test -- geminiService`
- [ ] Verify code readability improvement

### Phase 3: Add Spec Validation
- [ ] Create `validateSpecBelongsToClass` function
- [ ] Add validation to `getSpecGuide`, `getRotationGuide`, `getDungeonTips`
- [ ] Add unit tests for validation
- [ ] Run tests: `npm run test -- geminiService`
- [ ] Verify error messages are clear

### Final Verification
- [ ] All tests pass: `npm run test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No linting errors: `npm run lint` (if configured)
- [ ] Code review completed
- [ ] Commit with clear message

---

## Expected Results

### Before Refactoring
- File size: 300+ lines
- Function complexity: High
- Test coverage: ~50%
- Prompt maintenance: Difficult

### After Refactoring
- File size: ~150 lines
- Function complexity: Medium
- Test coverage: >80%
- Prompt maintenance: Easy

---

## Rollback Plan

If issues arise:

```bash
# Revert to previous version
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
```

---

## Questions?

Refer to:
- `.kiro/CODE_QUALITY_ANALYSIS_GEMINI_SERVICE.md` - Full analysis
- `.kiro/GEMINI_SERVICE_QUALITY_SUMMARY.md` - Summary and recommendations
- `project-standards.md` - Project coding standards
- `gemini-api-guidelines.md` - API integration guidelines

