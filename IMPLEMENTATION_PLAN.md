# 🚀 Implementation Plan - WoW AI Class Helper

## Overview

Plan de implementación basado en los specs creados. Mapea cada Acceptance Criterion a tareas de implementación.

---

## 📋 AC → Implementation Tasks

### AC1: Class & Specialization Discovery

**Status**: ✅ Parcialmente implementado

**Tareas**:
- [x] Crear tipos WowClass y Specialization
- [x] Crear constantes WOW_CLASSES con todas las clases
- [x] Crear componente ClassSelection
- [x] Crear componente ClassIcon
- [ ] Implementar búsqueda de clases (search)
- [ ] Implementar filtrado por rol (role filter)
- [ ] Implementar sistema de favoritos (localStorage)
- [ ] Implementar ordenamiento (favoritos primero)

**Correctness Properties**: CP1, CP10, CP11

**Verificación**:
- [ ] Todas las 13 clases se muestran
- [ ] Iconos son precisos
- [ ] Búsqueda es case-insensitive
- [ ] Filtrado por rol funciona
- [ ] Favoritos persisten en localStorage
- [ ] Favoritos aparecen primero

---

### AC2: Specialization Selection & Content Routing

**Status**: ✅ Parcialmente implementado

**Tareas**:
- [x] Crear componente SpecIcon
- [x] Crear componente ClassHub
- [ ] Implementar selector de especialización
- [ ] Implementar persistencia de spec seleccionada
- [ ] Implementar navegación por tabs
- [ ] Implementar routing de contenido por tab

**Correctness Properties**: CP1, CP3

**Verificación**:
- [ ] Todas las specs de una clase se muestran
- [ ] Spec seleccionada persiste al cambiar tabs
- [ ] Spec se resetea al cambiar clase
- [ ] Contenido se actualiza al cambiar spec

---

### AC3: Guide Generation with Source Verification

**Status**: ❌ No implementado

**Tareas**:
- [ ] Crear servicio geminiService.ts
- [ ] Implementar generateContentWithGemini()
- [ ] Implementar validación de URLs personalizadas
- [ ] Implementar formateo de contenido
- [ ] Implementar estructura de fuentes
- [ ] Implementar atribución de fuentes en guías

**Correctness Properties**: CP3, CP5, CP6, CP12

**Verificación**:
- [ ] Contenido generado es preciso
- [ ] Fuentes son verificables
- [ ] Contenido refleja cambios de patch
- [ ] Información de habilidades es correcta

---

### AC4: Dungeon-Specific Strategies

**Status**: ⚠️ Datos listos, componentes pendientes

**Tareas**:
- [x] Crear constantes DUNGEONS con todas las mazmorras
- [ ] Implementar selector de expansión
- [ ] Implementar lista de mazmorras filtrada
- [ ] Implementar selector de mazmorra
- [ ] Implementar generación de estrategias por mazmorra
- [ ] Implementar tácticas específicas por rol

**Correctness Properties**: CP2, CP3, CP11

**Verificación**:
- [ ] Mazmorras filtradas por expansión
- [ ] Mazmorras ordenadas alfabéticamente
- [ ] Selección de mazmorra actualiza contenido
- [ ] Estrategias son precisas

---

### AC5: User Roles & Admin Capabilities

**Status**: ⚠️ Selector de rol implementado, admin panel pendiente

**Tareas**:
- [x] Crear tipo UserRole
- [x] Implementar selector de rol en header
- [ ] Implementar AdminPanel component
- [ ] Implementar input de URLs personalizadas
- [ ] Implementar botón de regenerar
- [ ] Implementar validación de URLs
- [ ] Implementar audit trail

**Correctness Properties**: CP5, CP8

**Verificación**:
- [ ] Admin panel solo visible para admin
- [ ] URLs personalizadas se aplican
- [ ] Regenerar aplica URLs personalizadas
- [ ] Acceso no-admin rechazado

---

