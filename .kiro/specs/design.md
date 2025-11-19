# WoW AI Class Helper - Design Specification

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     WoW AI Class Helper                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   UI Layer       │         │  Data Layer      │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ ClassSelection   │         │ constants.ts     │          │
│  │ ClassHub         │         │ (Classes, Specs) │          │
│  │ GuideSection     │         │                  │          │
│  │ SpecIcon         │         │ types.ts         │          │
│  │ ClassIcon        │         │ (Type defs)      │          │
│  └──────────────────┘         └──────────────────┘          │
│         │                              │                     │
│         └──────────────┬───────────────┘                     │
│                        │                                     │
│  ┌─────────────────────▼──────────────────────┐             │
│  │      Service Layer                         │             │
│  ├────────────────────────────────────────────┤             │
│  │ geminiService.ts                           │             │
│  │ ├─ generateContentWithGemini()             │             │
│  │ ├─ validateSourceUrls()                    │             │
│  │ └─ formatGuideContent()                    │             │
│  └────────────────┬─────────────────────────┘              │
│                   │                                         │
│  ┌────────────────▼──────────────────────┐                 │
│  │      External APIs                    │                 │
│  ├───────────────────────────────────────┤                 │
│  │ Gemini API (Content Generation)       │                 │
│  │ LocalStorage (Favorites Persistence)  │                 │
│  │ Custom Source URLs (Admin Injection)  │                 │
│  └───────────────────────────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── ClassSelection
│   ├── ClassIcon (x13)
│   ├── SearchInput
│   └── RoleFilter
│
└── ClassHub
    ├── SpecSelector
    │   └── SpecIcon (x2-4)
    │
    ├── TabNavigation
    │   ├── Overview
    │   ├── Builds
    │   ├── Rotations
    │   ├── Addons
    │   └── Dungeons
    │
    ├── DungeonSelector (conditional)
    │   └── DungeonList
    │
    ├── AdminPanel (conditional, role === 'admin')
    │   ├── SourceURLInput
    │   └── RegenerateButton
    │
    └── GuideSection
        ├── LoadingSpinner
        ├── ErrorDisplay
        └── MarkdownRenderer
            ├── Headers
            ├── Lists
            ├── CodeBlocks
            ├── AbilityTooltips
            └── Tables
```

### State Management Strategy

**App Level State**:
- `selectedClass`: Current selected class ID
- `userRole`: User role (User, Master, Admin)

**ClassHub Level State**:
- `activeTab`: Current guide type (overview, builds, rotations, addons, dungeons)
- `activeSpec`: Currently selected specialization
- `selectedExpansion`: Dungeon expansion filter
- `selectedDungeon`: Currently selected dungeon
- `content`: Generated guide content (markdown)
- `isLoading`: Content generation in progress
- `error`: Error message if generation failed
- `sourceUrls`: Custom source URLs (Admin only)

**ClassSelection Level State**:
- `searchTerm`: Search input value
- `roleFilter`: Selected role filter
- `favorites`: Array of favorited class IDs (localStorage)

**Persistence**:
- Favorites: `localStorage.wow_class_helper_favorites`
- Session: URL parameters for class/spec/tab

## Correctness Properties

### CP1: Class & Specialization Consistency
**Property**: Selected specialization must belong to selected class

**Implementation**:
- `activeSpec` initialized from `wowClass.specs[0]`
- `setActiveSpec()` only accepts specs from current class
- Spec selector renders only specs from `selectedClass.specs`

**Verification**:
- Spec selector disabled if no specs available
- Invalid spec selection rejected with error
- Spec persists correctly across tab changes

**Test Cases**:
- Select class → verify first spec auto-selected
- Change class → verify spec resets to first available
- Try to set invalid spec → verify rejected
- Reload page → verify spec persists

---

### CP2: Dungeon Filtering Accuracy
**Property**: Displayed dungeons must match selected expansion filter

**Implementation**:
```typescript
const filteredDungeons = useMemo(() => {
  if (selectedExpansion === 'all') return DUNGEONS;
  return DUNGEONS.filter(d => d.expansion === selectedExpansion);
}, [selectedExpansion]);
```

**Verification**:
- Dungeon list updates when expansion filter changes
- Invalid dungeon selection resets to first available
- Dungeon count matches expansion data

**Test Cases**:
- Select expansion → verify dungeons filter correctly
- Change expansion → verify list updates
- Select dungeon → change expansion → verify dungeon resets
- Verify dungeon count per expansion matches constants

---

### CP3: Content Generation Consistency
**Property**: Generated content must match active tab, spec, and dungeon selection

**Implementation**:
```typescript
const memoizedContentKey = useMemo(() => 
  `${selectedClass.id}-${activeSpec.id}-${activeTab}-${selectedDungeon?.id || 'none'}`,
  [selectedClass, activeSpec, activeTab, selectedDungeon]
);

