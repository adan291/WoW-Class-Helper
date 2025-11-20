# Code Quality Review: services/geminiService.ts

**Date**: November 20, 2025  
**File**: `services/geminiService.ts`  
**Status**: ✅ Good overall structure with actionable improvements  
**Priority**: Medium (no critical issues, but several optimization opportunities)

---

## 1. Code Smells & Issues

### 1.1 Duplicate Prompt Validation Logic (High Priority)

**Issue**: Each public function (`getOverview`, `getSpecGuide`, `getRotationGuide`, `getAddons`, `getDungeonTips`) repeats the same validation pattern.

**Current Pattern** (repeated 5 times):
```typescript
const validation = validateClassDataBeforeGeneration(
  wowClass.id,
  spec.id,
  undefined,
  customSourceUrls
);

if (!validation.isValid) {
  throw new Error(validation.error || 'Specialization data validation failed');
}

const finalSourceUrls = validation.context?.verifiedSourceUrls.join('\n') || sourceUrls;
```

**Problem**:
- 15+ lines of duplicated code across 5 functions
- Violates DRY principle
- Harder to maintain and update validation logic
- Inconsistent error messages

**Recommendation**: Extract into a helper function

```typescript
/**
 * Prepares and validates guide generation parameters
 */
const prepareGuideGeneration = (
  validation: ReturnType<typeof validateClassDataBeforeGeneration>,
  sourceUrls?: string,
  errorContext: string = 'Guide generation'
): string => {
  if (!validation.isValid) {
    throw new Error(validation.error || `${errorContext} data validation failed`);
  }
  return validation.context?.verifiedSourceUrls.join('\n') || sourceUrls || '';
};

// Usage in each function:
const finalSourceUrls = prepareGuideGeneration(validation, sourceUrls, 'Specialization');
```

**Impact**: ⭐⭐⭐ High - Reduces code by ~50 lines, improves maintainability

---

### 1.2 Duplicate Expansion Context Logic (Medium Priority)

**Issue**: Expansion context string is generated identically in multiple functions.

**Current** (repeated 5 times):
```typescript
const expansionContext = expansion && expansion !== 'All' ? ` for ${expansion}` : ' for the latest expansion';
const expansionContext = expansion && expansion !== 'All' ? ` in ${expansion}` : ' in World of Warcraft\'s latest expansion';
const expansionContext = expansion && expansion !== 'All' ? ` from ${expansion}` : '';
```

**Problem**:
- Inconsistent prepositions (for, in, from)
- Repeated logic across functions
- Hard to maintain consistent messaging

**Recommendation**: Create a utility function

```typescript
/**
 * Generates expansion context string for prompts
 */
const getExpansionContext = (
  expansion?: string,
  preposition: 'for' | 'in' | 'from' = 'for',
  defaultText: string = 'the latest expansion'
): string => {
  if (!expansion || expansion === 'All') {
    return preposition === 'from' ? '' : ` ${preposition} ${defaultText}`;
  }
  return ` ${preposition} ${expansion}`;
};

// Usage:
const expansionContext = getExpansionContext(expansion, 'for');
const expansionContext = getExpansionContext(expansion, 'in', 'World of Warcraft\'s latest expansion');
```

**Impact**: ⭐⭐ Medium - Improves consistency and maintainability

---

### 1.3 Unused Constant (Low Priority)

**Issue**: `RESPONSE_MAX_LENGTH` is defined but never used.

**Current**:
```typescript
const RESPONSE_MAX_LENGTH = 100000; // Declared but unused
```

**Recommendation**: Either use it or remove it

```typescript
// Option 1: Use it for response validation
if (response.text.length > RESPONSE_MAX_LENGTH) {
  console.warn(`Response exceeds max length: ${response.text.length} > ${RESPONSE_MAX_LENGTH}`);
}

// Option 2: Remove if not needed
// Delete the constant entirely
```

**Impact**: ⭐ Low - Code cleanliness

---

### 1.4 Unused Callback Variable (Low Priority)

**Issue**: `retryProgressCallback` is set but never actually called in the retry loop.

**Current**:
```typescript
let retryProgressCallback: RetryProgressCallback | null = null;

// In retry logic:
if (retryProgressCallback) {
  retryProgressCallback(retryCount + 1, Math.ceil(waitTime / 1000));
}

// But the callback is never actually invoked during the wait loop
```

**Problem**:
- The callback is checked but the progress updates during the wait are ineffective
- The while loop updates `remaining` but doesn't call the callback

