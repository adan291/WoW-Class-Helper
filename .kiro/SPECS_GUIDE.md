# 📋 Guía de Specs - WoW AI Class Helper

## 🎯 Empezar Aquí

Los specs han sido creados desde cero con foco en **confiabilidad de datos y verificación**.

### 3 Documentos Principales

1. **requirements.md** - Qué debe hacer la app (8 AC)
2. **design.md** - Cómo debe funcionar (12 CP)
3. **README.md** - Guía de navegación

---

## 📖 Lectura Recomendada

### Opción 1: Rápida (15 minutos)
```
1. Lee: .kiro/specs/README.md (5 min)
   → Entiende la estructura general

2. Lee: .kiro/specs/requirements.md → Acceptance Criteria (5 min)
   → Entiende qué debe hacer la app

3. Lee: .kiro/specs/design.md → Correctness Properties (5 min)
   → Entiende cómo debe funcionar
```

### Opción 2: Completa (45 minutos)
```
1. Lee: .kiro/specs/requirements.md (20 min)
   → Entiende completamente los requisitos

2. Lee: .kiro/specs/design.md (25 min)
   → Entiende completamente la arquitectura
```

### Opción 3: Por Necesidad
```
¿Qué debe hacer la app?
→ .kiro/specs/requirements.md → Acceptance Criteria

¿Cómo debe funcionar?
→ .kiro/specs/design.md → Correctness Properties

¿Cómo implemento una característica?
→ .kiro/specs/design.md → Relevant CP → Implementation

¿Cómo pruebo una característica?
→ .kiro/specs/design.md → Relevant CP → Verification & Test Cases
```

---

## 🗺️ Mapa de Specs

### requirements.md (Requisitos)

**Secciones**:
- Project Vision
- Core Principles (5 principios)
- Scope Definition
- **Acceptance Criteria (AC1-AC8)** ← AQUÍ ESTÁ LO QUE DEBE HACER
- Data Requirements
- Non-Functional Requirements
- Success Metrics
- Future Phases
- Constraints

**Acceptance Criteria**:
```
AC1: Class & Specialization Discovery
AC2: Specialization Selection & Content Routing
AC3: Guide Generation with Source Verification
AC4: Dungeon-Specific Strategies
AC5: User Roles & Admin Capabilities
AC6: Content Rendering & Formatting
AC7: Error Handling & Recovery
AC8: Responsive Design & Performance
```

---

### design.md (Diseño)

**Secciones**:
- Architecture Overview (diagrama)
- Component Hierarchy
- State Management Strategy
- **Correctness Properties (CP1-CP12)** ← AQUÍ ESTÁ CÓMO DEBE FUNCIONAR
- Integration Points
- Performance Optimizations
- Error Handling Strategy
- Security Considerations
- Testing Strategy
- Future Enhancements
- Deployment Considerations

**Correctness Properties**:
```
CP1: Class & Specialization Consistency
CP2: Dungeon Filtering Accuracy
CP3: Content Generation Consistency
CP4: Favorites Persistence
CP5: Admin Source Injection
CP6: Markdown Rendering Fidelity
CP7: Error Recovery
CP8: Role-Based Access Control
CP9: Loading State Management
CP10: Responsive Design
CP11: Data Accuracy Validation ⭐ (Confiabilidad)
CP12: Content Source Attribution ⭐ (Verificación)
```

---

### README.md (Guía)

**Secciones**:
- Overview
- Documents Description
- Coverage Matrix (AC → CP)
- Key Principles
- Quick Reference
- Data Structures
- Performance Targets
- Security Requirements
- Accessibility Requirements
- How to Use These Specs

---

## 🔗 Coverage Matrix

Cada Acceptance Criterion está mapeado a Correctness Properties:

| AC | Descripción | CPs |
|---|---|---|
| AC1 | Class & Specialization Discovery | CP1, CP10, CP11 |
| AC2 | Specialization Selection & Content Routing | CP1, CP3 |
| AC3 | Guide Generation with Source Verification | CP3, CP5, CP6, CP12 |
| AC4 | Dungeon-Specific Strategies | CP2, CP3, CP11 |
| AC5 | User Roles & Admin Capabilities | CP5, CP8 |
| AC6 | Content Rendering & Formatting | CP6, CP7 |
| AC7 | Error Handling & Recovery | CP7, CP9 |
| AC8 | Responsive Design & Performance | CP10 |

**Cobertura**: ✅ 100%

---

## 🎯 Cómo Usar los Specs

### Para Planificar una Característica

1. Identifica qué AC cubre tu característica
2. Lee ese AC en requirements.md
3. Identifica los CPs relacionados
4. Lee esos CPs en design.md
5. Revisa la sección "Implementation" de cada CP
6. Revisa la sección "Verification" para test cases

**Ejemplo**: Implementar "Favorites"
```
1. AC1 menciona "Favorites system with localStorage persistence"
2. Busca CP4 en design.md
3. Lee CP4: Favorites Persistence
4. Sigue la implementación sugerida
5. Implementa los test cases listados
```

### Para Implementar una Característica

1. Lee el AC relevante en requirements.md
2. Lee los CPs relacionados en design.md
3. Revisa la sección "Implementation" de cada CP
4. Sigue project-standards.md para código
5. Implementa los test cases de "Verification"

**Ejemplo**: Implementar "Class Selection"
```
1. Lee AC1 en requirements.md
2. Lee CP1, CP10, CP11 en design.md
3. Revisa implementación sugerida en cada CP
4. Sigue project-standards.md para React components
5. Implementa test cases de CP1, CP10, CP11
```

### Para Debuggear un Problema

1. Identifica qué CP está fallando
2. Lee la sección "Implementation" de ese CP
3. Revisa la sección "Verification" para entender qué debería pasar
4. Revisa la sección "Test Cases" para casos similares
5. Revisa "Error Handling Strategy" en design.md

**Ejemplo**: Favorites no persisten
```
1. Es un problema de CP4: Favorites Persistence
2. Lee la implementación sugerida
3. Verifica que localStorage se está usando correctamente
4. Revisa los test cases para casos similares
5. Revisa error handling para JSON parse errors
```

### Para Escribir Tests

1. Identifica el CP que quieres testear
2. Lee la sección "Verification" de ese CP
3. Implementa los "Test Cases" listados
4. Verifica contra el AC correspondiente

**Ejemplo**: Testear "Dungeon Filtering"
```
1. Es CP2: Dungeon Filtering Accuracy
2. Lee la sección "Verification"
3. Implementa los test cases:
   - Select expansion → verify dungeons filter correctly
   - Change expansion → verify list updates
   - Select dungeon → change expansion → verify dungeon resets
   - Verify dungeon count per expansion matches constants
```

---

## 🔐 Características Especiales

### 1. Data Accuracy Validation (CP11)
**Propósito**: Asegurar que todos los datos mostrados sean correctos

**Implementación**:
```typescript
const validateClassData = (classData: WowClass): boolean => {
  const official = OFFICIAL_WOW_CLASSES.find(c => c.id === classData.id);
  if (!official) return false;
  if (classData.specs.length !== official.specs.length) return false;
  return classData.specs.every(spec =>
    official.specs.some(s => s.id === spec.id)
  );
};
```

**Test Cases**:
- Load class data → verify matches official
- Load spec data → verify matches official
- Load dungeon data → verify matches current patch
- Verify ability cooldowns are accurate

---

### 2. Content Source Attribution (CP12)
**Propósito**: Cada guía incluye fuentes verificables

**Estructura**:
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

**Test Cases**:
- Generate guide → verify sources included
- Verify each source is accessible
- Check source types are correct
- Verify verification dates are recent

---

### 3. Admin Source Injection (CP5)
**Propósito**: Admins pueden inyectar URLs personalizadas

**Implementación**:
```typescript
const generateContentWithGemini = async (
  prompt: string,
  sourceUrls?: string[]
) => {
  const enhancedPrompt = sourceUrls
    ? `Use these sources as primary knowledge:\n${sourceUrls.join('\n')}\n\n${prompt}`
    : prompt;
  
  return await generateContent(enhancedPrompt);
};
```

