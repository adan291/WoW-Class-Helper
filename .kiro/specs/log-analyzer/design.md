# Design Document - Log Analyzer

## Overview

Log Analyzer es un módulo React/TypeScript para análisis de logs de combate de World of Warcraft. Procesa archivos de log en formato CLEU, extrae estadísticas de habilidades, visualiza líneas de tiempo, genera estrategias con Gemini AI, y ofrece un mini-juego de práctica de mecánicas.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LogAnalyzerApp.tsx                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   Header    │ │  NavBar     │ │   Main      │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   │FileUpload│         │AbilitiesTab│       │TimelineTab│
   └─────────┘          └─────────┘          └─────────┘
        │                     │                     │
   ┌────┴────┐          ┌────┴────┐                │
   │StrategyTab│        │MiniGameTab│              │
   └─────────┘          └─────────┘                │
                              │
                    ┌─────────┴─────────┐
                    │     Services      │
                    ├───────────────────┤
                    │ logParser.ts      │
                    │ geminiService.ts  │
                    └───────────────────┘
```

## Components and Interfaces

### Main Component

```typescript
// LogAnalyzerApp - Estado principal
interface LogAnalyzerState {
  data: LogSummary | null;
  activeTab: Tab;
}

enum Tab {
  UPLOAD = 'Upload',
  ABILITIES = 'Abilities',
  TIMELINE = 'Timeline',
  STRATEGY = 'AI Strategy',
  GAME = 'Practice',
}
```

### Tab Components

| Component    | Purpose                              | Dependencies  |
| ------------ | ------------------------------------ | ------------- |
| FileUpload   | Carga y parsing de archivos          | logParser     |
| AbilitiesTab | Visualización de habilidades por rol | geminiService |
| TimelineTab  | Línea de tiempo del encuentro        | -             |
| StrategyTab  | Guía de estrategia generada por IA   | geminiService |
| MiniGameTab  | Mini-juego de práctica               | geminiService |

## Data Models

### Core Types

```typescript
enum Role {
  TANK = 'Tank',
  HEALER = 'Healer',
  MELEE = 'Melee DPS',
  RANGED = 'Ranged DPS',
  UNKNOWN = 'Unknown',
}

interface SpellStats {
  id: string;
  name: string;
  count: number;
  totalDamage: number;
  avgDamage: number;
  targets: Set<string>;
  source: string;
  timestamp: number[];
  category: 'hostile' | 'friendly';
}

interface Combatant {
  name: string;
  role: Role;
  class?: string;
}

interface LogSummary {
  encounterName: string;
  duration: number;
  spells: SpellStats[];
  combatants: Combatant[];
  startTime: number;
  endTime: number;
  rawLineCount: number;
}

interface AIStrategyResult {
  markdown: string;
  phases: { name: string; timestamp: number }[];
}

interface AIMiniGameConfig {
  bossName: string;
  mechanics: {
    name: string;
    type: 'dodge' | 'soak' | 'spread';
    color: string;
    description: string;
    damage: number;
    interval: number;
    radius: number;
  }[];
}

interface SpellAIAnalysis {
  roles: Role[];
  description: string;
}
```

### Log Parser Output

```typescript
// processLogText returns LogSummary
// Key parsing rules:
// - ENCOUNTER_START: Extract encounter name
// - SPELL_DAMAGE: Aggregate damage, track targets
// - SPELL_CAST_SUCCESS: Track cast counts, timestamps
// - Source GUID prefix determines category:
//   - Creature/Vehicle/Boss = hostile
//   - Player = friendly
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Log Parsing Validity

_For any_ valid combat log text with CLEU format events, parsing SHALL extract a LogSummary with rawLineCount > 0, and the duration SHALL equal endTime - startTime.

**Validates: Requirements 1.2, 7.6**

**Implementation:**

```typescript
const parseLogFile = async (file: File): Promise<LogSummary> => {
  // ... parsing logic
  return {
    encounterName,
    duration: endTime - startTime, // Property: duration = endTime - startTime
    spells: Array.from(spellsMap.values()),
    combatants: Array.from(combatantsMap.values()),
    startTime,
    endTime,
    rawLineCount: validLines, // Property: validLines > 0 for valid logs
  };
};
```

### Property 2: Empty File Rejection

_For any_ file with size === 0, the parser SHALL reject with an error message indicating the file is empty.