### AC6: Content Rendering & Formatting

**Status**: ⚠️ Componente GuideSection existe, renderizado pendiente

**Tareas**:
- [ ] Implementar renderizado de markdown
- [ ] Implementar renderizado de headers
- [ ] Implementar renderizado de listas
- [ ] Implementar renderizado de code blocks
- [ ] Implementar parser de ability tooltips
- [ ] Implementar renderizado de tablas
- [ ] Implementar copy-to-clipboard

**Correctness Properties**: CP6, CP7

**Verificación**:
- [ ] Markdown renderiza correctamente
- [ ] No hay vulnerabilidades XSS
- [ ] Ability tooltips parsean correctamente
- [ ] Copy funciona en todos los navegadores

---

### AC7: Error Handling & Recovery

**Status**: ❌ No implementado

**Tareas**:
- [ ] Implementar error state en ClassHub
- [ ] Implementar LoadingSpinner
- [ ] Implementar ErrorDisplay component
- [ ] Implementar mensajes de error amigables
- [ ] Implementar botón de reload/retry
- [ ] Implementar logging de errores

**Correctness Properties**: CP7, CP9

**Verificación**:
- [ ] Spinner muestra durante generación
- [ ] Errores se muestran claramente
- [ ] Retry funciona
- [ ] App permanece interactiva

---

### AC8: Responsive Design & Performance

**Status**: ⚠️ Tailwind configurado, optimizaciones pendientes

**Tareas**:
- [ ] Implementar responsive breakpoints
- [ ] Implementar memoización de listas filtradas
- [ ] Implementar lazy loading de contenido
- [ ] Implementar caching de guías
- [ ] Optimizar re-renders con useCallback
- [ ] Optimizar re-renders con useMemo

**Correctness Properties**: CP10

**Verificación**:
- [ ] Layout adapta a todos los breakpoints
- [ ] Carga inicial < 3 segundos
- [ ] Tab switch < 1 segundo
- [ ] Search/filter < 100ms

---

## 🔄 Orden de Implementación Recomendado

### Fase 1: Datos y Tipos (Completar AC1, AC2)
1. Completar AC1: Class & Specialization Discovery
   - Implementar búsqueda
   - Implementar filtrado por rol
   - Implementar sistema de favoritos

2. Completar AC2: Specialization Selection & Content Routing
   - Implementar selector de especialización
   - Implementar persistencia de spec
   - Implementar navegación por tabs

**Duración estimada**: 2-3 horas
**Correctness Properties**: CP1, CP3, CP10, CP11

---

### Fase 2: API y Generación de Contenido (AC3)
1. Crear servicio geminiService.ts
2. Implementar generateContentWithGemini()
3. Implementar validación de URLs
4. Implementar estructura de fuentes

**Duración estimada**: 2-3 horas
**Correctness Properties**: CP3, CP5, CP6, CP12

---

### Fase 3: Mazmorras y Admin (AC4, AC5)
1. Implementar selector de expansión
2. Implementar lista de mazmorras
3. Implementar AdminPanel
4. Implementar inyección de URLs personalizadas

**Duración estimada**: 2-3 horas
**Correctness Properties**: CP2, CP5, CP8

---

### Fase 4: Renderizado y Errores (AC6, AC7)
1. Implementar renderizado de markdown
2. Implementar parser de ability tooltips
3. Implementar error handling
4. Implementar loading states

**Duración estimada**: 3-4 horas
**Correctness Properties**: CP6, CP7, CP9

---

### Fase 5: Optimización y Polish (AC8)
1. Implementar responsive design
2. Implementar memoización
3. Implementar caching
4. Optimizar rendimiento

**Duración estimada**: 2-3 horas
**Correctness Properties**: CP10

---

## 📊 Resumen de Tareas