**Recommendation**: Fix the retry progress reporting

```typescript
// Wait with progress updates
const startTime = Date.now();
const updateInterval = setInterval(() => {
  const elapsed = Math.ceil((Date.now() - startTime) / 1000);
  const remaining = Math.ceil(waitTime / 1000) - elapsed;
  if (retryProgressCallback && remaining > 0) {
    retryProgressCallback(retryCount + 1, remaining);
  }
  if (remaining <= 0) {
    clearInterval(updateInterval);
  }
}, 500); // Update every 500ms

await delay(waitTime);
clearInterval(updateInterval);
```

**Impact**: ⭐⭐ Medium - Fixes incomplete feature

---

## 2. Design Patterns

### 2.1 Missing: Strategy Pattern for Prompt Generation

**Current State**: Each function has its own prompt generation logic inline.

**Recommendation**: Extract prompts into a strategy pattern

```typescript
// prompts/guidePrompts.ts
interface GuidePromptStrategy {
  generate(context: GuideContext): string;
}

class OverviewPromptStrategy implements GuidePromptStrategy {
  generate(context: GuideContext): string {
    const expansionContext = getExpansionContext(context.expansion, 'for');
    return `Provide a detailed and engaging overview for the ${context.wowClass.name} class...`;
  }
}

class SpecGuidePromptStrategy implements GuidePromptStrategy {
  generate(context: GuideContext): string {
    // Detailed spec guide prompt
  }
}

// Usage:
const promptStrategy = new OverviewPromptStrategy();
const prompt = promptStrategy.generate(context);
```

**Benefits**:
- Separates prompt logic from API logic
- Easier to test and maintain prompts
- Easier to add new guide types
- Follows Single Responsibility Principle

**Impact**: ⭐⭐⭐ High - Improves architecture and testability

---

### 2.2 Missing: Factory Pattern for Guide Generation

**Current State**: Each public function follows the same pattern (validate → generate → fallback).

**Recommendation**: Create a factory for guide generation

```typescript
type GuideType = 'overview' | 'spec' | 'rotation' | 'addons' | 'dungeons';

interface GuideGenerationParams {
  wowClass: WowClass;
  spec?: Specialization;
  dungeonName?: string;
  sourceUrls?: string;
  customSourceUrls?: string[];
  expansion?: string;
}

class GuideFactory {
  private strategies: Map<GuideType, GuidePromptStrategy> = new Map();

  constructor() {
    this.strategies.set('overview', new OverviewPromptStrategy());
    this.strategies.set('spec', new SpecGuidePromptStrategy());
    // ... etc
  }

  async generate(type: GuideType, params: GuideGenerationParams): Promise<string> {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new Error(`Unknown guide type: ${type}`);

    const validation = validateClassDataBeforeGeneration(
      params.wowClass.id,
      params.spec?.id,
      params.dungeonName,
      params.customSourceUrls
    );

    const finalSourceUrls = prepareGuideGeneration(validation, params.sourceUrls);
    const prompt = strategy.generate({ ...params, validation });

    try {
      return await generateContentWithGemini(prompt, finalSourceUrls);
    } catch (error) {
      return this.getFallbackContent(type, params);
    }
  }

  private getFallbackContent(type: GuideType, params: GuideGenerationParams): string {
    // Route to appropriate mock function
  }
}

// Usage:
const factory = new GuideFactory();
const content = await factory.generate('spec', { wowClass, spec, expansion });
```

**Benefits**:
- Eliminates code duplication
- Easier to add new guide types
- Centralized error handling
- Better testability

**Impact**: ⭐⭐⭐ High - Major refactoring opportunity

---

### 2.3 Missing: Decorator Pattern for Retry Logic

**Current State**: Retry logic is embedded in `generateContentWithGemini`.

**Recommendation**: Extract retry logic as a decorator

```typescript
/**
 * Decorator for adding retry logic to async functions
 */
function withRetry(
  maxRetries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY_MS
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (!isRetryableError(error) || attempt === maxRetries) {
            throw error;
          }

          const waitTime = delayMs * Math.pow(2, attempt);
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
          await delay(waitTime);
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

// Usage:
class GeminiService {
  @withRetry(MAX_RETRIES, RETRY_DELAY_MS)
  async generateContent(prompt: string): Promise<string> {
    // Simplified logic without retry handling
  }
}
```

