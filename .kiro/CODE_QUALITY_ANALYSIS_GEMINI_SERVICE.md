# Code Quality Analysis: geminiService.ts

**Date**: November 20, 2025  
**File**: `services/geminiService.ts`  
**Status**: ⚠️ **UNUSED IMPORTS DETECTED**  
**Priority**: Medium

---

## Executive Summary

The recent import additions from `classOrchestratorService.ts` are **not currently used** in the file, creating code smell and potential confusion. The file is otherwise well-structured with good error handling and validation practices. This analysis provides actionable recommendations to improve code quality and maintainability.

---

## 1. Code Smells

### ✅ RESOLVED: Unused Imports

**Status**: Fixed ✓

The imports from `classOrchestratorService.ts` are actually used in the `validateClassDataBeforeGeneration` function:

```typescript
import {
  validateAndPrepareGuideRequest,
  type GeminiReadyContext,
} from './classOrchestratorService.ts';

// Used in:
const validateClassDataBeforeGeneration = (
  classId: string,
  specId?: string,
  dungeonName?: string,
  customSourceUrls?: string[]
): { isValid: boolean; context: GeminiReadyContext | null; error?: string } => {
  const validation = validateAndPrepareGuideRequest(
    classId,
    specId,
    dungeonName,
    customSourceUrls
  );
  // ...
};
```

**Note**: The `prepareGeminiContext` import was removed as it's not used. Only the necessary imports are retained.

---

### 🟡 MEDIUM: Prompt String Duplication

**Issue**: Prompt templates are defined inline in each export function, creating duplication and maintenance burden.

**Current Pattern**:
```typescript
export const getOverview = (wowClass: WowClass, sourceUrls?: string): Promise<string> => {
    const prompt = `Provide a detailed and engaging overview...`;
    return generateContentWithGemini(prompt, sourceUrls);
};

export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
    const prompt = `Generate a comprehensive, expert-level guide...`;
    return generateContentWithGemini(prompt, sourceUrls);
};
```

**Problems**:
- Prompts are scattered throughout the file
- Hard to maintain and update consistently
- Difficult to version control prompt changes
- No centralized prompt management

**Recommendation**: Extract prompts to a separate module:

```typescript
// services/geminiPrompts.ts
export const PROMPTS = {
  overview: (wowClass: WowClass): string =>
    `Provide a detailed and engaging overview for the ${wowClass.name} class...`,
  
  specGuide: (wowClass: WowClass, spec: Specialization): string =>
    `Generate a comprehensive, expert-level guide for ${spec.name} ${wowClass.name}...`,
  
  rotationGuide: (wowClass: WowClass, spec: Specialization): string =>
    `Generate a detailed rotation guide for ${spec.name} ${wowClass.name}...`,
  
  addons: (wowClass: WowClass): string =>
    `List the most essential addons for ${wowClass.name}...`,
  
  dungeonTips: (wowClass: WowClass, spec: Specialization, dungeonName?: string): string =>
    `Provide tips for ${spec.name} ${wowClass.name} in ${dungeonName || 'dungeons'}...`,
};
```

Then use in geminiService:
```typescript
import { PROMPTS } from './geminiPrompts.ts';

export const getOverview = (wowClass: WowClass, sourceUrls?: string): Promise<string> => {
  const prompt = PROMPTS.overview(wowClass);
  return generateContentWithGemini(prompt, sourceUrls);
};
```

**Benefits**:
- Centralized prompt management
- Easier to update and version
- Better separation of concerns
- Easier to test prompts independently

---

### 🟡 MEDIUM: Long Function with Multiple Responsibilities

**Issue**: `generateContentWithGemini` handles validation, error handling, retries, and API calls.

**Current Structure**:
```typescript
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string,
  retryCount = 0
): Promise<string> => {
  // 1. Validate API key
  // 2. Validate prompt
  // 3. Validate and process source URLs
  // 4. Validate prompt length
  // 5. Call API
  // 6. Validate response
  // 7. Handle errors with retry logic
  // 8. Provide specific error messages
};
```

**Problems**:
- Function is ~100 lines long
- Multiple levels of nesting
- Hard to test individual validations
- Retry logic mixed with business logic

**Recommendation**: Extract validation into separate functions:

```typescript
// Validation functions
const validateApiConfiguration = (): void => {
  if (!process.env.API_KEY) {
    throw new Error('API key not configured. Please set GEMINI_API_KEY environment variable.');
  }
};

const validatePrompt = (prompt: string): void => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Invalid prompt provided to API');
  }
};

const validatePromptLength = (prompt: string): void => {
  if (prompt.length > 30000) {
    throw new Error('Prompt is too long. Please reduce the content size.');
  }
};

// Refactored main function
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string,
  retryCount = 0
): Promise<string> => {
  try {
    validateApiConfiguration();
    validatePrompt(prompt);
    
    let finalPrompt = prompt;
    if (sourceUrls?.trim()) {
      finalPrompt = await processSourceUrls(prompt, sourceUrls);
    }
    
    validatePromptLength(finalPrompt);
    
    const response = await callGeminiApi(finalPrompt);
    return response;
  } catch (error) {
    return handleApiError(error, prompt, sourceUrls, retryCount);
  }
};
```

**Benefits**:
- Each function has single responsibility
- Easier to test individual validations
- Clearer error handling flow
- More maintainable and readable

---

## 2. Design Patterns

### ✅ GOOD: Retry Pattern with Exponential Backoff

**Current Implementation**:
```typescript
const isRetryable = error instanceof Error && (
  error.message.includes('timeout') ||
  error.message.includes('network') ||
  error.message.includes('temporarily') ||
  error.message.includes('503') ||
  error.message.includes('429')
);

if (isRetryable && retryCount < MAX_RETRIES) {
  const waitTime = RETRY_DELAY_MS * Math.pow(2, retryCount);
  await delay(waitTime);
  return generateContentWithGemini(prompt, sourceUrls, retryCount + 1);
}
```

**Strengths**:
- Handles transient errors appropriately
- Exponential backoff prevents overwhelming API
- Clear retry conditions
- Respects rate limiting (429) and server errors (503)

**Enhancement**: Extract retry logic into reusable utility:

```typescript
// services/retryUtils.ts
interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  isRetryable?: (error: unknown) => boolean;
}

export const withRetry = async <T>(
  fn: (retryCount: number) => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      
      const shouldRetry = options.isRetryable?.(error) ?? true;
      if (!shouldRetry || attempt === options.maxRetries) {
        throw error;
      }
      
      const waitTime = options.initialDelayMs * Math.pow(2, attempt);
      await delay(waitTime);
    }
  }
  
  throw lastError;
};
```

Then use:
```typescript
const response = await withRetry(
  (retryCount) => callGeminiApi(finalPrompt),
  {
    maxRetries: MAX_RETRIES,
    initialDelayMs: RETRY_DELAY_MS,
    isRetryable: (error) => isTransientError(error),
  }
);
```

---

### 🟡 MEDIUM: Error Categorization Pattern

**Current Implementation**:
```typescript
if (error instanceof Error) {
  if (error.message.includes('API key')) {
    throw new Error('API configuration error...');
  }
  if (error.message.includes('URL')) {
    throw new Error(`URL validation error: ${error.message}`);
  }
  if (error.message.includes('Invalid prompt')) {
    throw new Error('The request could not be processed...');
  }
  throw error;
}
```

**Issue**: String matching is fragile and error-prone.

**Recommendation**: Use error types instead:

```typescript
// services/errors.ts
export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigurationError';
  }
}

export class UrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlValidationError';
  }
}

export class PromptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptValidationError';
  }
}

// In geminiService.ts
try {
  // ...
} catch (error) {
  if (error instanceof ApiConfigurationError) {
    throw new Error('API configuration error. Please check your GEMINI_API_KEY environment variable.');
  }
  if (error instanceof UrlValidationError) {
    throw new Error(`URL validation error: ${error.message}`);
  }
  if (error instanceof PromptValidationError) {
    throw new Error('The request could not be processed. Please try again.');
  }
  throw error;
}
```

**Benefits**:
- Type-safe error handling
- Easier to test specific error scenarios
- Better IDE support and autocomplete
- More maintainable error categorization

---

## 3. Best Practices

### ✅ GOOD: Comprehensive Error Handling

**Strengths**:
- Validates API key before making request
- Validates prompt structure and length
- Validates API response
- Provides user-friendly error messages
- Logs errors for debugging

**Alignment with project-standards.md**:
- ✅ Follows error handling best practices
- ✅ Provides actionable recovery steps
- ✅ Never silently fails
- ✅ Logs to console for debugging

---

### ✅ GOOD: Source URL Validation

