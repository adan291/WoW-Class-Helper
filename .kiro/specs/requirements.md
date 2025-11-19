# WoW AI Class Helper - Requirements Specification

## Project Vision

WoW AI Class Helper is a **data-driven, verification-first guide platform** for World of Warcraft. It generates expert-level guides for all 13 classes and their specializations across PvE and PvP content, with a strong emphasis on **data reliability, real-time accuracy, and verifiable sources**.

The platform is designed as a **web foundation** that can be cloned and adapted into an in-game addon for World of Warcraft.

## Core Principles

1. **Data Integrity First**: All information must be verifiable and sourced from authoritative WoW data
2. **Real-Time Accuracy**: Content reflects current game state (patches, balance changes)
3. **Source Attribution**: Every guide includes sources and verification methods
4. **Extensibility**: Architecture supports future addon integration
5. **User Trust**: Clear distinction between AI-generated and verified content

## Scope Definition

### In Scope
- **Classes**: All 13 playable classes (Warrior, Paladin, Hunter, Rogue, Priest, Shaman, Mage, Warlock, Monk, Druid, Demon Hunter, Death Knight, Evoker)
- **Specializations**: All available specs per class (2-4 per class)
- **Content Types**: 
  - Overview (class identity, playstyle, strengths/weaknesses)
  - Builds (stat priority, talent configurations, gear recommendations)
  - Rotations (ability priorities, cooldown management, DPS optimization)
  - Addons (recommended addons, WeakAuras, UI enhancements)
  - Dungeons (boss strategies, mechanics, role-specific tactics)
- **Expansions**: The War Within, Dragonflight, Shadowlands, and legacy content
- **Modes**: PvE (dungeons, raids) and PvP (arenas, battlegrounds)
- **User Roles**: User (viewer), Master (curator), Admin (system)

### Out of Scope
- Real-time WoW API integration (future phase)
- Raid progression guides (future phase)
- Item recommendations with market prices
- User authentication and accounts
- Database persistence (localStorage only)
- Community features (comments, ratings)
- Video content integration

## Acceptance Criteria

### AC1: Class & Specialization Discovery
**Given** a user visits the application  
**When** they view the class selection screen  
**Then** they should see:
- All 13 WoW classes with accurate icons and names
- Each class grouped by role (Tank, Healer, Damage, Support)
- Specialization count displayed per class
- Search functionality to find classes by name
- Role-based filtering (Tank, Healer, Damage, Support)
- Favorites system with localStorage persistence
- Favorites appear first in sorted lists

**Verification**: 
- Class data matches official WoW API
- Icons are accurate and consistent
- Search is case-insensitive and fuzzy-matchable
- Favorites persist across browser sessions

### AC2: Specialization Selection & Content Routing
**Given** a user selects a class  
**When** they view the class details page  
**Then** they should see:
- All available specializations for that class
- Specialization icons, names, and descriptions
- Role indicator for each specialization
- Ability to select a specialization
- Selected specialization persists across tab changes
- Tab navigation for different guide types (Overview, Builds, Rotations, Addons, Dungeons)

**Verification**:
- Spec data matches official WoW class structure
- Spec selection correctly routes to appropriate content
- Persistence works across page reloads

### AC3: Guide Generation with Source Verification
**Given** a user selects a class, specialization, and guide type  
**When** they request guide content  
**Then** the system should:
- Generate comprehensive, accurate guide content
- Include source attribution and verification methods
- Display loading state during generation
- Show generated content with proper formatting
- Include ability tooltips with cooldown and spell ID information
- Provide content refresh capability

**Verification**:
- Generated content is factually accurate
- Sources are verifiable and current
- Content reflects latest patch balance changes
- Ability information matches official WoW data

### AC4: Dungeon-Specific Strategies
**Given** a user selects the "Dungeons" tab  
**When** they view dungeon content  
**Then** they should see:
- Dungeon list filtered by expansion
- Dungeons sorted alphabetically
- Ability to select a specific dungeon
- Boss-specific strategies for the selected dungeon
- Role-specific tactics (Tank, Healer, DPS)
- Mechanic explanations and positioning guides

**Verification**:
- Dungeon data matches current WoW content
- Boss mechanics are accurate and current
- Strategies are verified by experienced players

### AC5: User Roles & Admin Capabilities
**Given** a user with Admin role  
**When** they access the application  
**Then** they should see:
- Admin configuration panel
- Ability to inject custom source URLs
- Custom sources override default AI knowledge
- Regenerate button to apply custom sources
- Audit trail of custom source injections

**Given** a user with User or Master role  
**When** they access the application  
**Then** they should:
- Not see admin configuration panel
- View content generated from default sources
- Have read-only access to guide content

