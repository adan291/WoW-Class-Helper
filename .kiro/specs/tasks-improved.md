# WoW AI Class Helper - Plan de Tareas Mejorado

## Visión General

Este documento define las tareas de implementación para completar el proyecto WoW AI Class Helper del 81.25% actual al 100%.

**Duración Estimada**: 5-8 horas  
**Prioridad**: Alta  
**Dependencias**: Ninguna (proyecto funcional)

---

## 1. Tareas Críticas (Completar AC6, AC7, AC8)

### Grupo 1: Renderizado de Contenido Markdown (AC6)

#### Tarea 1.1: Implementar Renderizado de Tablas
**Descripción**: Agregar soporte para tablas markdown con bordes y estilos.

**Requisitos**:
- Parsear sintaxis de tabla delimitada por pipes
- Renderizar con bordes y estilos Tailwind
- Soportar alineación de columnas (left, center, right)
- Validar estructura de tabla

**Criterios de Aceptación**:
- ✅ Tablas con 2+ columnas renderizan correctamente
- ✅ Bordes y estilos aplicados
- ✅ Alineación de columnas funciona
- ✅ Tablas malformadas no crashean la app

**Archivos a Modificar**:
- `components/GuideSection.tsx` (agregar renderizador de tablas)
- `services/markdownService.ts` (crear si no existe)

**Tiempo Estimado**: 1-2 horas

**Tareas Relacionadas**:
- CP6: Fidelidad de Renderizado Markdown
- AC6: Renderizado de Contenido y Formato

---

#### Tarea 1.2: Implementar Soporte para Blockquotes
**Descripción**: Agregar soporte para blockquotes con bordes izquierdos.

**Requisitos**:
- Parsear sintaxis de blockquote (> prefix)
- Renderizar con borde izquierdo y fondo
- Soportar blockquotes anidados
- Aplicar estilos Tailwind

**Criterios de Aceptación**:
- ✅ Blockquotes simples renderizan correctamente
- ✅ Blockquotes anidados funcionan
- ✅ Bordes y estilos aplicados
- ✅ Blockquotes malformados no crashean

**Archivos a Modificar**:
- `components/GuideSection.tsx`
- `services/markdownService.ts`

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- CP6: Fidelidad de Renderizado Markdown
- AC6: Renderizado de Contenido y Formato

---

#### Tarea 1.3: Escribir Tests para Renderizado Markdown
**Descripción**: Agregar tests unitarios para validar renderizado de tablas y blockquotes.

**Requisitos**:
- Tests para tablas simples
- Tests para tablas complejas
- Tests para blockquotes simples
- Tests para blockquotes anidados
- Tests para casos edge

**Criterios de Aceptación**:
- ✅ Todos los tests pasan
- ✅ Cobertura > 80%
- ✅ Tests documentados

**Archivos a Crear**:
- `components/GuideSection.test.tsx` (agregar tests)
- `services/markdownService.test.ts` (crear si no existe)

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- CP6: Fidelidad de Renderizado Markdown

---

### Grupo 2: Mejora de Manejo de Errores (AC7)

#### Tarea 2.1: Implementar Validación Robusta de Datos
**Descripción**: Agregar validación exhaustiva de selecciones y respuestas de API.

**Requisitos**:
- Validar selecciones de clase/spec/mazmorra
- Validar respuestas de API antes de renderizar
- Proporcionar valores por defecto para datos faltantes
- Registrar errores de validación

**Criterios de Aceptación**:
- ✅ Todas las selecciones validadas
- ✅ Respuestas de API validadas
- ✅ Valores por defecto aplicados
- ✅ Errores registrados en console

**Archivos a Modificar**:
- `services/validationService.ts` (mejorar)
- `components/ClassHub.tsx` (agregar validación)

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- CP7: Recuperación de Errores
- AC7: Manejo de Errores y Recuperación

---

#### Tarea 2.2: Mejorar Mensajes de Error y UI de Recuperación
**Descripción**: Proporcionar mensajes de error claros y contextuales con opciones de recuperación.

**Requisitos**:
- Mensajes de error específicos por tipo de error
- Botón de reintentar con backoff exponencial
- Para Admin: sugerir verificar URLs personalizadas
- Mantener app interactiva

**Criterios de Aceptación**:
- ✅ Mensajes de error claros y accionables
- ✅ Botón de reintentar funciona
- ✅ Backoff exponencial implementado
- ✅ Sugerencias de Admin mostradas

**Archivos a Modificar**:
- `components/ErrorMessage.tsx` (mejorar)
- `components/ClassHub.tsx` (agregar lógica de reintentos)

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- CP7: Recuperación de Errores
- AC7: Manejo de Errores y Recuperación

---

#### Tarea 2.3: Agregar ErrorBoundary Mejorado
**Descripción**: Mejorar ErrorBoundary para capturar y mostrar errores de renderizado.

**Requisitos**:
- Capturar errores de renderizado sin crashear
- Mostrar UI de fallback con detalles de error
- Registrar errores para debugging
- Proporcionar botón de reinicio

