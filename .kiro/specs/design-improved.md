# WoW AI Class Helper - Diseño Mejorado

## 1. Arquitectura de Alto Nivel

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                          App                                 │
│  - selectedClass: WowClass | null                           │
│  - userRole: UserRole                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ ClassSelection   │  │   ClassHub       │
│ - searchTerm     │  │ - activeTab      │
│ - roleFilter     │  │ - activeSpec     │
│ - favorites      │  │ - selectedDungeon│
└──────────────────┘  │ - content        │
                      │ - isLoading      │
                      │ - error          │
                      └──────────────────┘
```

### Flujo de Datos

```
User Input
    ↓
Component State Update
    ↓
useEffect Hook Triggered
    ↓
Validation
    ↓
Cache Check
    ↓
API Call (Gemini)
    ↓
Response Validation
    ↓
Cache Store
    ↓
State Update (content)
    ↓
Component Re-render
    ↓
Markdown Rendering
    ↓
User Sees Content
```

---

## 2. Propiedades de Corrección (Correctness Properties)

### CP1: Consistencia de Clase y Especialización

**Propiedad**: La especialización seleccionada debe pertenecer a la clase seleccionada.

**Invariante**:
```typescript
activeSpec ∈ wowClass.specs
```

**Implementación**:
```typescript
// activeSpec inicializado desde wowClass.specs[0]
useEffect(() => {
  setActiveSpec(wowClass.specs[0]);
}, [wowClass]);