**Benefits**:
- Separates retry logic from business logic
- Reusable across other async operations
- Easier to test
- Cleaner code

**Impact**: ⭐⭐ Medium - Improves code organization

---

## 3. Best Practices Adherence

### 3.1 ✅ TypeScript Compliance

**Status**: GOOD

**Strengths**:
- Proper type annotations on all functions
- Correct use of optional parameters
- Type-safe error handling

**Suggestions**:
```typescript
// Add return type annotations for clarity
export const getOverview = async (
  wowClass: WowClass,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {  // ✅ Good
```

**Impact**: ⭐ Low - Already compliant

---

### 3.2 ⚠️ Error Handling Pattern

**Status**: PARTIALLY COMPLIANT

**Issues**:
1. Generic error messages don't always provide context
2. Mock data fallback hides API failures from users
3. No error categorization (API vs validation vs network)

**Recommendation**: Implement error categorization

```typescript
enum ErrorCategory {
  API_KEY = 'API_KEY',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

interface CategorizedError extends Error {
  category: ErrorCategory;
  retryable: boolean;
  userMessage: string;
}

function categorizeError(error: unknown): CategorizedError {
  if (!(error instanceof Error)) {
    return {
      name: 'UnknownError',
      message: 'An unknown error occurred',
      category: ErrorCategory.UNKNOWN,
      retryable: false,
      userMessage: 'An unexpected error occurred. Please try again.',
    };
  }

  const msg = error.message.toLowerCase();

  if (msg.includes('api key')) {
    return {
      ...error,
      category: ErrorCategory.API_KEY,
      retryable: false,
      userMessage: 'API configuration error. Please contact support.',
    };
  }

  if (msg.includes('429') || msg.includes('rate limit')) {
    return {
      ...error,
      category: ErrorCategory.RATE_LIMIT,
      retryable: true,
      userMessage: 'Too many requests. Please wait a moment and try again.',
    };
  }

  // ... more categorization
}
```

**Impact**: ⭐⭐⭐ High - Improves error handling and UX

---

### 3.3 ✅ Validation Integration

**Status**: GOOD

**Strengths**:
- Validates class data before generation
- Validates source URLs
- Validates API responses

**Suggestion**: Add validation for prompt length before API call

```typescript
// Already done ✅
if (finalPrompt.length > PROMPT_MAX_LENGTH) {
  throw new Error('Prompt is too long. Please reduce the content size.');
}
```

**Impact**: ⭐ Low - Already implemented

---

## 4. Readability & Clarity

### 4.1 Long Prompts Reduce Readability

**Issue**: Prompts are embedded directly in functions, making them hard to read and maintain.

**Current**:
```typescript
const prompt = `Generate a comprehensive, expert-level guide focusing on the build, stats, and advanced strategies for the ${spec.name} ${wowClass.name} specialization${expansionContext}. Format the response using markdown. Include the following detailed sections:

1.  **Stat Priority:**
    *   List the optimal secondary stats...
    // ... 30+ more lines
`;
```

**Recommendation**: Extract prompts to separate file

```typescript
// prompts/specGuidePrompt.ts
export const createSpecGuidePrompt = (
  spec: Specialization,
  wowClass: WowClass,
  expansion?: string
): string => {
  const expansionContext = getExpansionContext(expansion, 'in', 'World of Warcraft\'s latest expansion');
  
  return `Generate a comprehensive, expert-level guide focusing on the build, stats, and advanced strategies for the ${spec.name} ${wowClass.name} specialization${expansionContext}. Format the response using markdown. Include the following detailed sections:

1.  **Stat Priority:**
    *   List the optimal secondary stats (e.g., Haste > Mastery > Critical Strike > Versatility) for this specialization.
    *   Provide a clear explanation of *why* each stat is important and how it interacts with the spec's kit.

// ... rest of prompt
`;
};

// Usage in geminiService.ts:
import { createSpecGuidePrompt } from '../prompts/specGuidePrompt.ts';

const prompt = createSpecGuidePrompt(spec, wowClass, expansion);
```

**Benefits**:
- Easier to read and maintain
- Easier to test prompts independently
- Easier to version control prompt changes
- Separates concerns

**Impact**: ⭐⭐⭐ High - Significantly improves readability

---

### 4.2 Add JSDoc Comments for Public Functions

**Current**:
```typescript
export const getOverview = async (
  wowClass: WowClass,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {
```

**Recommendation**: Add comprehensive JSDoc