| AC | Descripción | Estado | Tareas | CPs |
|---|---|---|---|---|
| AC1 | Class Discovery | ⚠️ Parcial | 4 | CP1, CP10, CP11 |
| AC2 | Spec Selection | ⚠️ Parcial | 3 | CP1, CP3 |
| AC3 | Guide Generation | ❌ No | 6 | CP3, CP5, CP6, CP12 |
| AC4 | Dungeon Strategies | ⚠️ Parcial | 6 | CP2, CP3, CP11 |
| AC5 | Admin Features | ⚠️ Parcial | 7 | CP5, CP8 |
| AC6 | Content Rendering | ⚠️ Parcial | 7 | CP6, CP7 |
| AC7 | Error Handling | ❌ No | 6 | CP7, CP9 |
| AC8 | Responsive Design | ⚠️ Parcial | 6 | CP10 |

**Total de tareas**: 45
**Completadas**: ~8
**Pendientes**: ~37

---

## 🎯 Próximos Pasos Inmediatos

### Paso 1: Completar AC1 (Class Discovery)
```
Tareas:
1. Implementar búsqueda de clases
2. Implementar filtrado por rol
3. Implementar sistema de favoritos
4. Implementar ordenamiento

Archivos a modificar:
- components/ClassSelection.tsx
- types.ts (si es necesario)
- constants.ts (si es necesario)

Correctness Properties a validar:
- CP1: Class & Specialization Consistency
- CP10: Responsive Design
- CP11: Data Accuracy Validation
```

### Paso 2: Completar AC2 (Spec Selection)
```
Tareas:
1. Implementar selector de especialización
2. Implementar persistencia de spec
3. Implementar navegación por tabs
4. Implementar routing de contenido

Archivos a modificar:
- components/ClassHub.tsx
- components/SpecIcon.tsx

Correctness Properties a validar:
- CP1: Class & Specialization Consistency
- CP3: Content Generation Consistency
```

### Paso 3: Implementar AC3 (Guide Generation)
```
Tareas:
1. Crear services/geminiService.ts
2. Implementar generateContentWithGemini()
3. Implementar validación de URLs
4. Implementar estructura de fuentes

Archivos a crear:
- services/geminiService.ts

Archivos a modificar:
- components/ClassHub.tsx
- components/GuideSection.tsx

Correctness Properties a validar:
- CP3: Content Generation Consistency
- CP5: Admin Source Injection
- CP6: Markdown Rendering Fidelity
- CP12: Content Source Attribution
```

---

## 📚 Referencia de Specs

**Para entender qué implementar**:
- Lee: `.kiro/specs/requirements.md` → Acceptance Criteria

**Para entender cómo implementar**:
- Lee: `.kiro/specs/design.md` → Correctness Properties

**Para entender cómo verificar**:
- Lee: `.kiro/specs/design.md` → Verification & Test Cases

---

## ✅ Checklist de Implementación

### Fase 1: AC1 & AC2
- [ ] Búsqueda de clases implementada
- [ ] Filtrado por rol implementado
- [ ] Sistema de favoritos implementado
- [ ] Selector de especialización implementado
- [ ] Persistencia de spec implementada
- [ ] Navegación por tabs implementada

### Fase 2: AC3
- [ ] Servicio Gemini creado
- [ ] Generación de contenido implementada
- [ ] Validación de URLs implementada
- [ ] Estructura de fuentes implementada

### Fase 3: AC4 & AC5
- [ ] Selector de expansión implementado
- [ ] Lista de mazmorras implementada
- [ ] AdminPanel implementado
- [ ] Inyección de URLs implementada

### Fase 4: AC6 & AC7
- [ ] Renderizado de markdown implementado
- [ ] Parser de ability tooltips implementado
- [ ] Error handling implementado
- [ ] Loading states implementados

### Fase 5: AC8
- [ ] Responsive design implementado
- [ ] Memoización implementada
- [ ] Caching implementado
- [ ] Rendimiento optimizado

---

**Fecha**: Noviembre 19, 2025
**Versión**: 1.0.0
**Status**: Ready for Implementation