**Validates: Requirements 1.3**

**Implementation:**

```typescript
export const parseLogFile = async (file: File): Promise<LogSummary> => {
  if (file.size === 0) {
    return Promise.reject(new Error('The uploaded file is empty (0 bytes).'));
  }
  // ... continue parsing
};
```

### Property 3: Invalid Log Rejection

_For any_ file with rawLineCount === 0 after parsing, the parser SHALL reject with an error indicating no valid events found.

**Validates: Requirements 1.4**

**Implementation:**

```typescript
if (summary.rawLineCount === 0) {
  reject(
    new Error(
      'No valid WoW combat log events found in the file. Please ensure it is a valid text log.'
    )
  );
  return;
}
```

### Property 4: Spell Category Classification

_For any_ parsed spell, the category SHALL be 'hostile' if the source GUID starts with 'Creature', 'Vehicle', or 'Boss', and 'friendly' if it starts with 'Player'.

**Validates: Requirements 7.4**

**Implementation:**

```typescript
const isEnemy =
  sourceGUID.startsWith('Creature') ||
  sourceGUID.startsWith('Vehicle') ||
  sourceGUID.startsWith('Boss');
const isPlayer = sourceGUID.startsWith('Player');

spellsMap.set(uniqueKey, {
  // ...
  category: isEnemy ? 'hostile' : 'friendly',
});
```

### Property 5: Spell Search Filter Accuracy

_For any_ search term, the filtered spells SHALL only include spells whose names contain the search term (case-insensitive).

**Validates: Requirements 2.5**

**Implementation:**

```typescript
const filterSpellsBySearch = (spells: SpellStats[], searchTerm: string): SpellStats[] => {
  if (!searchTerm) return spells;
  return spells.filter((spell) => spell.name.toLowerCase().includes(searchTerm.toLowerCase()));
};
```

### Property 6: Role Filter Accuracy

_For any_ role filter, the displayed spells SHALL only include spells classified for that role.

**Validates: Requirements 2.6**

**Implementation:**

```typescript
const getSpellsForRole = (
  role: Role,
  spells: SpellStats[],
  classifications: Record<string, SpellAIAnalysis>
): SpellStats[] => {
  return spells.filter((spell) => {
    if (spell.category !== 'hostile') return false;
    const analysis = classifications[spell.name];
    return analysis?.roles?.map((r) => r.toLowerCase()).includes(role.toLowerCase());
  });
};
```

### Property 7: Outgoing Spells Sort Order

_For any_ outgoing (friendly) spells view, the spells SHALL be sorted by totalDamage in descending order.

**Validates: Requirements 2.7**

**Implementation:**

```typescript
const sortOutgoingSpells = (spells: SpellStats[]): SpellStats[] => {
  return spells
    .filter((s) => s.category === 'friendly')
    .sort((a, b) => b.totalDamage - a.totalDamage);
};
```

### Property 8: Manual Reclassification Persistence

_For any_ manual role reclassification, the spell's classification SHALL be updated immediately in the local state.

**Validates: Requirements 2.4**

**Implementation:**

```typescript
const handleManualRoleChange = (spellName: string, newRole: Role) => {
  setClassifications((prev) => ({
    ...prev,
    [spellName]: {
      roles: [newRole],
      description: prev[spellName]?.description || 'Manually reclassified.',
    },
  }));
};
```

### Property 9: Timeline Dot Size Proportionality

_For any_ spell cast event on the timeline, the dot size SHALL be proportional to the spell's average damage relative to the maximum damage spell.

**Validates: Requirements 3.3**

**Implementation:**

```typescript
const calculateDotSize = (avgDamage: number, maxDamage: number): number => {
  const minSize = 8;
  const maxSize = 20;
  return Math.max(minSize, Math.min(maxSize, (avgDamage / maxDamage) * maxSize));
};
```

### Property 10: Tab State Based on Data

_For any_ data state, navigation tabs SHALL be enabled only when data is not null, except for the Upload tab which is always enabled.

**Validates: Requirements 6.1, 6.2**

**Implementation:**

```typescript
const isTabEnabled = (tab: Tab, data: LogSummary | null): boolean => {
  if (tab === Tab.UPLOAD) return true;
  return data !== null;
};
```

### Property 11: API Key Fallback Behavior

_For any_ AI service call when API key is not configured, the system SHALL return fallback data instead of failing.

