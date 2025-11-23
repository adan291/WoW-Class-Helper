# WoW AI Class Helper - Design Spec

## Architecture Overview

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
    │   ├── ExpansionFilter
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

### State Management

**App Level**:

- `selectedClass`: Current selected class ID
- `userRole`: User role (User, Master, Admin)

**ClassHub Level**:

- `activeTab`: Current guide type
- `activeSpec`: Currently selected specialization
- `selectedExpansion`: Dungeon expansion filter
- `selectedDungeon`: Currently selected dungeon
- `content`: Generated guide content
- `isLoading`: Content generation in progress
- `error`: Error message if generation failed
- `sourceUrls`: Custom source URLs (Admin only)

**ClassSelection Level**:

- `searchTerm`: Search input value
- `roleFilter`: Selected role filter
- `favorites`: Array of favorited class IDs

### Data Flow

1. User selects class → ClassHub mounts with default spec
2. User selects tab → fetchContent triggered
3. Gemini API generates markdown content
4. Content rendered with custom markdown processor
5. Ability tooltips parsed from [Name]{metadata} format

---

## Correctness Properties

### CP1: Class & Specialization Consistency

**Property**: Selected specialization must belong to selected class

**Implementation**:

- activeSpec initialized from wowClass.specs[0]
- setActiveSpec() only accepts specs from current class
- Spec selector renders only specs from current class

**Verification**:

- Spec selector disabled if no specs available
- Invalid spec selection rejected
- Spec persists across tab changes

---

### CP2: Dungeon Filtering Accuracy

**Property**: Displayed dungeons must match selected expansion filter

**Implementation**:

- filteredDungeons computed with useMemo
- Filters by expansion or returns all
- selectedDungeon updated when filter changes

**Verification**:

- Dungeon list updates when expansion changes
- Invalid selections reset to first available
- Dungeon count matches expansion data

---

### CP3: Content Generation Consistency

**Property**: Generated content must match active tab, spec, and dungeon selection

**Implementation**:

- memoizedContentKey includes all relevant state
- fetchContent dependency array includes all factors
- Content regenerates only when key factors change

**Verification**:

- Content regenerates only when key changes
- Content matches requested selections
- No stale content displayed

---

### CP4: Favorites Persistence

**Property**: Marked favorites must persist across page reloads

**Implementation**:

- Favorites stored in localStorage with JSON serialization
- useEffect on mount reads from localStorage
- toggleFavorite updates both state and storage

**Verification**:

- Favorites saved on toggle
- Favorites loaded on mount
- Invalid data handled gracefully

---

### CP5: Admin Source Injection

**Property**: Custom URLs must override default AI knowledge when provided

**Implementation**:

- sourceUrls passed to generateContentWithGemini()
- Prepended to prompt
- Regenerate button calls fetchContent with sourceUrls

**Verification**:

- Custom URLs override default knowledge
- Regenerate applies custom sources
- Admin-only access enforced

---

### CP6: Markdown Rendering Fidelity

**Property**: Markdown must render correctly without XSS vulnerabilities

**Implementation**:

- HTML entities escaped before processing
- dangerouslySetInnerHTML used only after sanitization
- Ability tooltips parsed correctly

**Verification**:

- All markdown elements render correctly
- No XSS vulnerabilities
- Ability tooltips parse correctly

---

### CP7: Error Recovery

**Property**: Errors must be catchable and displayable without crashing the app

**Implementation**:

- try-catch in fetchContent
- Error state managed separately from content
- Error message displays with recovery steps

**Verification**:

- All errors caught and logged
- User-friendly messages displayed
- App remains interactive

---

### CP8: Role-Based Access Control

**Property**: Admin features only visible when userRole === 'admin'

**Implementation**:

- Conditional rendering of admin panel
- Role validation on all admin operations
- Admin features protected

**Verification**:

- Admin panel hidden for non-admin users
- Admin features not accessible via URL
- Role validation enforced

---

### CP9: Loading State Management

**Property**: isLoading must be true during API call, false after completion or error

**Implementation**:

- setIsLoading(true) at start
- setIsLoading(false) in finally block
- Spinner displays during loading

**Verification**:

- Spinner displays during generation
- Spinner hidden after completion
- Spinner hidden after error

---

### CP10: Responsive Design

**Property**: UI must adapt to mobile, tablet, and desktop viewports

**Implementation**:

- Tailwind responsive classes (md:, lg:, xl:)
- Grid layouts adjust column count
- Flex directions change based on breakpoint

**Verification**:

- Layout adapts to all breakpoints
- No horizontal scrolling on mobile
- Touch targets ≥ 44px

---

### CP11: Data Accuracy Validation

**Property**: All displayed data must match official WoW sources

**Implementation**:

- Class data validated against OFFICIAL_WOW_CLASSES
- Spec data validated against official sources
- Dungeon data validated against current patch

**Verification**:

- Class data matches official API
- Spec data matches official sources
- Dungeon data matches current content

---

### CP12: Content Source Attribution

**Property**: Every guide must include verifiable sources

**Implementation**:

- Every guide includes sources array
- Sources include title, url, type, verified, lastVerified
- Sources displayed in guide content

**Verification**:

- Every guide includes at least one source
- Sources are verifiable and accessible
- Source types are accurate

---

## Integration Points

### Gemini API Integration

- **Endpoint**: GoogleGenAI.models.generateContent
- **Model**: gemini-2.5-flash
- **Input**: Markdown-formatted prompts with optional source URLs
- **Output**: Markdown-formatted guide content
- **Error Handling**: Retry logic with exponential backoff

### LocalStorage Integration

- **Key**: wow_class_helper_favorites
- **Format**: JSON array of class IDs
- **Scope**: Per-browser, per-domain
- **Validation**: Parse errors handled gracefully

### Environment Configuration

- **Variable**: GEMINI_API_KEY
- **Source**: .env.local (development), process.env (build-time)
- **Fallback**: None (required)
- **Security**: Never exposed in client code

---

## Performance Optimizations

### Memoization Strategy

```typescript
// Memoize filtered class lists
const filteredClasses = useMemo(() => {
  return classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (roleFilter === 'all' || c.role === roleFilter)
  );
}, [classes, searchTerm, roleFilter]);

// Memoize dungeon filtering
const filteredDungeons = useMemo(() => {
  return selectedExpansion === 'all'
    ? dungeons
    : dungeons.filter((d) => d.expansion === selectedExpansion);
}, [selectedExpansion]);

// Memoize content key
const memoizedContentKey = useMemo(
  () => `${selectedClass.id}-${activeSpec.id}-${activeTab}-${selectedDungeon?.id || 'none'}`,
  [selectedClass, activeSpec, activeTab, selectedDungeon]
);
```

### Lazy Loading

- Content generated on-demand per tab
- Specs and dungeons loaded from constants
- Icons rendered as SVG components

### Caching Strategy

- Content cache by memoizedContentKey
- Favorites cached in localStorage
- Future: Implement cache invalidation on patch updates

---

## Error Handling Strategy

### API Errors

- Catch all API calls with try-catch
- Log errors to console for debugging
- Display user-friendly messages in UI
- Suggest checking custom URLs for Admin users

### Validation Errors

- Spec selection validated against class specs
- Dungeon selection validated against filtered list
- Role filter validated against predefined roles

### Edge Cases

- Empty search results: Display message, offer clear filters
- No dungeons for expansion: Select first available
- Missing class icon: Display placeholder SVG
- Invalid localStorage data: Catch JSON parse error, reset

---

## Security Considerations

### XSS Prevention

- HTML entities escaped before rendering
- Ability tooltip parsing uses regex, not eval
- dangerouslySetInnerHTML only used after sanitization

### API Key Protection

- Never exposed in client-side code
- Injected at build time via Vite config
- Environment variable only accessible during build

### User Input Validation

- Search term used only for filtering
- Custom URLs validated as strings
- Role selection limited to predefined options

---

## Testing Strategy

### Unit Tests

- Markdown processor: Test header, list, code block rendering
- Ability tooltip parser: Test regex matching and metadata extraction
- Favorites toggle: Test localStorage persistence

### Integration Tests

- Class selection → ClassHub navigation
- Tab switching → Content regeneration
- Spec selection → Content update
- Dungeon filter → Content update

### E2E Tests

- Full user flow: Select class → Select spec → View guides → Toggle favorite
- Admin flow: Inject URLs → Regenerate content
- Error flow: Invalid API key → Error display → Reload

---

## Future Enhancements

### Phase 2: Real-Time Data Integration

- WoW API integration for live data
- Automatic patch detection
- Real-time ability and talent data

### Phase 3: Community & Verification

- User accounts and guide ratings
- Community verification system
- Expert reviewer program

### Phase 4: Addon Integration

- In-game addon version
- Synchronized data between web and addon
- In-game guide overlay

### Phase 5: Advanced Features

- PvP rating-specific guides
- Raid progression guides
- Item recommendations with market data
- Video guide integration

---

## Deployment Considerations

### Build Process

- `npm run build` generates optimized bundle
- Vite handles code splitting and minification
- Environment variables injected at build time
- Output in `dist/` directory

### Environment Setup

- Development: `.env.local` with `GEMINI_API_KEY`
- Production: Set `GEMINI_API_KEY` via deployment platform

### Monitoring

- Monitor API error rates
- Track guide generation success rate
- Monitor performance metrics
- Set up alerts for critical failures