**Test Cases**:
- Inject custom URL → regenerate → verify content uses custom source
- Remove custom URL → regenerate → verify reverts to default
- Invalid URL → verify error handling
- Non-admin user → verify can't inject URLs

---

## 📊 Estadísticas

- **8 Acceptance Criteria** (AC1-AC8)
- **12 Correctness Properties** (CP1-CP12)
- **100% Coverage** (cada AC tiene CPs)
- **13 WoW Classes** (todas las clases)
- **24 Dungeons** (todas las expansiones)
- **5 Guide Types** (Overview, Builds, Rotations, Addons, Dungeons)
- **3 User Roles** (User, Master, Admin)

---

## 🚀 Próximos Pasos

### Paso 1: Revisar Specs (30 minutos)
```
Lee: .kiro/specs/requirements.md
Lee: .kiro/specs/design.md
Lee: .kiro/specs/README.md
```

### Paso 2: Entender Arquitectura (20 minutos)
```
Revisa: Component Hierarchy en design.md
Revisa: State Management Strategy en design.md
Revisa: Integration Points en design.md
```

### Paso 3: Planificar Implementación (30 minutos)
```
Mapea: AC → CP → Implementation Tasks
Identifica: Dependencias entre componentes
Planifica: Orden de implementación
```

### Paso 4: Implementar Características
```
Sigue: project-standards.md para código
Valida: Contra correctness properties
Prueba: Contra acceptance criteria
```

---

## 📚 Documentación Relacionada

- **Project Standards**: `.kiro/steering/project-standards.md`
- **API Guidelines**: `.kiro/steering/gemini-api-guidelines.md`
- **Quick Start**: `.kiro/QUICK_START.md`
- **Specs Created**: `SPECS_CREATED.md`

---

## 🎓 Rutas de Aprendizaje

### Para Nuevos Desarrolladores
```
1. Lee: .kiro/specs/README.md (5 min)
2. Lee: .kiro/specs/requirements.md (15 min)
3. Lee: .kiro/specs/design.md (20 min)
4. Lee: .kiro/steering/project-standards.md (20 min)
5. Revisa: Código existente
6. Comienza: Con features pequeñas
```

### Para Integración de Gemini
```
1. Lee: .kiro/specs/design.md → CP3, CP5, CP6, CP12
2. Lee: .kiro/steering/gemini-api-guidelines.md
3. Revisa: services/geminiService.ts
4. Entiende: Estructura de prompts
5. Prueba: Con respuestas mock
6. Implementa: Nuevos tipos de guía
```

### Para Optimización de Rendimiento
```
1. Lee: .kiro/specs/design.md → Performance Optimizations
2. Lee: .kiro/steering/project-standards.md → Performance
3. Perfila: Implementación actual
4. Identifica: Cuellos de botella
5. Implementa: Optimizaciones
```

---

## 📞 Referencia Rápida

| Pregunta | Documento | Sección |
|----------|-----------|---------|
| ¿Qué debe hacer la app? | requirements.md | Acceptance Criteria |
| ¿Cómo debe funcionar? | design.md | Correctness Properties |
| ¿Cómo implemento X? | design.md | CP relevante → Implementation |
| ¿Cómo pruebo X? | design.md | CP relevante → Verification |
| ¿Cómo escribo código? | project-standards.md | Code Style & Conventions |
| ¿Cómo integro Gemini? | gemini-api-guidelines.md | API Integration |
| ¿Cómo empiezo? | QUICK_START.md | Getting Started |

---

## ✨ Resumen

✅ **Specs creados desde cero**
✅ **Foco en confiabilidad de datos**
✅ **8 Acceptance Criteria definidos**
✅ **12 Correctness Properties definidos**
✅ **100% Coverage (AC → CP)**
✅ **Arquitectura extensible para addon**
✅ **Estrategia de testing completa**
✅ **Listo para implementación**

---

**Fecha**: Noviembre 19, 2025
**Versión**: 1.0.0
**Status**: Complete ✅