**Validates: Requirements 2.3, 4.3, 5.5**

**Implementation:**

```typescript
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Usage in services:
const ai = getAI();
if (!ai) {
  return { markdown: '## No API Key\nPlease provide a Gemini API Key...', phases: [] };
}
```

### Property 12: Damage Aggregation Accuracy

_For any_ spell with multiple SPELL_DAMAGE events, totalDamage SHALL equal the sum of all damage amounts, and avgDamage SHALL equal totalDamage / count.

**Validates: Requirements 7.2**

**Implementation:**

```typescript
if (eventType === 'SPELL_DAMAGE') {
  const amount = parseInt(params[29]);
  if (!isNaN(amount)) {
    spell.totalDamage += amount;
    spell.avgDamage = Math.round(spell.totalDamage / spell.count);
  }
}
```

### Property 13: Unique Targets Tracking

_For any_ spell, the targets Set SHALL contain only unique target names from all events.

**Validates: Requirements 7.5**

**Implementation:**

```typescript
// Using Set automatically ensures uniqueness
if (destName) {
  spell.targets.add(destName); // Set.add() ignores duplicates
}
```

### Property 14: Encounter Name Extraction

_For any_ log with ENCOUNTER_START event, the encounterName SHALL be extracted from the event parameters.

**Validates: Requirements 7.1**

**Implementation:**

```typescript
if (eventType === 'ENCOUNTER_START') {
  encounterName = params[2]?.replace(/"/g, '') || 'Unknown';
  startTime = seconds;
}
```

### Property 15: Mini-Game Health Update

_For any_ damage event in the mini-game, the player's health SHALL decrease by the mechanic's damage value.

**Validates: Requirements 5.4**

**Implementation:**

```typescript
const applyDamage = (currentHealth: number, damage: number): number => {
  return Math.max(0, currentHealth - damage);
};
```

## Error Handling

### File Parsing Errors

```typescript
try {
  const summary = processLogText(text);
  if (summary.rawLineCount === 0) {
    reject(new Error('No valid WoW combat log events found...'));
    return;
  }
  resolve(summary);
} catch (e) {
  console.error('Parsing Error:', e);
  reject(new Error('An error occurred while parsing the log file.'));
}
```

### AI Service Errors

```typescript
try {
  const response = await ai.models.generateContent({...});
  return JSON.parse(response.text || '{}');
} catch (error) {
  console.error('Gemini Error:', error);
  return {}; // Return empty/fallback data
}
```

## Testing Strategy

### Property-Based Testing Library

**Library:** fast-check (TypeScript)

### Unit Tests

- Log parser with various input formats
- Spell filtering and sorting functions
- Damage calculation accuracy
- Category classification logic

### Property-Based Tests

Each correctness property will have a corresponding property-based test:

1. **Property 1 Test:** Generate random valid log text, verify parsing produces valid LogSummary
2. **Property 2 Test:** Test with empty file, verify rejection
3. **Property 3 Test:** Test with invalid content, verify rejection when rawLineCount === 0
4. **Property 4 Test:** Generate random GUIDs, verify category classification
5. **Property 5 Test:** Generate random spells and search terms, verify filter accuracy
6. **Property 6 Test:** Generate random spells with roles, verify role filter
7. **Property 7 Test:** Generate random friendly spells, verify sort order
8. **Property 8 Test:** Test manual reclassification, verify state update
9. **Property 9 Test:** Generate random damage values, verify dot size calculation
10. **Property 10 Test:** Test with null and non-null data, verify tab states
11. **Property 11 Test:** Test without API key, verify fallback behavior
12. **Property 12 Test:** Generate random damage events, verify aggregation
13. **Property 13 Test:** Generate events with duplicate targets, verify uniqueness
14. **Property 14 Test:** Generate logs with ENCOUNTER_START, verify name extraction
15. **Property 15 Test:** Generate damage events, verify health calculation

### Integration Tests

- Full file upload and parsing flow
- Tab navigation with loaded data
- AI service integration (with mocked responses)

## Performance Considerations

- FileReader for async file reading
- Set for O(1) target uniqueness
- Map for O(1) spell lookup during parsing
- Memoization for filtered/sorted spell lists
- Lazy loading for AI-dependent tabs

## Security Considerations

- API key stored in environment variables only
- File processing entirely client-side
- No server upload of log data
- Input validation on file type and size
