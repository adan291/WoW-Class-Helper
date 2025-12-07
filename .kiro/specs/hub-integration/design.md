# Design Document - Hub Integration

## Overview

Hub Integration conecta los 3 módulos principales (Class Helper, Log Analyzer, Guild Manager) en una página central. Utiliza React Router para navegación y React.lazy para carga diferida de módulos.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AppRouter.tsx                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    BrowserRouter                         │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                   Routes                         │    │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│    │   │
│  │  │  │   /     │ │/class-  │ │/log-    │ │/guild- ││    │   │
│  │  │  │ HubPage │ │helper   │ │analyzer │ │manager ││    │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └────────┘│    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   │ Class   │          │  Log    │          │ Guild   │
   │ Helper  │          │Analyzer │          │ Manager │
   │ Module  │          │ Module  │          │ Module  │
   └─────────┘          └─────────┘          └─────────┘
```

## Components and Interfaces

### Tool Card Configuration

```typescript
interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  features: string[];
}

const TOOLS: ToolCard[] = [
  {
    id: 'class-helper',
    title: 'Class Helper',
    description: 'AI-powered class guides...',
    icon: '⚔️',
    path: '/class-helper',
    color: '#FFD700',
    features: ['Class Guides', 'Talent Builds', 'Rotation Tips', 'Dungeon Strategies'],
  },
  {
    id: 'log-analyzer',
    title: 'Log Analyzer',
    description: 'Upload combat logs...',
    icon: '📊',
    path: '/log-analyzer',
    color: '#F97316',
    features: ['Combat Log Parsing', 'AI Strategy', 'Timeline View', 'Practice Mode'],
  },
  {
    id: 'guild-manager',
    title: 'Guild Manager',
    description: 'Manage guild applications, roster, events, and performance analysis.',
    icon: '🏰',
    path: '/guild-manager',
    color: '#8B5CF6',
    features: ['Applications', 'Roster', 'Calendar', 'Performance Analyzer'],
  },
];
```

### Lazy Loading Setup

```typescript
// Lazy load modules
const ClassHelperApp = lazy(() => import('./modules/class-helper/ClassHelperApp'));
const LogAnalyzerApp = lazy(() => import('./modules/log-analyzer/LogAnalyzerApp'));
const GuildManagerApp = lazy(() => import('./modules/guild-manager/GuildManagerApp'));

// Loading fallback
const ModuleLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-yellow-500 font-medium">Loading module...</p>
    </div>
  </div>
);
```

## Data Models

### Route Configuration

```typescript
interface ModuleRoute {
  path: string;
  component: React.LazyExoticComponent<React.FC>;
  requireAuth: boolean;
}

const MODULE_ROUTES: ModuleRoute[] = [
  { path: '/class-helper', component: ClassHelperApp, requireAuth: false },
  { path: '/log-analyzer', component: LogAnalyzerApp, requireAuth: false },
  { path: '/guild-manager', component: GuildManagerApp, requireAuth: false },
];
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Tool Cards Count

_For any_ Hub page render, the number of displayed tool cards SHALL equal the length of the TOOLS array (currently 3).

**Validates: Requirements 1.1**

**Implementation:**

```typescript
const TOOLS: ToolCard[] = [...]; // 3 items

// In HubPage component
{TOOLS.map((tool) => (
  <ToolCardComponent key={tool.id} tool={tool} />
))}

// Property: rendered cards count === TOOLS.length
```

### Property 2: Tool Card Data Completeness

_For any_ tool in the TOOLS array, all required fields (id, title, description, icon, path, color, features) SHALL be defined and non-empty.

**Validates: Requirements 1.2**

**Implementation:**

```typescript
const isToolCardComplete = (tool: ToolCard): boolean => {
  return (
    tool.id.length > 0 &&
    tool.title.length > 0 &&
    tool.description.length > 0 &&
    tool.icon.length > 0 &&
    tool.path.length > 0 &&
    tool.color.length > 0 &&
    tool.features.length > 0
  );
};

// Property: TOOLS.every(isToolCardComplete) === true
```

### Property 3: Tool Card Navigation Accuracy

_For any_ tool card click, the navigation SHALL go to the path specified in that tool's configuration.

**Validates: Requirements 1.4, 2.1**

**Implementation:**

```typescript
// Each tool card is a Link component
<Link to={tool.path}>
  {/* card content */}
</Link>

// Property: clicking tool with path X navigates to X
```

### Property 4: Hub Link Presence in Modules

_For any_ module (Class Helper, Log Analyzer, Guild Manager), there SHALL exist a navigation element that links back to the Hub (/).

**Validates: Requirements 4.1**

**Implementation:**

```typescript
// In each module's header/nav
<Link to="/">
  🏠 Hub
</Link>

// Property: each module contains Link with to="/"
```

## Error Handling

### Module Loading Errors

```typescript
<ErrorBoundary fallback={<ModuleErrorFallback />}>
  <Suspense fallback={<ModuleLoader />}>
    <Routes>
      {/* module routes */}
    </Routes>
  </Suspense>
</ErrorBoundary>
```

## Testing Strategy

### Property-Based Testing Library

**Library:** fast-check (TypeScript)

### Unit Tests

- Tool card rendering
- Navigation routing
- Lazy loading behavior

### Property-Based Tests

1. **Property 1 Test:** Verify TOOLS.length === 3
2. **Property 2 Test:** Verify all tools have complete data
3. **Property 3 Test:** Verify tool paths match routes
4. **Property 4 Test:** Verify Hub links exist in modules

### Integration Tests

- Full navigation flow between Hub and modules
- Lazy loading with Suspense

## Performance Considerations

- React.lazy for code splitting
- Suspense for loading states
- Minimal Hub page bundle size