**Verification**:
- Role-based access control is enforced
- Custom sources are properly applied
- Admin actions are logged

### AC6: Content Rendering & Formatting
**Given** generated guide content  
**When** the content is displayed  
**Then** it should render:
- Markdown formatting (headers, lists, bold, italic)
- Code blocks with syntax highlighting
- Ability tooltips in format: `[Ability Name]{Cooldown: X sec, ID: SpellID, Description: ...}`
- Tables for stat priorities and talent configurations
- Proper spacing and typography
- Copy-to-clipboard functionality for guide sections

**Verification**:
- All markdown elements render correctly
- No XSS vulnerabilities in rendered content
- Ability tooltips parse correctly
- Copy functionality works across browsers

### AC7: Error Handling & Recovery
**Given** an error occurs during content generation  
**When** the user views the error state  
**Then** they should see:
- Clear, user-friendly error message
- Actionable recovery steps
- Reload/retry button
- For Admin users: suggestion to check custom source URLs
- Application remains interactive

**Verification**:
- All error paths are handled gracefully
- No silent failures
- Error messages are helpful and specific

### AC8: Responsive Design & Performance
**Given** a user on any device (mobile, tablet, desktop)  
**When** they interact with the application  
**Then** it should:
- Adapt layout to screen size
- Maintain usability on all breakpoints
- Load initial content in < 3 seconds
- Switch tabs in < 1 second
- Perform search/filter in < 100ms
- Generate guide content in < 5 seconds

**Verification**:
- Responsive design tested on multiple devices
- Performance metrics meet targets
- No layout shifts or jank

## Data Requirements

### Class Data Structure
```
Class {
  id: string (e.g., "warrior")
  name: string
  role: "Tank" | "Healer" | "Damage" | "Support"
  icon: SVGComponent
  specs: Specialization[]
  description: string
}

Specialization {
  id: string (e.g., "warrior-protection")
  name: string
  role: "Tank" | "Healer" | "Damage" | "Support"
  icon: SVGComponent
  description: string
  primaryStat: string
  secondaryStat: string
}
```

### Dungeon Data Structure
```
Dungeon {
  id: string
  name: string
  expansion: "The War Within" | "Dragonflight" | "Shadowlands" | "Legacy"
  level: number
  bosses: Boss[]
}

Boss {
  id: string
  name: string
  mechanics: Mechanic[]
  roleStrategies: {
    tank: string
    healer: string
    dps: string
  }
}
```

### Guide Content Structure
```
Guide {
  classId: string
  specId: string
  type: "overview" | "builds" | "rotations" | "addons" | "dungeons"
  dungeonId?: string
  content: string (markdown)
  sources: Source[]
  generatedAt: timestamp
  patchVersion: string
}

Source {
  title: string
  url: string
  type: "official" | "community" | "data" | "custom"
  verified: boolean
  lastVerified: timestamp
}
```

## Non-Functional Requirements

### Reliability
- Data accuracy: 100% for official WoW data, 95%+ for community-verified content
- Uptime: 99.5% availability
- Error recovery: All errors must be catchable and recoverable
- Data validation: All external data must be validated before use

### Security
- API key protection: Never exposed in client code
- XSS prevention: All user input sanitized
- URL validation: Custom source URLs validated before use
- HTTPS only: All API calls over secure connection

### Performance
- Initial load: < 3 seconds
- Tab switching: < 1 second
- Search/filter: < 100ms
- Guide generation: < 5 seconds
- Memory usage: < 50MB for typical session

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios ≥ 4.5:1
- Focus states visible on all interactive elements

### Maintainability
- TypeScript strict mode
- Comprehensive error handling
- Clear code comments
- Consistent naming conventions
- Modular component structure

### Extensibility
- Architecture supports addon integration
- Data structures compatible with WoW addon format
- API abstraction layer for future real-time data
- Plugin system for custom content sources

## Success Metrics

1. **Data Accuracy**: 100% of official WoW data verified, 95%+ of community content verified
2. **User Engagement**: Users complete at least one full guide view per session
3. **Performance**: 95% of page loads under 3 seconds
4. **Error Rate**: < 0.1% of guide generation requests fail
5. **User Satisfaction**: 4.5+ star rating for content accuracy
6. **Addon Readiness**: Architecture supports addon cloning with minimal changes

## Future Phases

### Phase 2: Real-Time Data Integration
- WoW API integration for live data
- Automatic patch detection and content updates
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

## Constraints

- Must work without real-time WoW API (Phase 1)
- Must support offline content viewing (future)
- Must be cloneable for addon development
- Must maintain data accuracy as primary goal
- Must not require user authentication (Phase 1)
