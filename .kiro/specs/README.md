# WoW AI Class Helper - Specifications

## Overview

This directory contains the complete specification for the WoW AI Class Helper project. The specs are organized into two documents that work together to define what the system should do and how it should work.

## Documents

### requirements.md
**Purpose**: Define what the application does and what users can do with it.

**Contains**:
- Project vision and core principles
- Scope definition (in-scope and out-of-scope)
- 8 Acceptance Criteria (AC) covering all major features
- Data structure specifications
- Non-functional requirements (reliability, security, performance, accessibility)
- Success metrics
- Future phases and constraints

**Use When**:
- Planning features
- Writing tests
- Validating implementation completeness
- Understanding user requirements

**Key Sections**:
- AC1: Class & Specialization Discovery
- AC2: Specialization Selection & Content Routing
- AC3: Guide Generation with Source Verification
- AC4: Dungeon-Specific Strategies
- AC5: User Roles & Admin Capabilities
- AC6: Content Rendering & Formatting
- AC7: Error Handling & Recovery
- AC8: Responsive Design & Performance

### design.md
**Purpose**: Explain how the application is built and ensure correct behavior.

**Contains**:
- System architecture and component hierarchy
- State management strategy
- 12 Correctness Properties (CP) with implementations and test cases
- Integration points (Gemini API, LocalStorage, Environment)
- Performance optimizations
- Error handling strategy
- Security considerations
- Testing strategy
- Future enhancements
- Deployment considerations

**Use When**:
- Implementing features
- Debugging complex issues
- Optimizing performance
- Planning refactoring
- Verifying correctness

**Key Sections**:
- CP1: Class & Specialization Consistency
- CP2: Dungeon Filtering Accuracy
- CP3: Content Generation Consistency
- CP4: Favorites Persistence
- CP5: Admin Source Injection
- CP6: Markdown Rendering Fidelity
- CP7: Error Recovery
- CP8: Role-Based Access Control
- CP9: Loading State Management
- CP10: Responsive Design
- CP11: Data Accuracy Validation
- CP12: Content Source Attribution

## Coverage Matrix

### Acceptance Criteria → Correctness Properties

| AC | Description | Related CPs |
|---|---|---|
| AC1 | Class & Specialization Discovery | CP1, CP10, CP11 |
| AC2 | Specialization Selection & Content Routing | CP1, CP3 |
| AC3 | Guide Generation with Source Verification | CP3, CP5, CP6, CP12 |
| AC4 | Dungeon-Specific Strategies | CP2, CP3, CP11 |
| AC5 | User Roles & Admin Capabilities | CP5, CP8 |
| AC6 | Content Rendering & Formatting | CP6, CP7 |
| AC7 | Error Handling & Recovery | CP7, CP9 |
| AC8 | Responsive Design & Performance | CP10 |

**Coverage**: 100% - Every acceptance criterion has corresponding correctness properties

## Key Principles

### 1. Data Integrity First
- All information must be verifiable and sourced from authoritative WoW data
- 100% accuracy for official WoW data, 95%+ for community-verified content
- Every guide includes sources and verification methods

### 2. Real-Time Accuracy
- Content reflects current game state (patches, balance changes)
- Automatic patch detection and content updates (Phase 2)
- Live ability and talent data (Phase 2)

### 3. Source Attribution
- Every guide includes verifiable sources
- Clear distinction between AI-generated and verified content
- Source types: official, community, data, custom

### 4. Extensibility
- Architecture supports future addon integration
- Data structures compatible with WoW addon format
- API abstraction layer for future real-time data

### 5. User Trust
- Clear error messages and recovery steps
- Transparent about data sources
- Admin audit trail for custom sources

## Quick Reference

### For Feature Planning
1. Read requirements.md → Acceptance Criteria section
2. Identify which AC your feature addresses
3. Check related CPs in design.md

### For Implementation
1. Read design.md → Relevant Correctness Property
2. Review implementation strategy
3. Check test cases
4. Follow project-standards.md for code style

### For Testing
1. Read design.md → Verification section for each CP
2. Implement test cases listed
3. Verify against acceptance criteria in requirements.md

### For Debugging
1. Identify which CP is failing
2. Read design.md → Implementation section
3. Check error handling strategy
4. Review test cases for similar scenarios

## Data Structures

### Class Data
```typescript
Class {
  id: string
  name: string
  role: "Tank" | "Healer" | "Damage" | "Support"
  icon: SVGComponent
  specs: Specialization[]
  description: string
}
```

### Specialization Data
```typescript
Specialization {
  id: string
  name: string
  role: "Tank" | "Healer" | "Damage" | "Support"
  icon: SVGComponent
  description: string
  primaryStat: string
  secondaryStat: string
}
```

### Guide Content
```typescript
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
```

## Performance Targets

- Initial load: < 3 seconds
- Tab switching: < 1 second
- Search/filter: < 100ms
- Guide generation: < 5 seconds
- Memory usage: < 50MB per session

## Security Requirements

- API key protection (never exposed in client code)
- XSS prevention (all user input sanitized)
- URL validation (custom sources validated before use)
- HTTPS only (all API calls over secure connection)
- Role-based access control (admin features protected)

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios ≥ 4.5:1
- Focus states visible on all interactive elements

## Future Phases

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

## Integration Points

### Gemini API
- Model: `gemini-2.5-flash`
- Purpose: Content generation
- Error handling: Retry logic with exponential backoff
- Rate limiting: Respect API quotas

### LocalStorage
- Key: `wow_class_helper_favorites`
- Format: JSON array of class IDs
- Validation: Parse errors handled gracefully

### Environment
- Variable: `GEMINI_API_KEY`
- Source: `.env.local` (dev), process.env (build-time)
- Security: Never exposed in client code

## Related Documentation

- **Project Standards**: `.kiro/steering/project-standards.md`
- **API Guidelines**: `.kiro/steering/gemini-api-guidelines.md`
- **Quick Start**: `.kiro/QUICK_START.md`

## How to Use These Specs

### Step 1: Understand Requirements
Read `requirements.md` to understand what the application should do.

### Step 2: Understand Design
Read `design.md` to understand how it should work.

### Step 3: Plan Implementation
Map requirements to correctness properties and identify implementation tasks.

### Step 4: Implement Features
Follow `project-standards.md` for code style and conventions.

### Step 5: Verify Correctness
Test against correctness properties and acceptance criteria.

## Maintenance

### When to Update Specs

**Update requirements.md when**:
- New features are planned
- Acceptance criteria change
- Scope changes
- Success metrics change

**Update design.md when**:
- Architecture changes
- New correctness properties needed
- Implementation strategy changes
- Performance targets change

### Version Control

- Keep specs in version control
- Document changes in commit messages
- Reference specs in pull requests
- Use specs for code review

## Questions?

- **What should the app do?** → See requirements.md
- **How should it work?** → See design.md
- **How do I code it?** → See project-standards.md
- **How do I integrate Gemini?** → See gemini-api-guidelines.md
- **How do I get started?** → See QUICK_START.md