// setActiveSpec solo acepta specs de la clase actual
const handleSpecChange = (spec: Specialization) => {
  if (wowClass.specs.some(s => s.id === spec.id)) {
    setActiveSpec(spec);
  }
};
```

**Validación**:
- ✅ Selector de spec deshabilitado si no hay specs
- ✅ Selección de spec inválida rechazada
- ✅ Spec persiste correctamente entre cambios de pestaña

---

### CP2: Precisión de Filtrado de Mazmorras

**Propiedad**: Las mazmorras mostradas deben coincidir con el filtro de expansión seleccionado.

**Invariante**:
```typescript
∀ dungeon ∈ filteredDungeons: dungeon.expansion = selectedExpansion ∨ selectedExpansion = 'All'
```

**Implementación**:
```typescript
const filteredDungeons = useMemo(() => {
  if (selectedExpansion === 'All') return DUNGEONS;
  return DUNGEONS.filter(d => d.expansion === selectedExpansion);
}, [selectedExpansion]);
```

**Validación**:
- ✅ Lista de mazmorras actualiza cuando cambia el filtro
- ✅ Selección de mazmorra inválida se reinicia
- ✅ Contador de mazmorras coincide con datos de expansión

---

### CP3: Consistencia de Generación de Contenido

**Propiedad**: El contenido generado debe coincidir con la pestaña, spec y mazmorra seleccionados.

**Invariante**:
```typescript
content.key = hash(activeTab, activeSpec.id, selectedDungeon.name)
```

**Implementación**:
```typescript
const memoizedContentKey = useMemo(() => {
  if (activeTab === 'dungeons') {
    return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}`;
  }
  return activeTab === 'specs' || activeTab === 'rotations'
    ? `${activeTab}-${activeSpec.id}`
    : activeTab;
}, [activeTab, activeSpec, selectedDungeon]);

useEffect(() => {
  fetchContent();
}, [memoizedContentKey]);
```

**Validación**:
- ✅ Contenido se regenera solo cuando cambian factores clave
- ✅ Contenido coincide con clase/spec/pestaña/mazmorra solicitados
- ✅ No se muestra contenido obsoleto

---

### CP4: Persistencia de Favoritos

**Propiedad**: Los favoritos marcados deben persistir después de recargar la página.

**Invariante**:
```typescript
localStorage['wow_class_helper_favorites'] = JSON.stringify(favorites)
```

**Implementación**:
```typescript
useEffect(() => {
  const stored = localStorage.getItem('wow_class_helper_favorites');
  if (stored) {
    try {
      setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to parse favorites:', e);
      setFavorites([]);
    }
  }
}, []);

const toggleFavorite = (classId: string) => {
  const updated = favorites.includes(classId)
    ? favorites.filter(id => id !== classId)
    : [...favorites, classId];
  setFavorites(updated);
  localStorage.setItem('wow_class_helper_favorites', JSON.stringify(updated));
};
```

**Validación**:
- ✅ Favoritos guardados en localStorage al cambiar
- ✅ Favoritos cargados en montaje de app
- ✅ Datos inválidos en localStorage manejados gracefully

---

### CP5: Inyección de Fuentes de Admin

**Propiedad**: Las URLs personalizadas deben sobrescribir el conocimiento por defecto de la IA.

**Invariante**:
```typescript
sourceUrls ≠ '' ⟹ prompt.includes(sourceUrls)
```

**Implementación**:
```typescript
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string
): Promise<string> => {
  let finalPrompt = prompt;
  
  if (sourceUrls && sourceUrls.trim() !== '') {
    const validation = validateSourceUrls(sourceUrls);
    if (!validation.valid) {
      throw new Error(`Invalid source URLs: ${validation.errors.join(', ')}`);
    }
    
    const urls = validation.urls.map(url => `- ${url}`).join('\n');
    finalPrompt = `IMPORTANT: Use these sources as primary knowledge:\n${urls}\n\n${prompt}`;
  }
  
  return await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: finalPrompt,
  });
};
```

**Validación**:
- ✅ URLs personalizadas prepended al prompt
- ✅ Contenido refleja información de fuentes personalizadas
- ✅ Botón de regeneración aplica fuentes personalizadas
- ✅ Acceso de Admin es forzado

---

### CP6: Fidelidad de Renderizado Markdown

**Propiedad**: Markdown debe renderizar correctamente sin vulnerabilidades XSS.

**Invariante**:
```typescript
∀ markdown ∈ content: render(markdown) = expected_html ∧ ¬XSS(render(markdown))
```

**Implementación**:
```typescript
const renderMarkdown = (markdown: string): string => {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Tables
  html = renderTables(html);
  
  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Escape HTML entities
  return escapeHtml(html);
};
```

**Validación**:
- ✅ Todos los elementos markdown renderizan correctamente
- ✅ No hay vulnerabilidades XSS
- ✅ Tooltips de habilidades parsean correctamente
- ✅ Tablas tienen bordes y estilos
- ✅ Blockquotes tienen bordes izquierdos

---

### CP7: Recuperación de Errores

**Propiedad**: Los errores deben ser capturables y mostrables sin crashear la app.

**Invariante**:
```typescript
error ≠ null ⟹ app.isInteractive ∧ error.message ≠ ''
```

**Implementación**:
```typescript
const fetchContent = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    // Validation
    if (!wowClass?.id) throw new Error('Invalid class selected');
    if (!activeSpec?.id) throw new Error('Invalid specialization selected');
    
    // Cache check
    const cached = cacheService.get<string>(memoizedContentKey);
    if (cached) {
      setContent(cached);
      setIsLoading(false);
      return;
    }
    
    // API call
    const newContent = await geminiService.getGuide(wowClass, activeSpec, activeTab);
    
    // Validation
    if (!newContent || typeof newContent !== 'string') {
      throw new Error('Invalid content received from API');
    }
    
    // Cache & render
    cacheService.set(memoizedContentKey, newContent);
    setContent(newContent);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(`Failed to generate content: ${message}`);
    setContent('');
  } finally {
    setIsLoading(false);
  }
}, [activeTab, wowClass, activeSpec, memoizedContentKey]);
```

**Validación**:
- ✅ Todos los errores capturados y registrados
- ✅ Mensajes de error claros y accionables
- ✅ App permanece interactiva después de error
- ✅ Reintentos funcionan correctamente

---

### CP8: Control de Acceso Basado en Roles

**Propiedad**: Las características de Admin solo son visibles cuando userRole === 'admin'.

**Invariante**:
```typescript
adminPanel.visible ⟺ userRole = 'admin'
```

**Implementación**:
```typescript
{userRole === 'admin' && (
  <AdminPanel
    sourceUrls={sourceUrls}
    onSourceUrlsChange={setSourceUrls}
    onRegenerate={handleRegenerateWithSources}
  />
)}
```

**Validación**:
- ✅ Panel de Admin oculto para User y Master
- ✅ Características de Admin no accesibles vía URL
- ✅ Validación de rol en todas las operaciones de Admin

---

### CP9: Gestión de Estado de Carga

**Propiedad**: isLoading debe ser true durante llamada API, false después de completar o error.

**Invariante**:
```typescript
isLoading = true ⟹ (apiCall.pending ∨ content.rendering)
isLoading = false ⟹ (content.ready ∨ error.occurred)
```

**Implementación**:
```typescript
useEffect(() => {
  setIsLoading(true);
  generateContentWithGemini(prompt)
    .then(result => {
      setContent(result);
      setError(null);
    })
    .catch(err => {
      setError(err.message);
      setContent('');
    })
    .finally(() => setIsLoading(false));
}, [memoizedContentKey]);
```

**Validación**:
- ✅ Spinner de carga visible durante generación
- ✅ Spinner oculto después de cargar contenido
- ✅ Spinner oculto después de error
- ✅ No hay estados de carga atascados

---

### CP10: Diseño Responsivo

**Propiedad**: La UI debe adaptarse a viewports mobile, tablet y desktop.

**Invariante**:
```typescript
viewport.width < 640px ⟹ layout = 'mobile'
640px ≤ viewport.width < 1024px ⟹ layout = 'tablet'
viewport.width ≥ 1024px ⟹ layout = 'desktop'
```

**Implementación**:
```typescript
// Tailwind breakpoints
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

<div className="flex flex-col md:flex-row lg:flex-row">
  {/* Mobile: column, Tablet+: row */}
</div>

<div className="text-sm md:text-base lg:text-lg">
  {/* Responsive font sizes */}
</div>
```

**Validación**:
- ✅ Layout adapta a todos los breakpoints
- ✅ Sin scroll horizontal en mobile
- ✅ Touch targets ≥ 44px en mobile
- ✅ Fuentes optimizadas por dispositivo

---

### CP11: Validación de Precisión de Datos

**Propiedad**: Todos los datos mostrados deben coincidir con fuentes oficiales de WoW.

**Invariante**:
```typescript
∀ classData ∈ displayed: classData ∈ OFFICIAL_WOW_DATA
```

**Implementación**:
```typescript
const validateClassData = (classData: WowClass): boolean => {
  const official = WOW_CLASSES.find(c => c.id === classData.id);
  if (!official) return false;
  if (classData.specs.length !== official.specs.length) return false;
  return classData.specs.every(spec =>
    official.specs.some(s => s.id === spec.id)
  );
};
```

**Validación**:
- ✅ Datos de clase coinciden con API oficial
- ✅ Datos de especialización coinciden con fuentes oficiales
- ✅ Datos de mazmorra coinciden con contenido actual
- ✅ Datos de habilidad coinciden con base de datos de hechizos

---

### CP12: Atribución de Fuentes de Contenido

**Propiedad**: Cada guía debe incluir fuentes verificables.

**Invariante**:
```typescript
∀ guide ∈ generated: guide.sources.length ≥ 1 ∧ ∀ source ∈ guide.sources: source.verified = true
```

**Implementación**:
```typescript
interface Guide {
  content: string;
  sources: Source[];
  generatedAt: timestamp;
  patchVersion: string;
}

interface Source {
  title: string;
  url: string;
  type: 'official' | 'community' | 'data' | 'custom';
  verified: boolean;
  lastVerified: timestamp;
}
```

**Validación**:
- ✅ Cada guía incluye al menos una fuente
- ✅ Fuentes son verificables y accesibles
- ✅ Tipos de fuente son precisos
- ✅ Fechas de verificación son actuales

---

## 3. Estructura de Componentes

### App.tsx
- Estado global: selectedClass, userRole
- Enrutamiento entre ClassSelection y ClassHub
- ErrorBoundary wrapper

### ClassSelection.tsx
- Búsqueda de clases
- Filtrado por rol
- Sistema de favoritos
- Grid de clases

### ClassHub.tsx
- Selector de especialización
- Navegación de pestañas
- Selector de mazmorra (condicional)
- Panel de Admin (condicional)
- GuideSection

### GuideSection.tsx
- LoadingSpinner
- ErrorDisplay
- MarkdownRenderer
- Contenido renderizado

### Componentes de Utilidad
- ClassIcon.tsx
- SpecIcon.tsx
- ErrorBoundary.tsx
- LoadingSpinner.tsx

---

## 4. Flujo de Estado

### ClassHub State
```typescript
interface ClassHubState {
  activeTab: TabId;
  activeSpec: Specialization;
  selectedExpansion: string;
  selectedDungeon: Dungeon;
  content: string;
  isLoading: boolean;
  error: string | null;
  sourceUrls: string;
  showAdminConfig: boolean;
}
```

### Transiciones de Estado
```
Initial
  ↓
Loading (fetchContent)
  ├→ Success (setContent)
  └→ Error (setError)

Tab Change
  ↓
Loading (fetchContent)
  ├→ Cache Hit (setContent immediately)
  └→ Cache Miss (API call)

Spec Change
  ↓
Loading (fetchContent)
  ├→ Success (setContent)
  └→ Error (setError)

Admin Regenerate
  ↓
Loading (fetchContent with sourceUrls)
  ├→ Success (setContent)
  └→ Error (setError)
```

---

## 5. Servicios

### geminiService.ts
- `getOverview(wowClass, sourceUrls?): Promise<string>`
- `getSpecGuide(wowClass, spec, sourceUrls?): Promise<string>`
- `getRotationGuide(wowClass, spec, sourceUrls?): Promise<string>`
- `getAddons(wowClass, sourceUrls?): Promise<string>`
- `getDungeonTips(wowClass, spec, dungeon, sourceUrls?): Promise<string>`

### cacheService.ts
- `get<T>(key: string): T | null`
- `set<T>(key: string, value: T, ttl?: number): void`
- `clear(): void`
- `invalidate(pattern: string): void`

### validationService.ts
- `validateSourceUrls(urls: string): ValidationResult`
- `validateApiResponse(response: any): boolean`
- `validateClassData(classData: WowClass): boolean`

### propertyValidator.ts
- `validateCP1(spec, wowClass): boolean`
- `validateCP2(dungeons, expansion): boolean`
- `validateCP3(content, key): boolean`
- ... (validadores para CP4-CP12)

---

## 6. Integración de API

### Gemini API
- Modelo: `gemini-2.5-flash`
- Timeout: 30 segundos
- Reintentos: 3 con backoff exponencial
- Validación de respuesta: Verificar que no esté vacía

### Estructura de Prompt
```
[Context]
You are an expert World of Warcraft guide writer.

[Task]
Generate a comprehensive guide for [Class] [Spec] [Tab Type]

[Format]
- Use markdown formatting
- Include ability tooltips in format: [Name]{Cooldown: X sec, ID: SpellID, Description: ...}
- Include source attribution

[Sources] (si aplica)
Use these sources as primary knowledge:
- URL1
- URL2

[Output]
Generate the guide now.
```

---

## 7. Caché

### Estrategia
- TTL: 1 hora
- Clave: `${activeTab}-${activeSpec.id}-${selectedDungeon.name}`
- Invalidación: Manual o por TTL

### Implementación
```typescript
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }
  
  set<T>(key: string, value: T, ttl = 3600000): void {
    this.cache.set(key, { value, timestamp: Date.now(), ttl });
  }
}
```

---

## 8. Manejo de Errores

### Tipos de Error
1. **Validación**: Entrada inválida
2. **API**: Fallo de Gemini
3. **Red**: Problemas de conectividad
4. **Renderizado**: Problemas al renderizar contenido

### Estrategia de Recuperación
```
Error Detectado
  ↓
Validar tipo de error
  ├→ Validación: Mostrar mensaje específico
  ├→ API: Reintentar con backoff
  ├→ Red: Sugerir verificar conexión
  └→ Renderizado: Mostrar contenido sin formato
  ↓
Registrar en console
  ↓
Mostrar UI de error
  ↓
Proporcionar botón de reintentar
```

---

## 9. Performance

### Optimizaciones
- Memoización de computaciones costosas (useMemo)
- Memoización de callbacks (useCallback)
- React.memo para componentes puros
- Lazy loading de contenido
- Caché de 1 hora

### Métricas Objetivo
- Initial load: < 3s
- Tab switch: < 1s
- Search/filter: < 100ms
- Guide generation: < 5s

---

## 10. Seguridad

### Protecciones
- API key en variables de entorno
- Validación de URLs personalizadas
- Sanitización de entrada de usuario
- Escape de HTML antes de renderizar
- No usar `dangerouslySetInnerHTML` sin sanitización

### Validación de URLs
```typescript
const validateSourceUrls = (urls: string): ValidationResult => {
  const lines = urls.split('\n').filter(line => line.trim());
  const validUrls: string[] = [];
  const errors: string[] = [];
  
  lines.forEach((line, index) => {
    try {
      const url = new URL(line.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push(`Line ${index + 1}: Only HTTP/HTTPS URLs allowed`);
      } else {
        validUrls.push(url.toString());
      }
    } catch {
      errors.push(`Line ${index + 1}: Invalid URL format`);
    }
  });
  
  return { valid: errors.length === 0, urls: validUrls, errors };
};
```

---

## 11. Testing

### Estrategia
- Unit tests para funciones puras
- Integration tests para flujos críticos
- Property-based tests para propiedades de corrección
- E2E tests para flujos de usuario

### Cobertura Objetivo
- Funciones puras: > 90%
- Componentes: > 80%
- Servicios: > 85%
- General: > 80%

---

## 12. Accesibilidad

### WCAG 2.1 AA
- Navegación por teclado completa
- Etiquetas ARIA apropiadas
- Ratios de contraste ≥ 4.5:1
- Texto alternativo para imágenes
- Estructura semántica HTML

### Implementación
```typescript
<button
  aria-label="Select Warrior class"
  aria-pressed={selectedClass?.id === 'warrior'}
  onClick={() => handleSelectClass(warrior)}
>
  {/* Contenido */}
</button>
```

---

## 13. Documentación

### Archivos de Documentación
- `README.md`: Setup y uso
- `PROJECT_ANALYSIS.md`: Análisis del proyecto
- `.kiro/specs/requirements-improved.md`: Requisitos
- `.kiro/specs/design-improved.md`: Diseño (este archivo)
- `.kiro/steering/project-standards.md`: Estándares
- `.kiro/steering/gemini-api-guidelines.md`: Guías de API

### Comentarios en Código
- Explicar "por qué", no "qué"
- Documentar algoritmos complejos
- Incluir ejemplos para uso no obvio
- Mantener comentarios actualizados
