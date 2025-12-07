# Design Document - Guild Manager Module

## Overview

Guild Manager es un módulo React/TypeScript que proporciona gestión completa de guilds para World of Warcraft. La arquitectura sigue un patrón de componentes funcionales con Context API para estado global, integración con Gemini AI para análisis de rendimiento, y soporte completo de internacionalización.

**Module Location**: `modules/guild-manager/`
**Entry Point**: `modules/guild-manager/GuildManagerApp.tsx`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ AppProvider │ │LanguageProvider│ │ThemeProvider│              │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   HashRouter      │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   │ Header  │          │  Main   │          │ Footer  │
   └─────────┘          │ Routes  │          └─────────┘
                        └────┬────┘
                             │
    ┌────────┬────────┬──────┼──────┬────────┬────────┐
    │        │        │      │      │        │        │
┌───┴───┐┌───┴───┐┌───┴───┐┌─┴──┐┌──┴──┐┌────┴────┐┌──┴───┐
│Apply  ││Admin  ││Roster ││Cal ││Guild││Settings ││Perf  │
│Page   ││Page   ││Page   ││Page││Page ││Page     ││Analyz│
└───────┘└───────┘└───────┘└────┘└─────┘└─────────┘└──────┘
```

## Components and Interfaces

### Context Providers

```typescript
// AppContext - Estado global de la aplicación
interface AppContextType {
  applications: Application[];
  guilds: Guild[];
  authenticatedUser: AuthUser | null;
  notifications: Application[];
  roster: GuildMember[];
  events: GuildEvent[];
  addApplication: (app: Omit<Application, 'id' | 'status' | 'submissionDate' | 'isNew'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateApplication: (id: string, updatedApp: Application) => void;
  login: (roleType?: UserRole) => Promise<void>;
  logout: () => void;
  markNotificationsAsRead: () => void;
  updateGuildDetails: (guildId: string, updates: Partial<Guild>) => void;
  updateMemberNotes: (memberId: string, notes: string) => void;
  addEvent: (event: Omit<GuildEvent, 'id'>) => void;
  deleteEvent: (eventId: string) => void;
  linkDiscord: () => void;
}

// LanguageContext - Internacionalización
interface LanguageContextType {
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  t: (key: string) => string;
}

// ThemeContext - Tema visual
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

### Page Components

| Component               | Route           | Access               | Description               |
| ----------------------- | --------------- | -------------------- | ------------------------- |
| LoginPage               | /login          | Public               | Autenticación de usuarios |
| ApplyPage               | /apply/:id?     | Protected            | Formulario de aplicación  |
| AdminPage               | /admin          | Protected (Officer+) | Gestión de aplicaciones   |
| RosterPage              | /roster         | Protected            | Lista de miembros         |
| CalendarPage            | /calendar       | Protected            | Calendario de eventos     |
| GuildPage               | /guild          | Protected            | Dashboard de guild        |
| GuildSettingsPage       | /guild/settings | Protected (Officer+) | Configuración             |
| GuildPerksPage          | /perks          | Protected            | Beneficios de guild       |
| PerformanceAnalyzerPage | /analyzer       | Protected            | Análisis con IA           |

### Protected Route Component

```typescript
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const context = useContext(AppContext);
  if (!context?.authenticatedUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
```

## Data Models

### Core Types

```typescript
enum Role {
  TANK = 'Tank',
  HEALER = 'Healer',
  DPS = 'DPS',
}

enum ApplicationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

enum UserRole {
  ADMIN = 'Administrator',
  OFFICER = 'Officer',
  MEMBER = 'Member',
  USER = 'User',
}

interface Application {
  id: string;
  playerName: string;
  wowClass: string;
  wowSpec: string;
  itemLevel: number;
  raidExperience: string[];
  logsUrl: string;
  availability: string[];
  role: Role;
  reason: string;
  status: ApplicationStatus;
  submissionDate: Date;
  isNew: boolean;
  guildId: string;
  guildName: string;
  customAnswers?: Record<string, string>;
}

interface Guild {
  id: string;
  name: string;
  description?: string;
  officerEmail?: string;
  customQuestions?: CustomQuestion[];
  raidExperiences?: string[];
  availabilitySlots?: string[];
  perks?: GuildPerk[];
  warcraftLogsUrl?: string;
  wowProgressUrl?: string;
  announcements?: GuildAnnouncement[];
}

interface AuthUser {
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  guildId?: string | null;
  guildName?: string;
  discordId?: string;
}

interface GuildMember {
  id: string;
  name: string;
  wowClass: string;
  role: Role;
  rank: 'Guild Master' | 'Officer' | 'Raider' | 'Member';
  notes?: string;
}

interface GuildEvent {
  id: string;
  title: string;
  date: Date;
  type: 'Raid' | 'Mythic+' | 'PvP' | 'Social';
  description?: string;
  guildId: string;
}

interface AnalysisResult {
  summary: {
    averageDps: number;
    peakDps: number;
    primaryAbilityUptimePercent: number;
    primaryAbilityName: string;
  };
  commonErrors: string[];
  comparison: {
    percentile: number;
    comment: string;
  };
  chartsData: {
    abilityUsage: { abilityName: string; casts: number }[];
    downtimePercent: number;
  };
  recommendations: {
    spellIconUrl: string;
    suggestion: string;
  }[];
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Class-Spec Consistency

_For any_ WoW class selection, the specializations shown in the dropdown SHALL only contain valid specs defined for that class in WOW_CLASSES constant.

**Validates: Requirements 1.2**

**Implementation:**

```typescript
// Given a class name, specs must match WOW_CLASSES definition
const validateClassSpecs = (className: string, displayedSpecs: string[]): boolean => {
  const classData = WOW_CLASSES.find((c) => c.name === className);
  if (!classData) return false;
  const validSpecs = classData.specs.map((s) => s.name);
  return displayedSpecs.every((spec) => validSpecs.includes(spec));
};
```

### Property 2: Application Validation Completeness

_For any_ application submission with invalid data (empty required fields, logsUrl not starting with 'https://www.warcraftlogs.com/', itemLevel < 450), the system SHALL reject the submission and display appropriate error messages.

**Validates: Requirements 1.4**

**Implementation:**

```typescript
const validateApplication = (formData: ApplicationFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  if (!formData.guildId) errors.guildId = 'validation_guild';
  if (!formData.playerName) errors.playerName = 'validation_playerName';
  if (!formData.wowClass) errors.wowClass = 'validation_class';
  if (!formData.wowSpec) errors.wowSpec = 'validation_spec';
  if (!formData.itemLevel || +formData.itemLevel < 450) errors.itemLevel = 'validation_itemLevel';
  if (!formData.logsUrl.startsWith('https://www.warcraftlogs.com/')) {
    errors.logsUrl = 'validation_logsUrl';
  }
  if (formData.availability.length === 0) errors.availability = 'validation_availability';
  if (formData.reason.length < 10) errors.reason = 'validation_reason';
  return { isValid: Object.keys(errors).length === 0, errors };
};
```

### Property 3: Application Filter Accuracy

_For any_ filter combination (class, role, status, raidExperience, availability), the filtered applications list SHALL only contain applications that match ALL specified filter criteria.

**Validates: Requirements 2.2**

**Implementation:**

```typescript
const filterApplications = (apps: Application[], filters: Filters): Application[] => {
  return apps.filter((app) => {
    return (
      (filters.class ? app.wowClass === filters.class : true) &&
      (filters.role ? app.role === filters.role : true) &&
      (filters.status ? app.status === filters.status : true) &&
      (filters.raidExperience ? app.raidExperience.includes(filters.raidExperience) : true) &&
      (filters.availability ? app.availability.includes(filters.availability) : true)
    );
  });
};
```

### Property 4: Application Sort Consistency

_For any_ sort configuration (by date or playerName, ascending or descending), the applications list SHALL be ordered according to the specified criteria.

**Validates: Requirements 2.3**

**Implementation:**

```typescript
const sortApplications = (apps: Application[], sortConfig: SortConfig): Application[] => {
  return [...apps].sort((a, b) => {
    if (sortConfig.key === 'playerName') {
      return sortConfig.direction === 'asc'
        ? a.playerName.localeCompare(b.playerName)
        : b.playerName.localeCompare(a.playerName);
    }
    return sortConfig.direction === 'asc'
      ? a.submissionDate.getTime() - b.submissionDate.getTime()
      : b.submissionDate.getTime() - a.submissionDate.getTime();
  });
};
```

### Property 5: Roster Search Accuracy

_For any_ search term, the filtered roster SHALL only contain members whose names include the search term (case-insensitive).

**Validates: Requirements 3.2**

**Implementation:**

```typescript
const searchRoster = (members: GuildMember[], searchTerm: string): GuildMember[] => {
  if (!searchTerm) return members;
  return members.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
};
```

### Property 6: Roster Sort with Secondary Key

_For any_ sort configuration, the roster SHALL be sorted by the primary key with secondary sort by name when primary keys are equal.

**Validates: Requirements 3.3**

**Implementation:**

```typescript
const sortRoster = (members: GuildMember[], sortConfig: SortConfig): GuildMember[] => {
  return [...members].sort((a, b) => {
    let comparison = 0;
    if (sortConfig.key === 'rank') {
      comparison = rankOrder[a.rank] - rankOrder[b.rank];
    } else {
      comparison = String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]));
    }
    if (sortConfig.direction === 'desc') comparison *= -1;
    // Secondary sort by name
    if (comparison === 0) {
      comparison = a.name.localeCompare(b.name);
    }
    return comparison;
  });
};
```

### Property 7: Role-Based Access Control

_For any_ user role, access to features SHALL be restricted according to the role hierarchy: Administrator > Officer > Member > User.

**Validates: Requirements 3.4, 5.2, 7.3**

**Implementation:**

```typescript
const canAccessFeature = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    [UserRole.ADMIN]: 4,
    [UserRole.OFFICER]: 3,
    [UserRole.MEMBER]: 2,
    [UserRole.USER]: 1,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Usage examples:
// canViewNotes: canAccessFeature(user.role, UserRole.OFFICER)
// canEditGuildName: user.role === UserRole.ADMIN
// canAddEvents: canAccessFeature(user.role, UserRole.OFFICER)
```

### Property 8: Calendar Event Month Filtering

_For any_ month navigation, the displayed events SHALL only include events whose date falls within the selected month and year, and belong to the user's guild.

**Validates: Requirements 4.2**

**Implementation:**

```typescript
const filterEventsByMonth = (
  events: GuildEvent[],
  month: number,
  year: number,
  guildId: string
): GuildEvent[] => {
  return events.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year && e.guildId === guildId;
  });
};
```

### Property 9: List Management Consistency

_For any_ add or remove operation on guild configuration lists (customQuestions, raidExperiences, availabilitySlots, perks), the list SHALL reflect the change immediately and maintain data integrity.

**Validates: Requirements 5.3, 5.4, 5.5**

**Implementation:**

```typescript
// Add item to list (no duplicates for string lists)
const addToList = <T>(list: T[], item: T, isDuplicate?: (a: T, b: T) => boolean): T[] => {
  const checkDuplicate = isDuplicate || ((a, b) => a === b);
  if (list.some((existing) => checkDuplicate(existing, item))) {
    return list;
  }
  return [...list, item];
};

