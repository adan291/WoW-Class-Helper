# 🧪 Testing Instructions

**Server**: http://localhost:3000/  
**Status**: ✅ RUNNING

---

## 🎮 Manual Testing

### 1. Class Selection
- [ ] Page loads with all 13 classes
- [ ] Classes display with correct colors
- [ ] Search filter works
- [ ] Role filter works (Tank, Healer, Damage)
- [ ] Favorite star toggles
- [ ] Favorites persist after refresh

### 2. Class Hub Navigation
- [ ] Click a class to enter hub
- [ ] Hero section displays with class icon
- [ ] 5 tabs visible: Overview, Builds, Rotations, Addons, Dungeons
- [ ] Tab switching works smoothly
- [ ] Content loads for each tab

### 3. Specialization Selection
- [ ] Click "Builds" tab
- [ ] Spec cards appear
- [ ] Click different specs
- [ ] Content updates for each spec
- [ ] Active spec is highlighted

### 4. Dungeon Selection
- [ ] Click "Dungeons" tab
- [ ] Expansion filter appears
- [ ] Dungeon selector appears
- [ ] Change expansion
- [ ] Dungeon list updates
- [ ] Select different dungeon
- [ ] Content updates

### 5. Admin Panel
- [ ] Click role selector (top right)
- [ ] Select "Admin Mode"
- [ ] Admin panel appears
- [ ] Enter custom source URLs
- [ ] Click "Regenerate with Sources"
- [ ] Content updates with sources

### 6. Error Handling
- [ ] Disconnect internet
- [ ] Try to load a guide
- [ ] Error message appears
- [ ] Click "Retry" button
- [ ] Reconnect internet
- [ ] Content loads successfully

### 7. Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Test on iPhone 12 (390x844)
- [ ] Test on iPad (768x1024)
- [ ] Test on Desktop (1920x1080)
- [ ] Layout adapts correctly
- [ ] No horizontal scrolling
- [ ] All features work

### 8. Performance
- [ ] Open DevTools → Performance tab
- [ ] Record page load
- [ ] Check metrics:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
- [ ] Record tab switching
- [ ] Check response time

### 9. Accessibility
- [ ] Press Tab to navigate
- [ ] All buttons are reachable
- [ ] Focus states are visible
- [ ] Use screen reader (NVDA/JAWS)
- [ ] Test with keyboard only

### 10. Caching
- [ ] Load a guide (Overview tab)
- [ ] Wait for content to load
- [ ] Switch to another tab
- [ ] Switch back to Overview
- [ ] Content loads instantly (from cache)
- [ ] Refresh page
- [ ] Cache is cleared

---

## 🧪 Automated Testing

### Run All Tests
```bash
npm run test
```

**Expected Output**:
```
Test Files  9 passed (9)
Tests       182 passed (182)
Duration    2.50s
```

### Run Specific Test
```bash
# Test validation service
npm run test -- services/validationService.test.ts

# Test cache service
npm run test -- services/cacheService.test.ts

# Test components
npm run test -- components/ErrorBoundary.test.tsx
```

### Watch Mode
```bash
npm run test:watch
```

---

## 🔍 Debugging

### Enable Console Logging
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

### Check Network Requests
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for Gemini API calls
4. Check response status and payload

### Check Local Storage
```javascript
// In browser console
localStorage.getItem('wow_class_helper_favorites');
```

### Check Cache Status
```javascript
// In browser console
// (if exposed in window)
window.cacheService?.getStats();
```

---

## ✅ Testing Checklist

### Before Committing
- [ ] `npm run test` passes (182 tests)
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No console warnings
- [ ] All features work locally
- [ ] Mobile responsive
- [ ] Accessibility tested

### Performance Checklist
- [ ] Initial load < 3 seconds
- [ ] Tab switching < 1 second
- [ ] No layout shifts
- [ ] Smooth 60fps animations
- [ ] No memory leaks

### Functionality Checklist
- [ ] Class selection works
- [ ] Specialization selection works
- [ ] All 5 tabs load content
- [ ] Dungeon filtering works
- [ ] Admin panel works
- [ ] Favorites persist
- [ ] Error handling works
- [ ] Caching works

---

## 🐛 Common Issues

### Issue: "GEMINI_API_KEY is not defined"
**Solution**:
```bash
# Check .env.local exists
cat .env.local

# Should output:
# GEMINI_API_KEY=your_key_here

# If missing, create it:
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Restart dev server
npm run dev
```

### Issue: "Port 3000 already in use"
**Solution**:
```bash
# Use different port
npm run dev -- --port 3001
```

### Issue: "Module not found"
**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "Tests failing"
**Solution**:
```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Check for TypeScript errors
npx tsc --noEmit
```

---

## 📊 Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Validation | 41 | ✅ Pass |
| Properties | 44 | ✅ Pass |
| Performance | 15 | ✅ Pass |
| Cache | 17 | ✅ Pass |
| Components | 27 | ✅ Pass |
| Services | 34 | ✅ Pass |
| Orchestrator | 4 | ✅ Pass |
| **Total** | **182** | **✅ Pass** |

---

## 🚀 Ready to Test

The project is ready for testing:
- ✅ Server running at http://localhost:3000/
- ✅ All tests passing (182/182)
- ✅ Build successful (1.64s)
- ✅ No errors or warnings

**Start testing now!** 🎮✨

---

**Server**: http://localhost:3000/  
**Status**: ✅ RUNNING  
**Tests**: 182/182 PASSING  
**Ready**: ✅ YES