**Criterios de Aceptación**:
- ✅ Errores de renderizado capturados
- ✅ UI de fallback mostrada
- ✅ Errores registrados
- ✅ Botón de reinicio funciona

**Archivos a Modificar**:
- `components/ErrorBoundary.tsx` (mejorar)

**Tiempo Estimado**: 30 minutos

**Tareas Relacionadas**:
- CP7: Recuperación de Errores
- AC7: Manejo de Errores y Recuperación

---

#### Tarea 2.4: Escribir Tests para Manejo de Errores
**Descripción**: Agregar tests para validar manejo de errores.

**Requisitos**:
- Tests para validación de datos
- Tests para recuperación de errores
- Tests para mensajes de error
- Tests para reintentos

**Criterios de Aceptación**:
- ✅ Todos los tests pasan
- ✅ Cobertura > 80%
- ✅ Tests documentados

**Archivos a Crear/Modificar**:
- `components/ErrorBoundary.test.tsx` (mejorar)
- `components/ErrorMessage.test.tsx` (mejorar)
- `services/validationService.test.ts` (mejorar)

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- CP7: Recuperación de Errores

---

### Grupo 3: Optimización de Rendimiento (AC8)

#### Tarea 3.1: Optimizar Re-renders de Componentes
**Descripción**: Memoizar computaciones costosas y optimizar dependencias.

**Requisitos**:
- Usar React.memo para componentes puros
- Usar useMemo para computaciones costosas
- Usar useCallback para callbacks
- Optimizar dependency arrays

**Criterios de Aceptación**:
- ✅ Componentes puros memoizados
- ✅ Computaciones costosas memoizadas
- ✅ Callbacks memoizados
- ✅ Dependency arrays optimizados

**Archivos a Modificar**:
- `components/ClassHub.tsx`
- `components/GuideSection.tsx`
- `components/ClassSelection.tsx`
- Otros componentes según sea necesario

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- CP10: Diseño Responsivo
- AC8: Diseño Responsivo y Rendimiento

---

#### Tarea 3.2: Implementar Lazy Loading de Contenido
**Descripción**: Cargar contenido bajo demanda por pestaña.

**Requisitos**:
- Cargar contenido solo cuando se selecciona pestaña
- Mostrar estado de carga durante fetch
- Prevenir solicitudes duplicadas
- Mantener contenido en caché

**Criterios de Aceptación**:
- ✅ Contenido cargado bajo demanda
- ✅ Estado de carga visible
- ✅ Sin solicitudes duplicadas
- ✅ Caché funciona correctamente

**Archivos a Modificar**:
- `components/ClassHub.tsx`
- `services/cacheService.ts`

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- CP3: Consistencia de Generación de Contenido
- AC8: Diseño Responsivo y Rendimiento

---

#### Tarea 3.3: Validar Métricas de Rendimiento
**Descripción**: Medir y validar que se cumplen los objetivos de rendimiento.

**Requisitos**:
- Medir tiempo de carga inicial (< 3s)
- Medir tiempo de cambio de pestaña (< 1s)
- Medir tiempo de búsqueda/filtrado (< 100ms)
- Medir tiempo de generación de guía (< 5s)

**Criterios de Aceptación**:
- ✅ Carga inicial < 3s
- ✅ Cambio de pestaña < 1s
- ✅ Búsqueda/filtrado < 100ms
- ✅ Generación de guía < 5s

**Archivos a Crear**:
- `services/performance.test.ts` (crear benchmarks)

**Tiempo Estimado**: 1 hora

**Tareas Relacionadas**:
- AC8: Diseño Responsivo y Rendimiento

---

### Grupo 4: Validación de Propiedades de Corrección

#### Tarea 4.1: Validar CP1-CP12
**Descripción**: Escribir tests para validar todas las propiedades de corrección.

**Requisitos**:
- Test para cada propiedad de corrección
- Validar invariantes
- Validar transiciones de estado
- Documentar validaciones

**Criterios de Aceptación**:
- ✅ Todos los tests pasan
- ✅ Todas las propiedades validadas
- ✅ Invariantes verificados
- ✅ Documentación completa

**Archivos a Crear/Modificar**:
- `services/propertyValidator.test.ts` (mejorar)
- Tests específicos para cada propiedad

**Tiempo Estimado**: 2 horas

**Tareas Relacionadas**:
- CP1-CP12: Todas las propiedades de corrección

---

#### Tarea 4.2: Checkpoint - Verificar Todos los Tests
**Descripción**: Ejecutar suite completa de tests y verificar que todo pasa.

**Requisitos**:
- Ejecutar `npm run test`
- Verificar cobertura > 80%
- Verificar sin errores o warnings
- Documentar resultados

**Criterios de Aceptación**:
- ✅ Todos los tests pasan
- ✅ Cobertura > 80%
- ✅ Sin errores o warnings
- ✅ Resultados documentados

**Tiempo Estimado**: 30 minutos

---