// Remove item from list
const removeFromList = <T>(list: T[], predicate: (item: T) => boolean): T[] => {
  return list.filter((item) => !predicate(item));
};
```

### Property 10: AI Analysis Result Completeness

_For any_ successful AI analysis, the result SHALL contain all required fields: summary (averageDps, peakDps, primaryAbilityUptimePercent, primaryAbilityName), commonErrors array, comparison object, chartsData, and recommendations array.

**Validates: Requirements 6.3, 6.4, 6.5**

**Implementation:**

```typescript
const validateAnalysisResult = (result: AnalysisResult): boolean => {
  return (
    result.summary !== undefined &&
    typeof result.summary.averageDps === 'number' &&
    typeof result.summary.peakDps === 'number' &&
    typeof result.summary.primaryAbilityUptimePercent === 'number' &&
    typeof result.summary.primaryAbilityName === 'string' &&
    Array.isArray(result.commonErrors) &&
    result.comparison !== undefined &&
    typeof result.comparison.percentile === 'number' &&
    result.chartsData !== undefined &&
    Array.isArray(result.chartsData.abilityUsage) &&
    Array.isArray(result.recommendations)
  );
};
```

### Property 11: AI Error Handling

_For any_ AI service failure, the system SHALL display a localized error message and not crash or show raw error data.

**Validates: Requirements 6.6**

**Implementation:**

```typescript
const handleAIError = (error: Error, language: 'en' | 'es'): string => {
  console.error('Error calling Gemini API:', error);
  return language === 'es' ? es.analyzer_error_gemini : en.analyzer_error_gemini;
};
```

### Property 12: Guild Dashboard Conditional Rendering

_For any_ user, the guild dashboard SHALL display appropriate content based on guild membership: no-guild message for users without guildId, full dashboard for guild members.

**Validates: Requirements 7.1, 7.2**

**Implementation:**

```typescript
const getGuildDashboardView = (user: AuthUser | null): 'login' | 'no-guild' | 'dashboard' => {
  if (!user) return 'login';
  if (!user.guildId) return 'no-guild';
  return 'dashboard';
};
```

### Property 13: Route Protection

_For any_ protected route access without authentication, the system SHALL redirect to the login page.

**Validates: Requirements 8.1**

**Implementation:**

```typescript
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const context = useContext(AppContext);
  if (!context?.authenticatedUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
```

### Property 14: Theme Persistence Round Trip

_For any_ theme change, the preference SHALL be persisted to localStorage and restored on application reload.

**Validates: Requirements 9.2, 9.3**

**Implementation:**

```typescript
// Save theme
const saveTheme = (theme: Theme): void => {
  localStorage.setItem('theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Load theme
const loadTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme') as Theme;
  const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return savedTheme || (userPrefersDark ? 'dark' : 'light');
};

// Round trip property: loadTheme() after saveTheme(theme) === theme
```

### Property 15: Translation Completeness

_For any_ language switch, all UI text keys SHALL have corresponding translations in the selected language.

**Validates: Requirements 9.1**

**Implementation:**

```typescript
const t = (key: string): string => {
  const translations = language === 'es' ? es : en;
  return translations[key] || key; // Fallback to key if translation missing
};

// Property: For all keys used in UI, t(key) !== key (translation exists)
```

### Property 16: Guild Perks Conditional Display

_For any_ guild with configured perks, those perks SHALL be displayed instead of default perks, with an exclusivity badge.

**Validates: Requirements 10.1, 10.2**

**Implementation:**

```typescript
const getPerksToDisplay = (
  guild: Guild | undefined,
  defaultPerks: GuildPerk[]
): { perks: GuildPerk[]; isExclusive: boolean } => {
  const hasDynamicPerks = guild?.perks && guild.perks.length > 0;
  return {
    perks: hasDynamicPerks ? guild.perks! : defaultPerks,
    isExclusive: hasDynamicPerks,
  };
};
```

## Error Handling

### API Errors

```typescript
// Gemini API error handling with retry simulation
try {
  const response = await ai.models.generateContent({...});
  return JSON.parse(response.text.trim()) as AnalysisResult;
} catch (error) {
  console.error("Error calling Gemini API:", error);
  throw new Error(language === 'es' ? es.analyzer_error_gemini : en.analyzer_error_gemini);
}
```

### Authentication Errors

```typescript
// Login with simulated failure rate
const login = async (roleType: UserRole = UserRole.ADMIN) => {
  return new Promise<void>((resolve, reject) => {
    const shouldFail = Math.random() < 0.1; // 10% failure rate
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Battle.net API connection timeout. Please try again.'));
        return;
      }
      // ... successful login
      resolve();
    }, 1500);
  });
};
```

### Form Validation Errors

- Real-time validation on blur
- Error messages displayed below fields
- Submit blocked until all validations pass

## Testing Strategy

### Property-Based Testing Library

**Library:** fast-check (TypeScript)

### Unit Tests

- Component rendering tests
- Form validation logic
- Filter and sort functions
- Role-based access control

### Property-Based Tests

Each correctness property will have a corresponding property-based test:

1. **Property 1 Test:** Generate random class names, verify specs match WOW_CLASSES
2. **Property 2 Test:** Generate random invalid form data, verify rejection
3. **Property 3 Test:** Generate random applications and filters, verify filter accuracy
4. **Property 4 Test:** Generate random applications, verify sort order
5. **Property 5 Test:** Generate random roster and search terms, verify search accuracy
6. **Property 6 Test:** Generate random roster, verify sort with secondary key
7. **Property 7 Test:** Generate random user roles and features, verify access control
8. **Property 8 Test:** Generate random events and dates, verify month filtering
9. **Property 9 Test:** Generate random list operations, verify consistency
10. **Property 10 Test:** Generate random analysis results, verify completeness
11. **Property 11 Test:** Simulate API failures, verify error handling
12. **Property 12 Test:** Generate random user states, verify dashboard view
13. **Property 13 Test:** Test route access without auth, verify redirect
14. **Property 14 Test:** Generate random themes, verify round trip persistence
15. **Property 15 Test:** Generate random translation keys, verify translations exist
16. **Property 16 Test:** Generate random guild configs, verify perks display

### Integration Tests

- Full application flow tests
- Context provider integration
- Router navigation tests

## Performance Considerations

- Memoization with useMemo for filtered/sorted lists
- useCallback for event handlers
- Lazy loading for heavy components (charts)
- Debounced search input

## Security Considerations

- API keys stored in environment variables
- Input validation on all forms
- XSS prevention through React's default escaping
- Role-based access control on all protected features