**Current Implementation**:
```typescript
if (sourceUrls && sourceUrls.trim() !== '') {
  const validation = validateSourceUrls(sourceUrls);
  
  if (!validation.valid) {
    const errorMsg = validation.errors.join('\n');
    throw new Error(`Invalid source URLs:\n${errorMsg}`);
  }
  
  if (validation.urls.length > 0) {
    const urls = validation.urls.map(url => `- ${url}`).join('\n');
    finalPrompt = `IMPORTANT: Your primary task is to act as an expert...`;
  }
}
```

**Strengths**:
- Validates URLs before injection
- Provides detailed error messages
- Follows security best practices
- Aligns with gemini-api-guidelines.md

---

### 🟡 MEDIUM: API Key Validation Timing

**Issue**: API key is validated inside the try block, but it's a configuration issue, not a runtime error.

**Current**:
```typescript
try {
  if (!process.env.API_KEY) {
    throw new Error('API key not configured...');
  }
  // ... rest of logic
}
```

**Recommendation**: Validate at module initialization:

```typescript
// At module level
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set. Please configure it before using the service.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Then in function, no need to check again
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string,
  retryCount = 0
): Promise<string> => {
  try {
    validatePrompt(prompt);
    // ... rest of logic
  } catch (error) {
    // ...
  }
};
```

**Benefits**:
- Fails fast at startup if misconfigured
- Cleaner function logic
- Better error messages
- Prevents repeated validation

---

## 4. Readability

### 🟡 MEDIUM: Long Prompt Strings

**Issue**: Prompt strings are very long (100+ lines), making the file hard to read.

**Current**:
```typescript
export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
    const prompt = `Generate a comprehensive, expert-level guide focusing on the build, stats, and advanced strategies for the ${spec.name} ${wowClass.name} specialization in World of Warcraft's latest expansion. Format the response using markdown. Include the following detailed sections:

1.  **Stat Priority:**
    *   List the optimal secondary stats (e.g., Haste > Mastery > Critical Strike > Versatility) for this specialization.
    ...
    [100+ more lines]
    `;
    return generateContentWithGemini(prompt, sourceUrls);
};
```

**Recommendation**: Move to separate file (as mentioned in Code Smells section):

```typescript
// services/geminiPrompts.ts
export const PROMPTS = {
  specGuide: (wowClass: WowClass, spec: Specialization): string => `
Generate a comprehensive, expert-level guide focusing on the build, stats, and advanced strategies for the ${spec.name} ${wowClass.name} specialization in World of Warcraft's latest expansion. Format the response using markdown. Include the following detailed sections:

1.  **Stat Priority:**
    ...
  `.trim(),
};

// services/geminiService.ts
export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
  const prompt = PROMPTS.specGuide(wowClass, spec);
  return generateContentWithGemini(prompt, sourceUrls);
};
```

**Benefits**:
- File is much shorter and easier to read
- Prompts are easier to maintain
- Can version control prompts separately
- Easier to test prompt generation

---

### ✅ GOOD: Clear Function Documentation

**Current**:
```typescript
/**
 * Implements exponential backoff for retries
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates content with retry logic and comprehensive error handling
 */
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string,
  retryCount = 0
): Promise<string> => {
```

**Strengths**:
- Clear purpose statements
- Explains "why" not just "what"
- Helps developers understand intent

---

## 5. Maintainability

### 🟡 MEDIUM: Magic Numbers and Strings

**Issue**: Constants are defined but some values are hardcoded in strings.

**Current**:
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// But in prompts:
const prompt = `...Haste > Mastery > Critical Strike > Versatility...`;
const prompt = `...Avatar, Combustion, Wings...`;
```

**Recommendation**: Extract game-specific constants:

```typescript
// services/wowConstants.ts
export const WOW_STATS = {
  SECONDARY: ['Haste', 'Mastery', 'Critical Strike', 'Versatility'],
  PRIORITY_ORDER: 'Haste > Mastery > Critical Strike > Versatility',
};

export const WOW_ABILITIES = {
  WARRIOR: {
    OFFENSIVE: ['Avatar', 'Heroic Leap'],
    DEFENSIVE: ['Shield Wall', 'Last Stand'],
  },
  // ... other classes
};