```typescript
/**
 * Generates a class overview guide for the specified World of Warcraft class
 * 
 * @param wowClass - The WoW class to generate overview for
 * @param sourceUrls - Optional custom source URLs to inject into the prompt
 * @param customSourceUrls - Optional array of verified source URLs from admin
 * @param expansion - Optional expansion context (e.g., "Dragonflight", "The War Within")
 * @returns Promise resolving to markdown-formatted guide content
 * @throws Error if class validation fails or API is unavailable
 * 
 * @example
 * const guide = await getOverview(warrior, undefined, undefined, 'Dragonflight');
 * 
 * @remarks
 * - Falls back to mock data if API is unavailable
 * - Validates class data before generation
 * - Supports custom source URL injection for admin users
 */
export const getOverview = async (
  wowClass: WowClass,
  sourceUrls?: string,
  customSourceUrls?: string[],
  expansion?: string
): Promise<string> => {
```

**Impact**: ⭐⭐ Medium - Improves IDE support and documentation

---

## 5. Maintainability

### 5.1 Centralize Configuration Constants

**Current**:
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const PROMPT_MAX_LENGTH = 30000;
const RESPONSE_MAX_LENGTH = 100000;
```

**Recommendation**: Move to config file

```typescript
// config/geminiConfig.ts
export const GEMINI_CONFIG = {
  model: 'gemini-2.5-flash',
  maxRetries: 3,
  retryDelayMs: 1000,
  promptMaxLength: 30000,
  responseMaxLength: 100000,
  timeoutMs: 30000,
} as const;

// Usage:
import { GEMINI_CONFIG } from '../config/geminiConfig.ts';

if (retryCount < GEMINI_CONFIG.maxRetries) {
  const waitTime = GEMINI_CONFIG.retryDelayMs * Math.pow(2, retryCount);
}
```

**Benefits**:
- Centralized configuration
- Easier to adjust settings
- Type-safe configuration
- Reusable across services

**Impact**: ⭐⭐ Medium - Improves maintainability

---

### 5.2 Add Logging Strategy

**Current**: Inconsistent logging with `console.warn` and `console.error`

**Recommendation**: Implement structured logging

```typescript
// services/logger.ts
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      // Send to external logging service
      this.sendToExternalLogger(entry);
    }
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, {
      ...context,
      errorMessage: error?.message,
      errorStack: error?.stack,
    });
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  private sendToExternalLogger(entry: LogEntry) {
    // Send to Sentry, LogRocket, etc.
  }
}

export const logger = new Logger();

// Usage in geminiService.ts:
logger.error('Error calling Gemini API', error, {
  attempt: retryCount + 1,
  maxRetries: MAX_RETRIES,
});
```

**Impact**: ⭐⭐ Medium - Improves debugging and monitoring

---

## 6. Performance Optimization

### 6.1 Memoize Validation Results

**Issue**: `validateClassDataBeforeGeneration` is called for each guide type, potentially repeating work.

**Recommendation**: Add memoization

```typescript
import { useMemo } from 'react'; // Or use a memoization library

const memoizedValidation = useMemo(() => {
  return validateClassDataBeforeGeneration(
    wowClass.id,
    spec?.id,
    dungeonName,
    customSourceUrls
  );
}, [wowClass.id, spec?.id, dungeonName, customSourceUrls]);
```

**Or use a simple cache**:
```typescript
const validationCache = new Map<string, ReturnType<typeof validateClassDataBeforeGeneration>>();