useEffect(() => {
  if (contentCache[memoizedContentKey]) {
    setContent(contentCache[memoizedContentKey]);
  } else {
    fetchContent();
  }
}, [memoizedContentKey]);
```

**Verification**:
- Content regenerates only when key factors change
- Content matches requested class/spec/tab/dungeon
- No stale content displayed
- Content cache prevents unnecessary API calls

**Test Cases**:
- Change tab → verify content updates
- Change spec → verify content updates
- Change dungeon → verify content updates
- Switch back to previous tab → verify cached content loads instantly
- Verify content matches current selections

---

### CP4: Favorites Persistence
**Property**: Marked favorites must persist across page reloads

**Implementation**:
```typescript
useEffect(() => {
  const stored = localStorage.getItem('wow_class_helper_favorites');
  if (stored) {
    try {
      setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to parse favorites:', e);
      setFavorites([]);
    }
  }
}, []);

const toggleFavorite = (classId: string) => {
  setFavorites(prev => {
    const updated = prev.includes(classId)
      ? prev.filter(id => id !== classId)
      : [...prev, classId];
    localStorage.setItem('wow_class_helper_favorites', JSON.stringify(updated));
    return updated;
  });
};
```

**Verification**:
- Favorites saved to localStorage on toggle
- Favorites loaded on app mount
- Invalid localStorage data handled gracefully
- Favorites appear first in class list

**Test Cases**:
- Mark class as favorite → reload → verify still favorited
- Unmark favorite → reload → verify removed
- Corrupt localStorage → verify app doesn't crash
- Multiple favorites → verify correct order

---

### CP5: Admin Source Injection
**Property**: Custom URLs must override default AI knowledge when provided

**Implementation**:
```typescript
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string[]
) => {
  const enhancedPrompt = sourceUrls
    ? `Use these sources as primary knowledge:\n${sourceUrls.join('\n')}\n\n${prompt}`
    : prompt;
  
  return await generateContent(enhancedPrompt);
};
```

**Verification**:
- Custom URLs prepended to prompt
- Content reflects custom source information
- Regenerate button applies custom sources
- Admin-only access enforced

**Test Cases**:
- Inject custom URL → regenerate → verify content uses custom source
- Remove custom URL → regenerate → verify reverts to default
- Invalid URL → verify error handling
- Non-admin user → verify can't inject URLs

---

### CP6: Markdown Rendering Fidelity
**Property**: Markdown must render correctly without XSS vulnerabilities

**Implementation**:
```typescript
const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

