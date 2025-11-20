# API Resilience & UX Enhancements

**Status**: In Progress  
**Priority**: High  
**Complexity**: Medium

---

## 📋 Overview

Enhance the application's resilience when the Gemini API is unavailable or slow, and improve user experience with better feedback and recovery options.

---

## ✅ Acceptance Criteria

### AC1: Retry Counter Visual
- [ ] Display retry attempt counter (e.g., "Retrying... 1/3")
- [ ] Show countdown timer between retries
- [ ] Update UI in real-time during retries
- [ ] Clear counter when successful or final failure

### AC2: Retry Button in Demo Mode
- [ ] Add "Retry" button when demo mode is active
- [ ] Button triggers new API attempt
- [ ] Button disabled during retry attempts
- [ ] Success removes demo mode notification

### AC3: Cache Indicator
- [ ] Show badge when content comes from cache
- [ ] Display cache age (e.g., "Cached 5 min ago")
- [ ] Different styling from demo mode badge
- [ ] Indicate cache TTL remaining

### AC4: Offline Mode Detection
- [ ] Detect browser offline status
- [ ] Show "Offline Mode" message instead of "Demo Mode"
- [ ] Different styling for offline vs API failure
- [ ] Auto-retry when connection restored

### AC5: Admin Statistics Panel
- [ ] Track API calls vs mock data usage
- [ ] Display success/failure rates
- [ ] Show cache hit rate
- [ ] Display in admin panel

### AC6: Preload Mock Data
- [ ] Preload mock data on app startup
- [ ] Cache mock data in memory
- [ ] Instant display when API fails
- [ ] No delay for mock data rendering

### AC7: Toast Notifications
- [ ] Replace permanent badge with toast
- [ ] Auto-dismiss after 5 seconds
- [ ] Stack multiple toasts
- [ ] Dismiss button on toast

### AC8: Fallback Progression
- [ ] Try API first
- [ ] Fall back to cache if API fails
- [ ] Fall back to mock if no cache
- [ ] Show appropriate indicator for each level

---

## 🎯 Implementation Tasks

### Task 1: Retry Counter & Timer
**Files to modify**:
- `services/geminiService.ts` - Add retry tracking
- `components/LoadingStateEnhanced.tsx` - Display counter
- `components/GuideSection.tsx` - Show retry info

**Steps**:
1. Add retry state to ClassHub
2. Pass retry info to LoadingStateEnhanced
3. Display counter and timer
4. Update on each retry attempt

### Task 2: Retry Button
**Files to modify**:
- `components/GuideSection.tsx` - Add retry button
- `components/ClassHub.tsx` - Handle retry logic

**Steps**:
1. Add retry button when demo mode active
2. Disable during retry attempts
3. Trigger new API call on click
4. Remove demo mode on success

### Task 3: Cache Indicator
**Files to modify**:
- `services/cacheService.ts` - Track cache metadata
- `components/GuideSection.tsx` - Display cache badge
- `components/ClassHub.tsx` - Pass cache info

**Steps**:
1. Store cache timestamp
2. Calculate cache age
3. Display cache badge with age
4. Show TTL remaining

### Task 4: Offline Detection
**Files to modify**:
- `hooks/useOnlineStatus.ts` - New hook
- `components/GuideSection.tsx` - Use hook
- `services/geminiService.ts` - Check online status

**Steps**:
1. Create useOnlineStatus hook
2. Listen to online/offline events
3. Show different message when offline
4. Auto-retry when online

### Task 5: Admin Statistics
**Files to modify**:
- `services/statsService.ts` - New service
- `components/AdminPanelEnhanced.tsx` - Display stats

**Steps**:
1. Create stats tracking service
2. Track API calls, cache hits, mock usage
3. Display in admin panel
4. Show success/failure rates

### Task 6: Preload Mock Data
**Files to modify**:
- `services/mockGuideService.ts` - Export all mocks
- `App.tsx` - Preload on startup
- `services/cacheService.ts` - Cache mocks

**Steps**:
1. Preload all mock data on app init
2. Store in memory cache
3. Use immediately on API failure
4. No delay for rendering

### Task 7: Toast Notifications
**Files to create**:
- `components/Toast.tsx` - Toast component
- `hooks/useToast.ts` - Toast hook

**Files to modify**:
- `components/GuideSection.tsx` - Use toast instead of badge
- `App.tsx` - Add toast container

**Steps**:
1. Create Toast component
2. Create useToast hook
3. Replace badge with toast
4. Auto-dismiss after 5s

### Task 8: Fallback Progression
**Files to modify**:
- `services/geminiService.ts` - Implement fallback chain
- `components/GuideSection.tsx` - Show fallback level

**Steps**:
1. Try API first
2. Check cache if API fails
3. Use mock if no cache
4. Show indicator for each level

---

## 🎨 UI/UX Changes

### Retry Counter
```
Loading...
Retrying... 1/3 (2s)
```

### Cache Badge
```
💾 Cached 5 min ago (55 min TTL)
```

### Offline Message
```
📡 Offline Mode - Using cached data
```

### Toast Notification
```
┌─────────────────────────────┐
│ ⚠️ Using demo data          │ ✕
│ API unavailable             │
└─────────────────────────────┘
```

### Admin Stats
```
API Calls: 45 (Success: 42, Failed: 3)
Cache Hits: 28 (62%)
Mock Usage: 3 (7%)
```

---

## 📊 Success Criteria

- [ ] All 8 features implemented
- [ ] No breaking changes
- [ ] Tests passing (182/182)
- [ ] Build successful
- [ ] UX improved
- [ ] Performance maintained
- [ ] Code quality maintained

---

## 🚀 Priority Order

1. **Task 1**: Retry Counter (foundation)
2. **Task 2**: Retry Button (UX)
3. **Task 4**: Offline Detection (important)
4. **Task 3**: Cache Indicator (transparency)
5. **Task 7**: Toast Notifications (UX polish)
6. **Task 8**: Fallback Progression (robustness)
7. **Task 6**: Preload Mock Data (performance)
8. **Task 5**: Admin Statistics (monitoring)

---

## 📝 Notes

- Keep changes backward compatible
- Maintain current styling consistency
- Follow project standards
- Add tests for new functionality
- Update documentation

---

**Created**: November 20, 2025  
**Target Completion**: Today  
**Estimated Effort**: 4-6 hours

