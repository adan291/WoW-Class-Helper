---
inclusion: always
---

# WoW AI Class Helper - Project Standards

## Code Style & Conventions

### TypeScript

- Use strict mode (tsconfig.json: strict: true)
- Define interfaces for all component props
- Use type aliases for union types (e.g., `type TabId = 'overview' | 'specs'`)
- Avoid `any` type; use generics or union types instead
- Export types alongside implementations

### React Components

- Functional components with hooks only
- Use `React.FC` or explicit prop typing
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed to children
- Keep components focused on single responsibility

### File Organization

```
components/
├── [ComponentName].tsx       # Main component
├── icons/                    # SVG icon components
└── [SubComponent].tsx        # Related components

services/
├── geminiService.ts          # API integration
└── [ServiceName].ts          # Other services

types.ts                       # Shared type definitions
constants.ts                   # Shared constants
```

### Naming Conventions

- Components: PascalCase (e.g., `ClassSelection`)
- Functions: camelCase (e.g., `handleSelectClass`)
- Constants: UPPER_SNAKE_CASE (e.g., `WOW_CLASSES`)
- Types/Interfaces: PascalCase (e.g., `WowClass`)
- CSS Classes: kebab-case (e.g., `class-icon-container`)

## UI/UX Standards

### Design System

- **Color Palette**: Dark theme (gray-900 base) with class-specific accent colors
- **Typography**: Tailwind defaults with custom sizing for hierarchy
- **Spacing**: Tailwind spacing scale (4px base unit)
- **Shadows**: Subtle shadows for depth, stronger shadows for modals
- **Animations**: Smooth transitions (200-300ms), fade-in effects

### Responsive Breakpoints

- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md, lg)
- Desktop: > 1024px (xl, 2xl)

### Accessibility

- Semantic HTML (buttons, nav, main, etc.)
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Color contrast ratios ≥ 4.5:1 for text
- Focus states visible on all interactive elements

### WoW Theming

- Use class colors from constants.ts
- Apply WoW-inspired styling (dark, metallic, glowing effects)
- Include class-specific icons and visual indicators
- Maintain immersion with thematic language

## API Integration

### Gemini Service

- All API calls go through `services/geminiService.ts`
- Prompts should be detailed and include formatting instructions
- Support optional `sourceUrls` parameter for custom knowledge injection
- Always include error handling and user-friendly error messages
- Use `gemini-2.5-flash` model for speed and cost efficiency

### Prompt Engineering

- Include context about the user's role (spec, class)
- Specify output format (markdown)
- Provide examples for complex formatting (e.g., ability tooltips)
- Include section headers and structure requirements
- Mention specific game mechanics and terminology

## Data Management

### LocalStorage

- Key prefix: `wow_class_helper_`
- Always wrap in try-catch for JSON operations
- Validate data on retrieval
- Clear invalid data gracefully

### Constants

- All game data (classes, specs, dungeons) in `constants.ts`
- Update constants when new expansions/classes are added
- Keep data structures consistent with types.ts

### State Management

- Lift state to nearest common ancestor
- Use useState for local component state
- Use useEffect for side effects (API calls, localStorage)
- Avoid prop drilling; consider context for deeply nested state

## Error Handling

### API Errors

- Catch all API calls with try-catch
- Log errors to console for debugging
- Display user-friendly messages in UI
- Provide actionable recovery steps

### Validation

- Validate user input before API calls
- Check array bounds before accessing elements
- Validate localStorage data on retrieval
- Provide fallback values for missing data

### User Feedback

- Show loading states during async operations
- Display error messages with context
- Provide retry/reload buttons
- Never silently fail

## Testing

### Unit Tests

- Test pure functions (formatters, filters)
- Test component rendering with different props
- Test event handlers and state updates
- Aim for >80% coverage on critical paths

### Integration Tests

- Test component interactions
- Test API integration with mocked responses
- Test localStorage persistence
- Test error scenarios

### Manual Testing

- Test on mobile, tablet, desktop
- Test with different user roles
- Test with custom source URLs
- Test error states and edge cases

## Performance

### Optimization Targets

- Initial load: < 3 seconds
- Tab switching: < 1 second
- Search/filter: < 100ms
- API response: < 5 seconds (Gemini)

### Techniques

- Code splitting for large components
- Lazy loading for images/icons
- Memoization for expensive computations
- Debouncing for search input
- Efficient re-renders with React.memo

## Documentation

### Code Comments

- Explain "why", not "what"
- Document complex algorithms
- Include examples for non-obvious usage
- Keep comments up-to-date with code

### README

- Setup instructions
- Environment variables required
- Build and deployment steps
- Known limitations and future work

### Commit Messages

- Use conventional commits (feat:, fix:, docs:, etc.)
- Reference issue numbers when applicable
- Keep messages concise but descriptive
- Example: `feat: add dungeon filtering by expansion`

## Security

### API Keys

- Never commit .env.local
- Use environment variables for sensitive data
- Inject at build time, not runtime
- Rotate keys regularly

### User Input

- Sanitize search terms
- Validate role selections
- Escape HTML in user-generated content
- Validate URLs before API injection

### Dependencies

- Keep dependencies up-to-date
- Review security advisories
- Use npm audit regularly
- Pin versions in package-lock.json

## Deployment

### Build Process

- `npm run build` generates optimized bundle
- Vite handles code splitting and minification
- Environment variables injected at build time
- Output in `dist/` directory

### Environment Variables

- Development: `.env.local`
- Production: Set via deployment platform
- Required: `GEMINI_API_KEY`
- Optional: None currently

### Monitoring

- Monitor API error rates
- Track user engagement metrics
- Log errors to external service
- Set up alerts for critical failures