const renderMarkdown = (markdown: string): string => {
  let html = markdown
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^\* (.*?)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\{([^}]+)\}/g, (match, name, meta) => {
      return `<span class="ability-tooltip" data-meta="${sanitizeHtml(meta)}">${sanitizeHtml(name)}</span>`;
    });
  
  return html;
};
```

**Verification**:
- All markdown elements render correctly
- No XSS vulnerabilities in rendered content
- Ability tooltips parse and display correctly
- HTML entities properly escaped

**Test Cases**:
- Render headers → verify correct styling
- Render lists → verify correct formatting
- Render ability tooltips → verify metadata displays
- Inject malicious HTML → verify escaped
- Render code blocks → verify syntax highlighting

---

### CP7: Error Recovery
**Property**: Errors must be catchable and displayable without crashing the app

**Implementation**:
```typescript
const fetchContent = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const result = await generateContentWithGemini(prompt, sourceUrls);
    setContent(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(`Failed to generate content: ${message}`);
    console.error('Content generation error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

**Verification**:
- All errors caught and logged
- User-friendly error messages displayed
- App remains interactive after error
- Retry functionality available

**Test Cases**:
- API failure → verify error message displays
- Invalid input → verify error handling
- Network timeout → verify graceful failure
- Retry after error → verify works correctly

---

### CP8: Role-Based Access Control
**Property**: Admin features only visible when userRole === 'admin'

**Implementation**:
```typescript
{userRole === 'admin' && (
  <AdminPanel
    sourceUrls={sourceUrls}
    onSourceUrlsChange={setSourceUrls}
    onRegenerate={handleRegenerate}
  />
)}
```

**Verification**:
- Admin panel hidden for User and Master roles
- Admin features not accessible via URL manipulation
- Role validation on all admin operations

**Test Cases**:
- User role → verify admin panel hidden
- Master role → verify admin panel hidden
- Admin role → verify admin panel visible
- Try to access admin features as User → verify denied

---

### CP9: Loading State Management
**Property**: isLoading must be true during API call, false after completion or error

**Implementation**:
```typescript
useEffect(() => {
  setIsLoading(true);
  generateContentWithGemini(prompt)
    .then(result => setContent(result))
    .catch(err => setError(err.message))
    .finally(() => setIsLoading(false));
}, [memoizedContentKey]);
```

**Verification**:
- Loading spinner displays during generation
- Spinner hidden after content loads
- Spinner hidden after error
- No stuck loading states

**Test Cases**:
- Start content generation → verify spinner shows
- Content loads → verify spinner hides
- Error occurs → verify spinner hides
- Rapid tab switching → verify spinner state correct

---

### CP10: Responsive Design
**Property**: UI must adapt to mobile, tablet, and desktop viewports

**Implementation**:
```typescript
// Mobile: < 640px
// Tablet: 640px - 1024px
// Desktop: > 1024px

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

**Verification**:
- Layout adapts to all breakpoints
- No horizontal scrolling on mobile
- Touch targets ≥ 44px on mobile
- Font sizes readable on all devices

**Test Cases**:
- View on mobile (< 640px) → verify layout adapts
- View on tablet (640-1024px) → verify layout adapts
- View on desktop (> 1024px) → verify layout adapts
- Rotate device → verify layout updates
- Verify no horizontal scrolling

---

### CP11: Data Accuracy Validation
**Property**: All displayed data must match official WoW sources

**Implementation**:
```typescript
const validateClassData = (classData: WowClass): boolean => {
  // Verify against OFFICIAL_WOW_CLASSES constant
  const official = OFFICIAL_WOW_CLASSES.find(c => c.id === classData.id);
  if (!official) return false;
  
  // Verify spec count matches
  if (classData.specs.length !== official.specs.length) return false;
  
  // Verify each spec exists in official data
  return classData.specs.every(spec =>
    official.specs.some(s => s.id === spec.id)
  );
};
```

**Verification**:
- Class data matches official WoW API
- Specialization data matches official sources
- Dungeon data matches current content
- Ability data matches spell database

**Test Cases**:
- Load class data → verify matches official
- Load spec data → verify matches official
- Load dungeon data → verify matches current patch
- Verify ability cooldowns are accurate

---

### CP12: Content Source Attribution
**Property**: Every guide must include verifiable sources

**Implementation**:
```typescript
interface Guide {
  content: string;
  sources: Source[];
  generatedAt: timestamp;
  patchVersion: string;
}

interface Source {
  title: string;
  url: string;
  type: 'official' | 'community' | 'data' | 'custom';
  verified: boolean;
  lastVerified: timestamp;
}
```

**Verification**:
- Every guide includes at least one source
- Sources are verifiable and accessible
- Source types are accurate
- Verification dates are current

**Test Cases**:
- Generate guide → verify sources included
- Verify each source is accessible
- Check source types are correct
- Verify verification dates are recent

---

## Integration Points

### Gemini API Integration
- **Endpoint**: `GoogleGenAI.models.generateContent`
- **Model**: `gemini-2.5-flash`
- **Input**: Markdown-formatted prompts with optional source URLs
- **Output**: Markdown-formatted guide content
- **Error Handling**: Retry logic with exponential backoff
- **Rate Limiting**: Respect API quotas

### LocalStorage Integration
- **Key**: `wow_class_helper_favorites`
- **Format**: JSON array of class IDs
- **Scope**: Per-browser, per-domain
- **Validation**: Parse errors handled gracefully
- **Cleanup**: Invalid data cleared automatically

### Environment Configuration
- **Variable**: `GEMINI_API_KEY`
- **Source**: `.env.local` (development), process.env (build-time)
- **Fallback**: None (required)
- **Security**: Never exposed in client code

## Performance Optimizations

### Memoization Strategy
```typescript
// Memoize filtered class lists
const filteredClasses = useMemo(() => {
  return classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter === 'all' || c.role === roleFilter)
  );
}, [classes, searchTerm, roleFilter]);

