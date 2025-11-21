# Critical Fixes Guide - Quick Reference

## 🔴 MUST FIX BEFORE DEPLOYMENT

### Fix #1: Create Missing `statsService.ts`

**File**: `services/statsService.ts` (NEW)

```typescript
/**
 * Statistics Service
 * Tracks API calls, cache hits, and mock data usage
 */

export interface ApiStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  mockDataUsage: number;
  cacheHits: number;
}

class StatsService {
  private stats: ApiStats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    mockDataUsage: 0,
    cacheHits: 0,
  };

  recordApiSuccess(): void {
    this.stats.totalCalls++;
    this.stats.successfulCalls++;
  }

  recordApiFailure(): void {
    this.stats.totalCalls++;
    this.stats.failedCalls++;
  }

  recordMockUsage(): void {
    this.stats.mockDataUsage++;
  }

  recordCacheHit(): void {
    this.stats.cacheHits++;
  }

  getStats(): ApiStats {
    return { ...this.stats };
  }

  reset(): void {
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      mockDataUsage: 0,
      cacheHits: 0,
    };
  }
}

export const statsService = new StatsService();
```

**Time**: 5 minutes

---

### Fix #2: Remove Unused `fallbackService` Import

**File**: `components/ClassHub.tsx`

**Change**:
```typescript
// ❌ REMOVE THIS LINE
import { fallbackService } from '../services/fallbackService.ts';
```

**Time**: 1 minute

---

### Fix #3: Fix Type Import in `mockDataPreloader.ts`

**File**: `services/mockDataPreloader.ts` (Line 14)

**Change**:
```typescript
// ❌ BEFORE
import type { WowClass, WowSpec } from '../types.ts';

// ✅ AFTER
import type { WowClass, Specialization } from '../types.ts';

// Then update function signatures:
private async preloadSpecGuide(wowClass: WowClass, spec: Specialization): Promise<void> {
  // ...
}

private async preloadRotationGuide(wowClass: WowClass, spec: Specialization): Promise<void> {
  // ...
}

private async preloadDungeonTips(wowClass: WowClass, spec: Specialization, dungeonName: string): Promise<void> {
  // ...
}
```

**Time**: 5 minutes

---

### Fix #4: Fix Null Safety in `ClassHub.tsx`

**File**: `components/ClassHub.tsx` (Lines 117, 155, 265)

**Change**:
```typescript
// ❌ BEFORE
const memoizedContentKey = useMemo(() => {
  if (activeTab === 'dungeons') {
    return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}-${selectedExpansion}`;
  }
  // ...
}, [activeTab, activeSpec, selectedDungeon, selectedExpansion, guideExpansion]);

// ✅ AFTER
const memoizedContentKey = useMemo(() => {
  if (activeTab === 'dungeons' && selectedDungeon) {
    return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}-${selectedExpansion}`;
  }
  if (activeTab === 'specs' || activeTab === 'rotations') {
    return `${activeTab}-${activeSpec.id}-${guideExpansion}`;
  }
  return `${activeTab}-${guideExpansion}`;
}, [activeTab, activeSpec, selectedDungeon, selectedExpansion, guideExpansion]);

// Also fix line 155:
// ❌ BEFORE
const dungeon = DUNGEONS.find(d => d.name === selectedDungeon.name);

// ✅ AFTER
const dungeon = selectedDungeon ? DUNGEONS.find(d => d.name === selectedDungeon.name) : null;

// Also fix line 265:
// ❌ BEFORE
newContent = await geminiService.getDungeonTips(wowClass, activeSpec, selectedDungeon.name, ...);

// ✅ AFTER
if (!selectedDungeon) throw new Error('No dungeon selected');
newContent = await geminiService.getDungeonTips(wowClass, activeSpec, selectedDungeon.name, ...);
```

**Time**: 10 minutes

---

### Fix #5: Fix Missing Exports in `classOrchestratorService.ts`

**File**: `hooks/useClassOrchestrator.ts` (Lines 9-12)

**Change**:
```typescript
// ❌ BEFORE
import {
  orchestrateClassCheck,
  generateHealthCheckReport,
  type OrchestratorStatus,
} from '../services/classOrchestratorService.ts';

// ✅ AFTER
import {
  validateAndPrepareGuideRequest,
  type GeminiReadyContext,
} from '../services/classOrchestratorService.ts';

// Then update the hook implementation to use available functions
```

**Time**: 10 minutes

---

### Fix #6: Fix Type Mismatch in `useClassOrchestrator.ts`

**File**: `hooks/useClassOrchestrator.ts` (Line 104)

**Change**:
```typescript
// ❌ BEFORE
setWarnings(result.warnings);

// ✅ AFTER
setWarnings(result.errors);  // Use errors instead
```

**Time**: 2 minutes

---

### Fix #7: Fix EXPANSIONS Type Error in `searchService.ts`

**File**: `services/searchService.ts` (Lines 76-81)

**Change**:
```typescript
// ❌ BEFORE
EXPANSIONS.forEach(expansion => {
  if (expansion.name.toLowerCase().includes(lowerQuery)) {
    results.push({
      type: 'expansion',
      id: expansion.id,
      name: expansion.name,
      description: `${expansion.name} expansion`,
    });
  }
});

// ✅ AFTER
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

**Time**: 5 minutes

---

## 🟡 SHOULD FIX SOON

### Fix #8: Remove Unused Imports

**File**: `services/searchService.ts` (Line 6)

```typescript
// ❌ REMOVE
import type { WowClass, Specialization, Dungeon } from '../types.ts';
```

**Time**: 1 minute

---

### Fix #9: Remove Unused Variables

**Files**:
- `services/adminService.ts` (Line 38): Remove `STATS_KEY`
- `services/classOrchestratorService.ts` (Line 8): Remove `validateDungeon` import
- `services/mockDataPreloader.ts` (Line 62): Remove `expansionCount`
- `services/geminiService.ts` (Line 25): Remove `RESPONSE_MAX_LENGTH`

**Time**: 5 minutes

---

### Fix #10: Remove Unused Type Import

**File**: `components/ClassHub.tsx` (Line 6)

```typescript
// ❌ REMOVE
import { cacheService, type CacheMetadata } from '../services/cacheService.ts';

// ✅ KEEP
import { cacheService } from '../services/cacheService.ts';
```

**Time**: 1 minute

---

## 📋 Verification Checklist

After applying all fixes, run:

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Run diagnostics
npm run lint

# Run tests
npm test

# Build
npm run build
```

All should pass with no errors.

---

## Total Time Estimate

- **Critical Fixes**: 38 minutes
- **High-Priority Fixes**: 7 minutes
- **Verification**: 10 minutes
- **TOTAL**: ~1 hour