// Then in prompts:
const prompt = `...${WOW_STATS.PRIORITY_ORDER}...`;
```

**Benefits**:
- Single source of truth for game data
- Easier to update when patch changes
- Reusable across services
- Better maintainability

---

### 🟡 MEDIUM: No Type Safety for Prompt Parameters

**Issue**: Prompt functions accept any WowClass and Specialization without validation.

**Current**:
```typescript
export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
  // No validation that spec belongs to wowClass
  const prompt = `...${spec.name} ${wowClass.name}...`;
  return generateContentWithGemini(prompt, sourceUrls);
};
```

**Recommendation**: Add validation:

```typescript
export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
  // Validate spec belongs to class
  if (!wowClass.specs.some(s => s.id === spec.id)) {
    throw new Error(`Specialization ${spec.name} does not belong to class ${wowClass.name}`);
  }
  
  const prompt = PROMPTS.specGuide(wowClass, spec);
  return generateContentWithGemini(prompt, sourceUrls);
};
```

**Benefits**:
- Catches bugs early
- Prevents invalid API calls
- Better error messages
- Aligns with CP1 (Class & Specialization Consistency)

---

## 6. Performance

### ✅ GOOD: Efficient Error Handling

**Current**:
```typescript
const isRetryable = error instanceof Error && (
  error.message.includes('timeout') ||
  error.message.includes('network') ||
  error.message.includes('temporarily') ||
  error.message.includes('503') ||
  error.message.includes('429')
);
```

**Strengths**:
- Only retries transient errors
- Prevents unnecessary API calls
- Respects rate limiting

---

### 🟡 MEDIUM: Prompt Length Validation

**Current**:
```typescript
if (finalPrompt.length > 30000) {
  throw new Error('Prompt is too long. Please reduce the content size.');
}
```

**Issue**: Validates after building prompt, but could validate earlier.

**Recommendation**: Validate components before building:

```typescript
const validatePromptComponents = (
  basePrompt: string,
  sourceUrls?: string
): void => {
  if (basePrompt.length > 25000) {
    throw new Error('Base prompt is too long');
  }
  
  if (sourceUrls && sourceUrls.length > 5000) {
    throw new Error('Source URLs are too long');
  }
};

// Then in main function:
validatePromptComponents(prompt, sourceUrls);
let finalPrompt = prompt;
if (sourceUrls?.trim()) {
  finalPrompt = await processSourceUrls(prompt, sourceUrls);
}
```

**Benefits**:
- Fails faster with clearer error
- Prevents unnecessary string concatenation
- Better performance

---

## Summary of Recommendations

| Priority | Issue | Action | Impact |
|----------|-------|--------|--------|
| 🟡 HIGH | Prompt duplication | Extract to `geminiPrompts.ts` | Maintainability, testability |
| 🟡 HIGH | Long function | Extract validation functions | Readability, testability |
| 🟡 MEDIUM | Error categorization | Use error types | Type safety, maintainability |
| 🟡 MEDIUM | API key validation | Move to module level | Performance, clarity |
| 🟡 MEDIUM | Spec validation | Add validation | Bug prevention, consistency |
| 🟡 MEDIUM | Magic numbers | Extract constants | Maintainability |

---

## Implementation Priority

### Phase 1 (Immediate)
1. ✅ Fixed: Removed unused `prepareGeminiContext` import
2. ✅ Fixed: Retained necessary imports for data validation

### Phase 2 (This Sprint)
1. Extract prompts to `geminiPrompts.ts`
2. Add spec validation to guide functions
3. Extract validation functions

### Phase 3 (Next Sprint)
1. Implement error types
2. Extract retry logic to utility
3. Move API key validation to module level

---

## Alignment with Project Standards

✅ **Follows project-standards.md**:
- Error handling best practices
- API integration patterns
- TypeScript conventions
- Code organization

⚠️ **Could improve**:
- Reduce function complexity
- Better separation of concerns
- More comprehensive validation

---

## Testing Recommendations

After implementing changes, add tests for:

```typescript
describe('geminiService', () => {
  describe('validation', () => {
    it('should reject invalid spec for class', () => {
      const warrior = WOW_CLASSES[0];
      const mageSpec = WOW_CLASSES.find(c => c.name === 'Mage')?.specs[0];
      
      expect(() => getSpecGuide(warrior, mageSpec!)).toThrow();
    });
  });
  
  describe('prompts', () => {
    it('should generate valid prompts', () => {
      const prompt = PROMPTS.specGuide(warrior, spec);
      expect(prompt).toContain(warrior.name);
      expect(prompt).toContain(spec.name);
    });
  });
});
```

---

*Analysis completed: November 20, 2025*  
*Recommendations prioritized by impact and effort*