// Memoize dungeon filtering
const filteredDungeons = useMemo(() => {
  return selectedExpansion === 'all'
    ? dungeons
    : dungeons.filter(d => d.expansion === selectedExpansion);
}, [selectedExpansion]);

// Memoize content key
const memoizedContentKey = useMemo(() =>
  `${selectedClass.id}-${activeSpec.id}-${activeTab}-${selectedDungeon?.id || 'none'}`,
  [selectedClass, activeSpec, activeTab, selectedDungeon]
);
```

### Lazy Loading
- Content generated on-demand per tab
- Specs and dungeons loaded from constants (no API call)
- Icons rendered as SVG components (no image requests)
- Guide content cached by key

### Caching Strategy
- Content cache by `memoizedContentKey`
- Favorites cached in localStorage
- No explicit TTL (cache until user clears)
- Future: Implement cache invalidation on patch updates

## Error Handling Strategy

### API Errors
- Catch all API calls with try-catch
- Log errors to console for debugging
- Display user-friendly messages in UI
- Suggest checking custom URLs for Admin users
- Provide reload button for retry

### Validation Errors
- Spec selection validated against class specs
- Dungeon selection validated against filtered list
- Role filter validated against predefined roles
- Source URLs validated as strings

### Edge Cases
- Empty search results: Display message, offer clear filters button
- No dungeons for expansion: Select first available dungeon
- Missing class icon: Display placeholder SVG
- Invalid localStorage data: Catch JSON parse error, reset favorites
- Corrupted guide content: Display error, offer regenerate

## Security Considerations

### XSS Prevention
- HTML entities escaped before rendering
- Ability tooltip parsing uses regex, not eval
- `dangerouslySetInnerHTML` only used after sanitization
- User input sanitized before display

### API Key Protection
- Never exposed in client-side code
- Injected at build time via Vite config
- Environment variable only accessible during build
- No API key in version control

### User Input Validation
- Search term used only for filtering (no API call)
- Custom URLs validated as strings before use
- Role selection limited to predefined options
- No eval() or dynamic code execution

### Data Integrity
- All external data validated before use
- Type checking enforced via TypeScript
- Constants validated against official sources
- Corrupted data handled gracefully

## Testing Strategy

### Unit Tests
- Markdown processor: Test header, list, code block rendering
- Ability tooltip parser: Test regex matching and metadata extraction
- Favorites toggle: Test localStorage persistence
- Data validation: Test class/spec/dungeon data validation
- Error handling: Test error message generation

### Integration Tests
- Class selection → ClassHub navigation
- Tab switching → Content regeneration
- Spec selection → Content update
- Dungeon filter → Content update
- Favorites toggle → Persistence verification
- Admin source injection → Content regeneration

### E2E Tests
- Full user flow: Select class → Select spec → View guides → Toggle favorite
- Admin flow: Inject URLs → Regenerate content → Verify custom sources used
- Error flow: Invalid API key → Error display → Reload → Retry
- Mobile flow: Test on mobile viewport with touch interactions
- Data accuracy: Verify all displayed data matches official sources

### Performance Tests
- Initial load: Measure < 3 second target
- Tab switching: Measure < 1 second target
- Search/filter: Measure < 100ms target
- Guide generation: Measure < 5 second target
- Memory usage: Monitor for leaks

## Future Enhancements

### Phase 2: Real-Time Data Integration
- WoW API integration for live data
- Automatic patch detection
- Real-time ability and talent data
- Live dungeon/raid progression tracking

### Phase 3: Community & Verification
- User accounts and guide ratings
- Community verification system
- Expert reviewer program
- Content versioning and history

### Phase 4: Addon Integration
- In-game addon version
- Synchronized data between web and addon
- In-game guide overlay
- Real-time player statistics integration

### Phase 5: Advanced Features
- PvP rating-specific guides
- Raid progression guides
- Item recommendations with market data
- Video guide integration
- AI-powered build optimization

## Deployment Considerations

### Build Process
- `npm run build` generates optimized bundle
- Vite handles code splitting and minification
- Environment variables injected at build time
- Output in `dist/` directory

### Environment Setup
- Development: `.env.local` with `GEMINI_API_KEY`
- Production: Set `GEMINI_API_KEY` via deployment platform
- No other environment variables required

### Monitoring
- Monitor API error rates
- Track guide generation success rate
- Monitor performance metrics
- Set up alerts for critical failures
- Log all errors to external service

### Rollback Strategy
- Keep previous build artifacts
- Maintain content cache for quick recovery
- Document breaking changes
- Plan for data migration if needed
