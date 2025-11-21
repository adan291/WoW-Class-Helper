# 🏗️ Recomendaciones de Arquitectura

## Estado Actual

El proyecto tiene una arquitectura limpia y enfocada después de la limpieza:

```
App (Root)
├── AppProviders (Context providers)
│   ├── AuthContext
│   └── Otros contextos
├── ClassSelection (Selección inicial)
└── ClassHub (Hub principal)
    ├── Tabs (Overview, Specs, etc)
    ├── AdminPanel (Configuración)
    └── GuideSection (Contenido generado)
```

---

## Recomendaciones de Mejora

### 1. Estructura de Carpetas

**Actual:**
```
components/
services/
contexts/
styles/
```

**Recomendado:**
```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── features/        # Componentes por feature
│   │   ├── ClassHub/
│   │   ├── AdminPanel/
│   │   └── Search/
│   └── layout/          # Layout components
├── services/
│   ├── api/             # Servicios de API
│   ├── cache/           # Servicios de caché
│   ├── utils/           # Utilidades
│   └── mock/            # Datos mock
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── types/               # Type definitions
├── styles/              # Global styles
├── utils/               # Utilidades generales
└── constants/           # Constantes
```

**Beneficios:**
- Mejor organización
- Más fácil de navegar
- Escalable para nuevas features

---

### 2. Patrones de Componentes

#### Componentes Funcionales
```typescript
// ✅ Recomendado
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return <div>{title}</div>;
};

export default React.memo(MyComponent);
```

#### Hooks Personalizados
```typescript
// ✅ Recomendado para lógica reutilizable
export const useClassData = (classId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lógica aquí
  }, [classId]);

  return { data, loading, error };
};
```

---

### 3. Gestión de Estado

**Actual:**
- useState para estado local
- AuthContext para autenticación
- Props drilling en algunos lugares

**Recomendado:**
```typescript
// Usar contexto para estado compartido
interface AppContextType {
  selectedClass: WowClass | null;
  userRole: UserRole;
  theme: Theme;
  // ...
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

**Beneficios:**
- Menos prop drilling
- Estado centralizado
- Más fácil de testear

---

### 4. Servicios

**Patrón Singleton:**
```typescript
// ✅ Recomendado
class CacheService {
  private static instance: CacheService;
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: any) {
    this.cache.set(key, value);
  }
}

export const cacheService = CacheService.getInstance();
```

**Beneficios:**
- Una única instancia
- Fácil de testear
- Patrón conocido

---

### 5. Manejo de Errores

**Recomendado:**
```typescript
// Crear clase de error personalizada
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usar en servicios
export async function fetchGuide(classId: string) {
  try {
    const response = await geminiService.generateGuide(classId);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      // Manejar error de API
      console.error(`API Error: ${error.statusCode} - ${error.message}`);
    } else {
      // Manejar otro tipo de error
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
```

**Beneficios:**
- Errores tipados
- Mejor debugging
- Manejo consistente

---

### 6. Testing

**Estructura recomendada:**
```
__tests__/
├── unit/
│   ├── services/
│   │   ├── geminiService.test.ts
│   │   ├── cacheService.test.ts
│   │   └── ...
│   └── utils/
├── integration/
│   ├── ClassHub.test.tsx
│   └── ...
└── e2e/
    └── user-flow.test.ts
```

**Ejemplo de test:**
```typescript
describe('cacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('should cache values', () => {
    cacheService.set('key', 'value');
    expect(cacheService.get('key')).toBe('value');
  });

  it('should return null for missing keys', () => {
    expect(cacheService.get('missing')).toBeNull();
  });
});
```

---

### 7. Validación

**Recomendado:**
```typescript
// Crear validadores reutilizables
export const validators = {
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isValidClassId: (id: string): boolean => {
    return WOW_CLASSES.some(c => c.id === id);
  },

  isValidUserRole: (role: string): boolean => {
    return ['user', 'master', 'admin'].includes(role);
  }
};

// Usar en componentes
const handleUrlChange = (url: string) => {
  if (!validators.isValidUrl(url)) {
    setError('Invalid URL');
    return;
  }
  // Procesar URL
};
```

---

### 8. Constantes

**Recomendado:**
```typescript
// constants.ts
export const API_CONFIG = {
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const CACHE_CONFIG = {
  MAX_SIZE: 100,
  TTL: 3600000, // 1 hora
} as const;

export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
} as const;
```

**Beneficios:**
- Valores centralizados
- Fácil de cambiar
- Type-safe

---

### 9. Tipos

**Recomendado:**
```typescript
// types.ts
export interface WowClass {
  id: string;
  name: string;
  color: string;
  specs: Specialization[];
}

export interface Specialization {
  id: string;
  name: string;
  role: Role;
}

export type Role = 'Tank' | 'Healer' | 'Damage';
export type UserRole = 'user' | 'master' | 'admin';

// Tipos de utilidad
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T | null>;
```

---

### 10. Performance

**Recomendaciones:**
```typescript
// 1. Usar React.memo para componentes puros
export const ClassCard = React.memo(({ wowClass }: Props) => {
  return <div>{wowClass.name}</div>;
});

// 2. Usar useCallback para event handlers
const handleClick = useCallback(() => {
  // Lógica
}, [dependencies]);

// 3. Usar useMemo para cálculos costosos
const filteredClasses = useMemo(() => {
  return classes.filter(c => c.role === selectedRole);
}, [classes, selectedRole]);

// 4. Lazy load componentes
const AdminPanel = lazy(() => import('./AdminPanel'));

// 5. Code splitting por ruta
const ClassHub = lazy(() => import('./ClassHub'));
```

---

### 11. Logging

**Recomendado:**
```typescript
// services/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },

  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

---

### 12. Configuración

**Recomendado:**
```typescript
// config.ts
export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '5000'),
  },
  cache: {
    enabled: process.env.REACT_APP_CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.REACT_APP_CACHE_TTL || '3600000'),
  },
  features: {
    adminPanel: process.env.REACT_APP_ADMIN_PANEL === 'true',
    analytics: process.env.REACT_APP_ANALYTICS === 'true',
  }
} as const;
```

---

## Checklist de Implementación

- [ ] Reorganizar estructura de carpetas
- [ ] Crear custom hooks reutilizables
- [ ] Implementar contexto centralizado
- [ ] Mejorar manejo de errores
- [ ] Agregar validadores
- [ ] Crear logger centralizado
- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración
- [ ] Documentar patrones
- [ ] Revisar performance

---

## Beneficios Esperados

- ✅ Código más mantenible
- ✅ Mejor escalabilidad
- ✅ Más fácil de testear
- ✅ Mejor performance
- ✅ Menos bugs
- ✅ Mejor experiencia de desarrollo

---

## Referencias

- [React Best Practices](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Code](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Design Patterns](https://refactoring.guru/design-patterns)
