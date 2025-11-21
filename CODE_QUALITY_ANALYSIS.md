# Code Quality Analysis - WoW AI Class Helper

**Date**: November 21, 2025  
**Status**: Critical Issues Found - Action Required  
**Priority**: HIGH

---

## Executive Summary

The codebase has **12 critical errors** and **11 warnings** that need immediate attention. These issues fall into three categories:

1. **Missing Services** (statsService, fallbackService)
2. **Type Mismatches** (WowSpec, warnings property)
3. **Unused Imports & Variables** (code cleanup needed)

**Estimated Fix Time**: 2-3 hours

---

## 1. CRITICAL ERRORS (Must Fix)

### 1.1 Missing `statsService.ts` Module

**Files Affected**: 
- `services/geminiService.ts` (line 15)
- `components/ClassHub.tsx` (line 8)

**Issue**:
```typescript
// ❌ BROKEN
import { statsService } from './statsService.ts';
import { statsService } from '../services/statsService.ts';
```

**Impact**: Build will fail; app won't run

**Solution**: Create the missing service
```typescript
// services/statsService.ts
export class StatsService {
  private stats = {
    apiCalls: 0,
    apiSuccesses: 0,
    apiFailures: 0,
    mockUsage: 0,
    cacheHits: 0,
  };

  recordApiSuccess(): void {
    this.stats.apiCalls++;
    this.stats.apiSuccesses++;
  }

  recordApiFailure(): void {
    this.stats.apiCalls++;
    this.stats.apiFailures++;
  }

  recordMockUsage(): void {
    this.stats.mockUsage++;
  }

  recordCacheHit(): void {
    this.stats.cacheHits++;
  }

  getStats() {
    return { ...this.stats };
  }
}

export const statsService = new StatsService();
```

**Priority**: 🔴 CRITICAL

---

### 1.2 Missing `fallbackService.ts` Module

**Files Affected**: 
- `components/ClassHub.tsx` (line 9)

**Issue**:
```typescript
// ❌ BROKEN - imported but never used
import { fallbackService } from '../services/fallbackService.ts';
```

**Impact**: Build will fail

**Solution**: Either create the service or remove the import
```typescript
// Option A: Remove unused import
// (Recommended - it's not used anywhere)

// Option B: Create the service if needed for future use
// services/fallbackService.ts
export class FallbackService {
  // Implement fallback logic for API failures
}

export const fallbackService = new FallbackService();
```

**Recommendation**: Remove the import since it's not used

**Priority**: 🔴 CRITICAL

---

### 1.3 Type Mismatch: `WowSpec` Not Exported

**Files Affected**: 
- `services/mockDataPreloader.ts` (line 14)

**Issue**:
```typescript
// ❌ BROKEN
import type { WowClass, WowSpec } from '../types.ts';
// WowSpec doesn't exist; should be Specialization
```

**Current Types** (from types.ts):
```typescript
export interface Specialization {
  id: string;
  name: string;
  role: 'Tank' | 'Healer' | 'Damage' | 'Support';
}
```

**Solution**:
```typescript
// ✅ FIXED
import type { WowClass, Specialization } from '../types.ts';

// Then update function signatures:
private async preloadSpecGuide(wowClass: WowClass, spec: Specialization): Promise<void> {
  // ...
}
```

**Priority**: 🔴 CRITICAL

---

### 1.4 Null Safety: `selectedDungeon` Possibly Null

**Files Affected**: 
- `components/ClassHub.tsx` (lines 117, 155, 265)

