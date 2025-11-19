# WoW AI Class Helper - Feature Specification

## Overview
WoW AI Class Helper is an AI-powered guide generator for World of Warcraft classes. It leverages Google's Gemini API to provide dynamic, expert-level guides for class builds, rotations, addons, and dungeon strategies.

## Acceptance Criteria

### AC1: Class Selection & Navigation
- Users can browse all 13 WoW classes with visual icons
- Classes can be filtered by role (Tank, Healer, Damage)
- Users can search classes by name
- Users can mark classes as favorites (persisted in localStorage)
- Favorites appear first in the list
- Users can navigate back from class details to selection

### AC2: Specialization Management
- Each class displays its available specializations
- Users can select a specialization to view role-specific content
- Specialization selection persists across tab changes
- Spec icons are displayed alongside names

### AC3: Guide Generation
- System generates guides for 5 content types:
  - Overview: Class identity and playstyle
  - Builds: Stat priority and talent configurations
  - Rotations: Ability priorities with cooldown information
  - Addons: Recommended addons and WeakAuras
  - Dungeons: Boss-specific strategies

### AC4: Dungeon Content
- Users can filter dungeons by expansion
- Dungeons are sorted alphabetically
- Dungeon selection updates guide content
- All dungeons from The War Within, Dragonflight, Shadowlands, and legacy expansions are available

### AC5: User Roles & Admin Features
- Three user roles: User, Master, Admin
- Admin mode displays configuration panel
- Admin can inject custom source URLs
- Custom URLs override default AI knowledge
- Regenerate button applies custom sources to current guide

### AC6: Content Rendering
- Markdown formatting is properly rendered
- Ability tooltips display with cooldown and spell ID information
- Code blocks are syntax-highlighted
- Lists use custom styling
- Copy-to-clipboard functionality for guide content

### AC7: Error Handling & Loading States
- Loading spinner displays during content generation
- Error messages provide actionable feedback
- Failed requests suggest checking custom URLs (for Admin)
- Reload button available on error state

### AC8: UI/UX Polish
- Dark theme with WoW-inspired styling
- Class colors applied to UI elements
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Backdrop blur effects for depth

## Technical Requirements

### Dependencies
- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- Google GenAI SDK 1.30.0
- Tailwind CSS (via Vite)

### API Integration
- Gemini 2.5 Flash model for content generation
- API key from environment variable (GEMINI_API_KEY)
- Support for custom source URL injection

### Data Structure
- 13 playable classes with 2-4 specializations each
- 24 dungeons across 4 expansions
- 4 role types (Tank, Healer, Damage, Support)

### Performance Considerations
- Memoized filtered class lists
- Lazy content generation (on-demand)
- LocalStorage for favorites persistence
- Efficient re-renders with useCallback and useMemo

## Out of Scope
- PvP-specific content (focus on PvE)
- Raid progression guides
- Item recommendations
- Real-time data from WoW API
- User authentication
- Database persistence