## 2. Tareas Opcionales (Mejoras Futuras)

### Tarea O1: Agregar Tests E2E
**Descripción**: Implementar tests end-to-end para flujos críticos.

**Requisitos**:
- Tests para flujo de selección de clase
- Tests para generación de guía
- Tests para cambio de pestaña
- Tests para panel de Admin

**Tiempo Estimado**: 2-3 horas

---

### Tarea O2: Implementar Analytics
**Descripción**: Agregar tracking de uso y métricas.

**Requisitos**:
- Tracking de clases seleccionadas
- Tracking de pestañas visitadas
- Tracking de errores
- Dashboard de analytics

**Tiempo Estimado**: 2-3 horas

---

### Tarea O3: Agregar Internacionalización
**Descripción**: Soporte para múltiples idiomas.

**Requisitos**:
- Configurar i18n
- Traducir UI
- Traducir contenido de guías
- Selector de idioma

**Tiempo Estimado**: 3-4 horas

---

## 3. Matriz de Dependencias

```
Tarea 1.1 (Tablas)
  ↓
Tarea 1.2 (Blockquotes)
  ↓
Tarea 1.3 (Tests Markdown)
  ↓
Tarea 2.1 (Validación)
  ↓
Tarea 2.2 (Mensajes de Error)
  ↓
Tarea 2.3 (ErrorBoundary)
  ↓
Tarea 2.4 (Tests de Error)
  ↓
Tarea 3.1 (Optimización)
  ↓
Tarea 3.2 (Lazy Loading)
  ↓
Tarea 3.3 (Métricas)
  ↓
Tarea 4.1 (Validación de CP)
  ↓
Tarea 4.2 (Checkpoint)
```

---

## 4. Cronograma Estimado

| Grupo | Tareas | Duración | Prioridad |
|---|---|---|---|
| 1 | 1.1-1.3 | 3-4 horas | Alta |
| 2 | 2.1-2.4 | 3-4 horas | Alta |
| 3 | 3.1-3.3 | 3 horas | Media |
| 4 | 4.1-4.2 | 2.5 horas | Alta |
| **Total** | **12 tareas** | **11.5-14.5 horas** | - |

**Tiempo Realista**: 5-8 horas (con paralelización y experiencia)

---

## 5. Criterios de Éxito

### Completitud
- ✅ AC1-AC8 al 100%
- ✅ CP1-CP12 validadas
- ✅ Todos los tests pasan
- ✅ Cobertura > 80%

### Calidad
- ✅ Sin errores o warnings en console
- ✅ Código sigue estándares del proyecto
- ✅ Documentación actualizada
- ✅ Commits limpios y descriptivos

### Rendimiento
- ✅ Carga inicial < 3s
- ✅ Cambio de pestaña < 1s
- ✅ Búsqueda/filtrado < 100ms
- ✅ Generación de guía < 5s

### Accesibilidad
- ✅ WCAG 2.1 AA compliance
- ✅ Navegación por teclado completa
- ✅ Ratios de contraste ≥ 4.5:1
- ✅ Etiquetas ARIA apropiadas

---

## 6. Notas de Implementación

### Mejores Prácticas
- Escribir tests primero (TDD)
- Commits pequeños y frecuentes
- Revisar código antes de mergear
- Documentar cambios significativos

### Herramientas Útiles
- `npm run test` - Ejecutar tests
- `npm run test:watch` - Tests en watch mode
- `npm run build` - Build para producción
- `npm run dev` - Servidor de desarrollo

### Debugging
- Usar React DevTools
- Usar Chrome DevTools
- Usar console.log estratégicamente
- Usar debugger statement si es necesario

---

## 7. Documentación de Cambios

### Archivos a Actualizar
- `README.md` - Agregar nuevas características
- `PROJECT_ANALYSIS.md` - Actualizar estado
- `.kiro/specs/tasks.md` - Marcar tareas como completadas
- `CHANGELOG.md` - Crear si no existe

### Commits Recomendados
```
feat: implement markdown table rendering
feat: add blockquote support
feat: improve error handling and validation
feat: optimize component re-renders
feat: implement lazy loading for guide content
test: add comprehensive test coverage
docs: update documentation
```

---

## 8. Rollback Plan

Si algo sale mal:
1. Revertir último commit: `git revert HEAD`
2. Revisar cambios: `git diff`
3. Ejecutar tests: `npm run test`
4. Contactar al equipo si es necesario

---

## 9. Próximos Pasos Después de Completar

1. Desplegar a producción
2. Monitorear métricas de uso
3. Recopilar feedback de usuarios
4. Planificar Fase 2 (PvP, WoW API, etc.)

---

## 10. Referencias

- `.kiro/specs/requirements-improved.md` - Requisitos
- `.kiro/specs/design-improved.md` - Diseño
- `.kiro/steering/project-standards.md` - Estándares
- `.kiro/steering/gemini-api-guidelines.md` - Guías de API
- `PROJECT_ANALYSIS.md` - Análisis del proyecto