**Issue**:
```typescript
// ❌ BROKEN - selectedDungeon can be null
const memoizedContentKey = useMemo(() => {
  if (activeTab === 'dungeons') {
    return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}-${selectedExpansion}`;
    //                                      ^^^^^^^^^^^^^^^^ - possibly null!
  }
  // ...
}, [activeTab, activeSpec, selectedDungeon, selectedExpansion, guideExpansion]);
```

**Solution**:
```typescript
// ✅ FIXED - Add null checks
const memoizedContentKey = useMemo(() => {
  if (activeTab === 'dungeons' && selectedDungeon) {
    return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}-${selectedExpansion}`;
  }
  if (activeTab === 'specs' || activeTab === 'rotations') {
    return `${activeTab}-${activeSpec.id}-${guideExpansion}`;
  }
  return `${activeTab}-${guideExpansion}`;
}, [activeTab, activeSpec, selectedDungeon, selectedExpansion, guideExpansion]);

// Also fix in other locations:
// Line 155: selectedDungeon?.name
// Line 265: selectedDungeon?.name
```

**Priority**: 🔴 CRITICAL

---

### 1.5 Missing Exports: `classOrchestratorService.ts`

**Files Affected**: 
- `hooks/useClassOrchestrator.ts` (lines 9-12)

**Issue**:
```typescript
// ❌ BROKEN - These functions don't exist
import {
  orchestrateClassCheck,        // ❌ Not exported
  generateHealthCheckReport,    // ❌ Not exported
  type OrchestratorStatus,      // ❌ Not exported
} from '../services/classOrchestratorService.ts';
```

**Current Exports** (from classOrchestratorService.ts):
```typescript
export const validateAndPrepareGuideRequest = (...) => { ... }
export interface GeminiReadyContext { ... }
```

**Solution**: Either implement missing functions or update imports
```typescript
// ✅ FIXED - Update imports to match actual exports
import {
  validateAndPrepareGuideRequest,
  type GeminiReadyContext,
} from '../services/classOrchestratorService.ts';

// Then update hook to use available functions:
export const useClassOrchestrator = (options: UseClassOrchestratorOptions = {}) => {
  const validateClass = useCallback(async (classId: string) => {
    try {
      const result = validateAndPrepareGuideRequest(classId);
      setIsValid(result.isValid);
      setGeminiContext(result.context);
      setIssues(result.errors);
    } catch (error) {
      console.error('Error validating class:', error);
      setIsValid(false);
    }
  }, []);
  // ...
};
```

**Priority**: 🔴 CRITICAL

---

### 1.6 Type Mismatch: Missing `warnings` Property

**Files Affected**: 
- `hooks/useClassOrchestrator.ts` (line 104)

**Issue**:
```typescript
// ❌ BROKEN - warnings doesn't exist on return type
const result = validateAndPrepareGuideRequest(...);
setWarnings(result.warnings);  // ❌ Property doesn't exist
```

**Current Return Type**:
```typescript
{
  isValid: boolean;
  context: GeminiReadyContext | null;
  errors: string[];  // ✅ exists
  // warnings: string[];  // ❌ doesn't exist
}
```

**Solution**:
```typescript
// ✅ FIXED - Use errors instead of warnings
const result = validateAndPrepareGuideRequest(...);
setIssues(result.errors);  // Use errors, not warnings
```

**Priority**: 🔴 CRITICAL

---

### 1.7 Type Error: `searchService.ts` - EXPANSIONS Type

**Files Affected**: 
- `services/searchService.ts` (lines 76-81)

**Issue**:
```typescript
// ❌ BROKEN - EXPANSIONS is string[], not object array
EXPANSIONS.forEach(expansion => {
  if (expansion.name.toLowerCase().includes(lowerQuery)) {
    //         ^^^^ - Property 'name' doesn't exist on string
    results.push({
      type: 'expansion',
      id: expansion.id,      // ❌ doesn't exist
      name: expansion.name,  // ❌ doesn't exist
    });
  }
});
```

**Current Constants** (from constants.ts):
```typescript
export const EXPANSIONS: string[] = [
  'The War Within',
  'Dragonflight',
  // ...
];
```

**Solution**:
```typescript
// ✅ FIXED - Handle EXPANSIONS as strings
EXPANSIONS.forEach(expansion => {
  if (expansion.toLowerCase().includes(lowerQuery)) {
    results.push({
      type: 'expansion',
      id: expansion,
      name: expansion,
      description: `${expansion} expansion`,
    });
  }
});
```

**Priority**: 🔴 CRITICAL

---

## 2. HIGH-PRIORITY WARNINGS (Should Fix)

### 2.1 Unused Imports

**Files Affected**:
- `services/searchService.ts` (line 6)
- `components/ClassHub.tsx` (line 6)

**Issue**:
```typescript
// ❌ UNUSED
import type { WowClass, Specialization, Dungeon } from '../types.ts';
// Only WOW_CLASSES is used, not the types
```

**Solution**:
```typescript
// ✅ FIXED - Remove unused imports
// Keep only what's used
```

**Priority**: 🟡 HIGH

---

### 2.2 Unused Variables

**Files Affected**:
- `services/adminService.ts` (line 38): `STATS_KEY`
- `services/classOrchestratorService.ts` (line 8): `validateDungeon`
- `services/mockDataPreloader.ts` (line 62): `expansionCount`
- `services/geminiService.ts` (line 25): `RESPONSE_MAX_LENGTH`

**Issue**:
```typescript
// ❌ UNUSED
const STATS_KEY = 'wow_class_helper_system_stats';  // Declared but never used
const expansionCount = EXPANSIONS.length;           // Calculated but never used
```

**Solution**: Remove or use them
```typescript
// ✅ FIXED - Either use or remove
// If not needed, delete the line
// If needed, use it in the code
```

**Priority**: 🟡 HIGH

---

### 2.3 Unused Imports in Components

**Files Affected**:
- `components/ClassHub.tsx` (line 6): `CacheMetadata`

**Issue**:
```typescript
// ❌ UNUSED
import { cacheService, type CacheMetadata } from '../services/cacheService.ts';
// CacheMetadata is imported but never used
```

**Solution**:
```typescript
// ✅ FIXED
import { cacheService } from '../services/cacheService.ts';
// Remove the type import if not used
```

**Priority**: 🟡 HIGH

---

## 3. CODE SMELLS & DESIGN ISSUES

### 3.1 Duplicate Service Initialization

**Issue**: Multiple services are initialized but not consistently used

**Files**:
- `services/geminiService.ts` - Uses `statsService`, `toastService`
- `components/ClassHub.tsx` - Imports but doesn't use `statsService`, `fallbackService`

**Recommendation**: 
- Create a unified service initialization pattern
- Use dependency injection or a service registry
- Ensure all services are actually used

**Example**:
```typescript
// services/index.ts - Centralized service exports
export { statsService } from './statsService.ts';
export { toastService } from './toastService.ts';
export { cacheService } from './cacheService.ts';
export { geminiService } from './geminiService.ts';

// Then import from one place:
import { statsService, toastService, cacheService } from '../services/index.ts';
```

**Priority**: 🟡 HIGH

---

### 3.2 Complex Memoization Logic

**File**: `components/ClassHub.tsx` (lines 110-120)

**Issue**: The `memoizedContentKey` logic is complex and error-prone
```typescript
// ❌ COMPLEX - Hard to maintain
const memoizedContentKey = useMemo(() => {
  if (activeTab === 'dungeons') {
    return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}-${selectedExpansion}`;
  }
  if (activeTab === 'specs' || activeTab === 'rotations') {
    return `${activeTab}-${activeSpec.id}-${guideExpansion}`;
  }
  return `${activeTab}-${guideExpansion}`;
}, [activeTab, activeSpec, selectedDungeon, selectedExpansion, guideExpansion]);
```

**Solution**: Extract to a helper function
```typescript
// ✅ CLEANER - Easier to test and maintain
const generateContentKey = (
  activeTab: TabId,
  activeSpec: Specialization,
  selectedDungeon: Dungeon | null,
  selectedExpansion: string,
  guideExpansion: string
): string => {
  if (activeTab === 'dungeons' && selectedDungeon) {
    return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}-${selectedExpansion}`;
  }
  if (activeTab === 'specs' || activeTab === 'rotations') {
    return `${activeTab}-${activeSpec.id}-${guideExpansion}`;
  }
  return `${activeTab}-${guideExpansion}`;
};

const memoizedContentKey = useMemo(
  () => generateContentKey(activeTab, activeSpec, selectedDungeon, selectedExpansion, guideExpansion),
  [activeTab, activeSpec, selectedDungeon, selectedExpansion, guideExpansion]
);
```

**Priority**: 🟡 HIGH

---

### 3.3 Inconsistent Error Handling

**Files**: 
- `services/geminiService.ts` - Uses try-catch with detailed error messages
- `services/searchService.ts` - Uses try-catch but silently fails
- `components/ClassHub.tsx` - Mixes error handling approaches

**Issue**: Different error handling patterns make code harder to maintain

**Solution**: Create a standardized error handler
```typescript
// services/errorHandler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context: string): AppError => {
  if (error instanceof AppError) {
    console.error(`[${context}] ${error.code}: ${error.message}`, error.context);
    return error;
  }
  
  if (error instanceof Error) {
    console.error(`[${context}] ${error.message}`);
    return new AppError('UNKNOWN_ERROR', error.message);
  }
  
  console.error(`[${context}] Unknown error:`, error);
  return new AppError('UNKNOWN_ERROR', 'An unknown error occurred');
};
```

**Priority**: 🟡 HIGH

---

### 3.4 Magic Strings & Numbers

**Files**: Multiple files

**Issue**: Hardcoded values scattered throughout code
```typescript
// ❌ MAGIC NUMBERS
const CACHE_TTL_MS = 60 * 60 * 1000;  // What is this?
const MAX_RETRIES = 3;                 // Why 3?
const RETRY_DELAY_MS = 1000;          // Why 1000?
```

**Solution**: Create a constants file
```typescript
// constants/config.ts
export const CONFIG = {
  CACHE: {
    TTL_MS: 60 * 60 * 1000,  // 1 hour
    MAX_SIZE: 100,
  },
  API: {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    PROMPT_MAX_LENGTH: 30000,
  },
  UI: {
    TOAST_DURATION_MS: 5000,
    ANIMATION_DURATION_MS: 300,
  },
} as const;
```

**Priority**: 🟡 HIGH

---

## 4. PERFORMANCE ISSUES

### 4.1 Unnecessary Re-renders in ClassHub

**File**: `components/ClassHub.tsx`

**Issue**: Multiple state updates can cause cascading re-renders
```typescript
// ❌ INEFFICIENT - Multiple state updates
setActiveTab(tabId);
setActiveSpec(spec);
setSelectedDungeon(dungeon);
// Each triggers a re-render
```

**Solution**: Batch state updates or use useReducer
```typescript
// ✅ BETTER - Single state update
interface ClassHubState {
  activeTab: TabId;
  activeSpec: Specialization;
  selectedDungeon: Dungeon | null;
  selectedExpansion: string;
}

const [state, dispatch] = useReducer(classHubReducer, initialState);

// Single dispatch call:
dispatch({ type: 'SELECT_TAB', payload: { tab, spec, dungeon } });
```

**Priority**: 🟡 HIGH

---

### 4.2 Missing Memoization on Expensive Computations

**File**: `services/searchService.ts`

**Issue**: Search filtering happens on every call without memoization
```typescript
// ❌ INEFFICIENT - No memoization
search(query: string, filters?: SearchFilters): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  WOW_CLASSES.forEach(wowClass => {
    if (wowClass.name.toLowerCase().includes(lowerQuery)) {
      // ... lots of work
    }
  });
}
```

**Solution**: Add memoization
```typescript
// ✅ BETTER - Memoized search
private searchCache = new Map<string, SearchResult[]>();

search(query: string, filters?: SearchFilters): SearchResult[] {
  const cacheKey = `${query}:${JSON.stringify(filters)}`;
  
  if (this.searchCache.has(cacheKey)) {
    return this.searchCache.get(cacheKey)!;
  }
  
  const results = this.performSearch(query, filters);
  this.searchCache.set(cacheKey, results);
  
  // Clear cache after 5 minutes
  setTimeout(() => this.searchCache.delete(cacheKey), 5 * 60 * 1000);
  
  return results;
}
```

**Priority**: 🟡 HIGH

---

## 5. MAINTAINABILITY ISSUES

### 5.1 Inconsistent Type Definitions

**Issue**: Types are scattered across multiple files
- `types.ts` - Main types
- `services/classOrchestratorService.ts` - `GeminiReadyContext`
- `services/cacheService.ts` - `CacheMetadata`
- `services/adminService.ts` - `SystemStats`, `UserReport`, `SystemLog`

**Solution**: Consolidate types
```typescript
// types.ts - Centralized type definitions
export interface GeminiReadyContext { ... }
export interface CacheMetadata { ... }
export interface SystemStats { ... }
export interface UserReport { ... }
export interface SystemLog { ... }
```

**Priority**: 🟡 HIGH

---

### 5.2 Missing JSDoc Comments

**Files**: All service files

**Issue**: Complex functions lack documentation
```typescript
// ❌ NO DOCUMENTATION
export const validateAndPrepareGuideRequest = (
  classId: string,
  specId?: string,
  dungeonName?: string,
  customSourceUrls?: string[]
): { isValid: boolean; context: GeminiReadyContext | null; errors: string[] } => {
  // What does this do? When should I use it?
}
```

**Solution**: Add JSDoc comments
```typescript
// ✅ DOCUMENTED
/**
 * Validates and prepares a guide request for Gemini API
 * 
 * @param classId - The WoW class ID (e.g., 'warrior')
 * @param specId - Optional specialization ID (e.g., 'arms')
 * @param dungeonName - Optional dungeon name for dungeon-specific guides
 * @param customSourceUrls - Optional array of custom source URLs to inject
 * 
 * @returns Object with validation result, context for Gemini, and any errors
 * 
 * @example
 * const result = validateAndPrepareGuideRequest('warrior', 'arms');
 * if (result.isValid) {
 *   console.log(result.context.className); // 'Warrior'
 * }
 */
export const validateAndPrepareGuideRequest = (...) => { ... }
```

**Priority**: 🟡 HIGH

---

## 6. SECURITY CONCERNS

### 6.1 Unvalidated URL Injection

**File**: `services/geminiService.ts` (lines 60-70)

**Issue**: Custom URLs are injected into prompts without sufficient validation
```typescript
// ⚠️ POTENTIAL ISSUE - URLs could contain malicious content
if (validation.urls.length > 0) {
  const urls = validation.urls.map(url => `- ${url}`).join('\n');
  finalPrompt = `IMPORTANT: Your primary task is to act as an expert...${urls}...`;
}
```

**Solution**: Add additional validation
```typescript
// ✅ BETTER - Validate URL content
const validateUrlContent = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return response.ok && response.headers.get('content-type')?.includes('text');
  } catch {
    return false;
  }
};

// Use in geminiService:
const validatedUrls = await Promise.all(
  validation.urls.map(async (url) => ({
    url,
    valid: await validateUrlContent(url),
  }))
);

const safeUrls = validatedUrls
  .filter(u => u.valid)
  .map(u => u.url);
```

**Priority**: 🟠 MEDIUM

---

### 6.2 Missing Input Sanitization

**File**: `components/SearchBar.tsx`

**Issue**: Search input is used directly without sanitization
```typescript
// ⚠️ POTENTIAL ISSUE
const handleSearch = (value: string) => {
  setQuery(value);  // No sanitization
  const searchResults = searchService.search(value);  // Passed directly
};
```

**Solution**: Add sanitization
```typescript
// ✅ BETTER - Sanitize input
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .slice(0, 100)  // Limit length
    .replace(/[<>]/g, '');  // Remove dangerous characters
};

const handleSearch = (value: string) => {
  const sanitized = sanitizeInput(value);
  setQuery(sanitized);
  const searchResults = searchService.search(sanitized);
};
```

**Priority**: 🟠 MEDIUM

---

## 7. ACTION PLAN

### Phase 1: Critical Fixes (1 hour)
- [ ] Create `services/statsService.ts`
- [ ] Fix `searchService.ts` EXPANSIONS type error
- [ ] Fix `mockDataPreloader.ts` WowSpec import
- [ ] Fix null safety in `ClassHub.tsx`
- [ ] Fix missing exports in `classOrchestratorService.ts`

### Phase 2: High-Priority Fixes (1 hour)
- [ ] Remove unused imports and variables
- [ ] Extract `generateContentKey` helper function
- [ ] Create centralized error handler
- [ ] Create config constants file
- [ ] Consolidate type definitions

### Phase 3: Improvements (1 hour)
- [ ] Add JSDoc comments to all services
- [ ] Implement search memoization
- [ ] Add URL validation for custom sources
- [ ] Add input sanitization
- [ ] Refactor ClassHub with useReducer

---

## 8. SUMMARY TABLE

| Category | Count | Priority | Est. Time |
|----------|-------|----------|-----------|
| Critical Errors | 7 | 🔴 | 1 hour |
| High Warnings | 6 | 🟡 | 1 hour |
| Code Smells | 4 | 🟡 | 1 hour |
| Performance | 2 | 🟡 | 30 min |
| Security | 2 | 🟠 | 30 min |
| **TOTAL** | **21** | - | **3-4 hours** |

---

## Recommendations

1. **Immediate**: Fix all critical errors before next deployment
2. **Short-term**: Address high-priority warnings in next sprint
3. **Long-term**: Implement improvements for maintainability and performance
4. **Ongoing**: Add linting rules to catch these issues automatically

