# WoW AI Class Helper - Design Document

## Architecture Overview

### Component Hierarchy
```
App
├── ClassSelection
│   ├── ClassIcon (x13)
│   └── Filters (Search, Role)
└── ClassHub
    ├── ClassIconRenderer
    ├── Tab Navigation
    ├── Spec Selector
    ├── Dungeon Selector (conditional)
    ├── Admin Config Panel (conditional)
    └── GuideSection
        ├── LoadingSpinner
        └── Markdown Renderer
```

### State Management
- **App Level**: selectedClass, userRole
- **ClassHub Level**: activeTab, activeSpec, selectedExpansion, selectedDungeon, content, isLoading, error
- **ClassSelection Level**: searchTerm, roleFilter, favorites (localStorage)

### Data Flow
1. User selects class → ClassHub mounts with default spec
2. User selects tab → fetchContent triggered
3. Gemini API generates markdown content
4. Content rendered with custom markdown processor
5. Ability tooltips parsed from [Name]{metadata} format

## Correctness Properties

### CP1: Class & Spec Consistency
- **Property**: Selected specialization must belong to selected class
- **Implementation**: activeSpec initialized from wowClass.specs[0], only updated via setActiveSpec with valid specs
- **Verification**: Spec selector only renders specs from current class

### CP2: Dungeon Filtering Accuracy
- **Property**: Displayed dungeons must match selected expansion filter
- **Implementation**: filteredDungeons computed with useMemo, filters by expansion or returns all
- **Verification**: selectedDungeon updated when filter changes, invalid selections reset to first available

### CP3: Content Generation Consistency
- **Property**: Generated content must match the active tab, spec, and dungeon selection
- **Implementation**: memoizedContentKey includes all relevant state, fetchContent dependency array includes all factors
- **Verification**: Content regenerates only when key factors change

### CP4: Favorites Persistence
- **Property**: Marked favorites must persist across page reloads
- **Implementation**: Favorites stored in localStorage with JSON serialization
- **Verification**: useEffect on mount reads from localStorage, toggleFavorite updates both state and storage

### CP5: Admin Source Injection
- **Property**: Custom URLs must override default AI knowledge when provided
- **Implementation**: sourceUrls passed to generateContentWithGemini, prepended to prompt
- **Verification**: Regenerate button calls fetchContent with sourceUrls parameter

### CP6: Markdown Rendering Fidelity
- **Property**: Markdown must render correctly without XSS vulnerabilities
- **Implementation**: HTML entities escaped before processing, dangerouslySetInnerHTML used only after sanitization
- **Verification**: Ability tooltips parsed correctly, code blocks preserve formatting

### CP7: Error Recovery
- **Property**: Errors must be catchable and displayable without crashing the app
- **Implementation**: try-catch in fetchContent, error state managed separately from content
- **Verification**: Error message displays, reload button available, app remains interactive

### CP8: Role-Based Access Control
- **Property**: Admin features only visible when userRole === 'admin'
- **Implementation**: Conditional rendering of admin panel based on userRole
- **Verification**: Admin config hidden for User and Master roles

### CP9: Loading State Management
- **Property**: isLoading must be true during API call, false after completion or error
- **Implementation**: setIsLoading(true) at start, setIsLoading(false) in finally block
- **Verification**: Spinner displays during loading, content displays after completion

### CP10: Responsive Design
- **Property**: UI must adapt to mobile, tablet, and desktop viewports
- **Implementation**: Tailwind responsive classes (md:, lg:, xl:)
- **Verification**: Grid layouts adjust column count, flex directions change, font sizes scale

## Integration Points

### Gemini API
- **Endpoint**: GoogleGenAI.models.generateContent
- **Model**: gemini-2.5-flash
- **Input**: Markdown-formatted prompts with optional source URLs
- **Output**: Markdown-formatted guide content

### LocalStorage
- **Key**: wow_class_helper_favorites
- **Format**: JSON array of class IDs
- **Scope**: Per-browser, per-domain

### Environment
- **Variable**: GEMINI_API_KEY
- **Source**: .env.local (development), process.env (build-time)
- **Fallback**: None (required)

## Performance Optimizations

### Memoization
- `filteredClasses` in ClassSelection: Prevents re-filtering on every render
- `filteredDungeons` in ClassHub: Prevents re-filtering on every render
- `memoizedContentKey` in ClassHub: Prevents unnecessary API calls

### Lazy Loading
- Content generated on-demand per tab
- Specs and dungeons loaded from constants (no API call)
- Icons rendered as SVG components (no image requests)

### Caching Strategy
- No explicit caching (each tab change triggers new API call)
- Future optimization: Cache generated content by key

## Error Handling Strategy

### API Errors
- Catch and display user-friendly message
- Suggest checking custom URLs for Admin users
- Provide reload button for retry

### Validation Errors
- Spec selection validated against class specs
- Dungeon selection validated against filtered list
- Role filter validated against predefined roles

### Edge Cases
- Empty search results: Display message, offer clear filters button
- No dungeons for expansion: Select first available dungeon
- Missing class icon: Display placeholder SVG
- Invalid localStorage data: Catch JSON parse error, reset favorites

## Security Considerations

### XSS Prevention
- HTML entities escaped before rendering
- Ability tooltip parsing uses regex, not eval
- dangerouslySetInnerHTML only used after sanitization

### API Key Protection
- Never exposed in client-side code (injected at build time)
- Vite config uses process.env for secure injection

### User Input
- Search term used only for filtering (no API call)
- Custom URLs validated as strings (no execution)
- Role selection limited to predefined options

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

## Future Enhancements

### Phase 2
- Content caching by key
- Offline mode with cached guides
- Export guides as PDF
- Share guide links

### Phase 3
- User accounts and cloud sync
- Custom talent builds
- Community ratings and comments
- Video guide integration

### Phase 4
- Real-time WoW API integration
- Raid progression guides
- PvP-specific content
- Item recommendations