function getCachedValidation(
  classId: string,
  specId?: string,
  dungeonName?: string,
  customSourceUrls?: string[]
): ReturnType<typeof validateClassDataBeforeGeneration> {
  const key = `${classId}:${specId}:${dungeonName}:${customSourceUrls?.join(',')}`;
  
  if (validationCache.has(key)) {
    return validationCache.get(key)!;
  }

  const result = validateClassDataBeforeGeneration(classId, specId, dungeonName, customSourceUrls);
  validationCache.set(key, result);
  return result;
}
```

**Impact**: ⭐⭐ Medium - Reduces redundant validation

---

### 6.2 Optimize Retry Wait Loop

**Issue**: The current retry wait loop is inefficient

**Current**:
```typescript
const startTime = Date.now();
while (Date.now() - startTime < waitTime) {
  const elapsed = Math.ceil((Date.now() - startTime) / 1000);
  const remaining = Math.ceil(waitTime / 1000) - elapsed;
  if (retryProgressCallback && remaining > 0) {
    retryProgressCallback(retryCount + 1, remaining);
  }
  await delay(100);
}
```

**Problem**:
- Busy-waits with 100ms intervals
- Calls callback too frequently
- Wastes CPU cycles

**Recommendation**: Use cleaner approach

```typescript
const waitTimeSeconds = Math.ceil(waitTime / 1000);
for (let second = 0; second < waitTimeSeconds; second++) {
  if (retryProgressCallback) {
    retryProgressCallback(retryCount + 1, waitTimeSeconds - second);
  }
  await delay(1000);
}
```

**Impact**: ⭐⭐ Medium - Improves efficiency

---

## 7. Testing Considerations

### 7.1 Add Unit Tests for Prompt Generation

```typescript
// services/geminiService.test.ts
describe('Prompt Generation', () => {
  it('should generate correct overview prompt', () => {
    const warrior = WOW_CLASSES[0];
    const prompt = createOverviewPrompt(warrior, 'Dragonflight');
    
    expect(prompt).toContain('Warrior');
    expect(prompt).toContain('Dragonflight');
    expect(prompt).toContain('markdown');
  });

  it('should handle missing expansion', () => {
    const warrior = WOW_CLASSES[0];
    const prompt = createOverviewPrompt(warrior);
    
    expect(prompt).toContain('latest expansion');
  });
});
```

**Impact**: ⭐⭐⭐ High - Ensures prompt quality

---

### 7.2 Add Integration Tests for Error Handling

```typescript
describe('Error Handling', () => {
  it('should retry on network error', async () => {
    const mockError = new Error('Network timeout');
    vi.spyOn(ai.models, 'generateContent')
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ text: 'Success' });

    const result = await generateContentWithGemini('test prompt');
    expect(result).toBe('Success');
  });

  it('should use mock data on API unavailable', async () => {
    const mockError = new Error('503 Service Unavailable');
    vi.spyOn(ai.models, 'generateContent').mockRejectedValue(mockError);

    const result = await getOverview(warrior);
    expect(result).toContain('[DEMO MODE]');
  });
});
```

**Impact**: ⭐⭐⭐ High - Ensures reliability

---

## Summary of Recommendations

### Priority 1 (High Impact)
1. **Extract duplicate validation logic** - Reduces code by ~50 lines
2. **Implement Strategy Pattern for prompts** - Improves architecture
3. **Extract prompts to separate file** - Significantly improves readability
4. **Implement error categorization** - Improves error handling and UX

### Priority 2 (Medium Impact)
1. **Extract expansion context logic** - Improves consistency
2. **Implement Factory Pattern** - Eliminates code duplication
3. **Centralize configuration** - Improves maintainability
4. **Add structured logging** - Improves debugging
5. **Optimize retry wait loop** - Improves efficiency

### Priority 3 (Low Impact)
1. **Remove unused constant** - Code cleanliness
2. **Add JSDoc comments** - Improves documentation
3. **Fix retry progress callback** - Completes feature
4. **Add memoization** - Minor performance gain

---

## Estimated Refactoring Effort

| Task | Effort | Impact |
|------|--------|--------|
| Extract duplicate validation | 1-2 hours | High |
| Extract prompts to file | 2-3 hours | High |
| Implement Strategy Pattern | 3-4 hours | High |
| Error categorization | 2-3 hours | High |
| Expansion context utility | 30 min | Medium |
| Centralize config | 1 hour | Medium |
| Structured logging | 2-3 hours | Medium |
| **Total** | **12-18 hours** | **Significant improvement** |

---

## Conclusion

**Overall Assessment**: ✅ **GOOD** - The code is functional and follows most best practices, but has significant opportunities for improvement through refactoring.

**Key Strengths**:
- ✅ Comprehensive error handling
- ✅ Good validation integration
- ✅ Proper TypeScript usage
- ✅ Mock data fallback strategy

**Key Weaknesses**:
- ❌ Significant code duplication (5 similar functions)
- ❌ Long prompts embedded in functions
- ❌ Missing design patterns (Strategy, Factory)
- ❌ Inconsistent error categorization

**Recommended Next Steps**:
1. Extract duplicate validation logic (quick win)
2. Move prompts to separate file (improves readability)
3. Implement Strategy Pattern (improves architecture)
4. Add error categorization (improves UX)

All recommendations maintain existing functionality while improving code quality, maintainability, and performance.
