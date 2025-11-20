# Sistema de Curadores - Resumen Ejecutivo

## ¿Qué se implementó?

Un sistema completo de **orquestadores/curadores de datos** que valida toda la información antes de enviarla a la API de Gemini. Esto previene alucinaciones de IA asegurando que solo datos verificados y actuales se usen para generar guías.

## Componentes Creados

### 1. Servicios de Validación

#### `services/dataCurator.ts`
- Gestiona curadores por clase de WoW
- Mantiene fuentes de datos verificadas (Blizzard, Wowhead, Icy Veins, etc.)
- Calcula puntuaciones de integridad de datos (0-100%)
- Detecta cuándo los datos necesitan actualización

#### `services/dataIntegrityValidator.ts`
- Valida estructura de clases, especialización y mazmorras
- Calcula métricas de calidad de datos
- Genera reportes de integridad
- Previene datos inventados o desactualizados

#### `services/patchMonitor.ts`
- Rastrea versiones de parches de WoW
- Identifica clases/specs afectadas por parches
- Detecta cuándo se necesita actualizar información
- Mantiene historial de cambios

#### `services/classOrchestratorService.ts`
- Orquesta toda la validación
- Prepara contextos listos para Gemini
- Genera reportes de salud del sistema
- Valida solicitudes completas de guías

### 2. Integración con Gemini

#### `services/geminiService.ts` (Mejorado)
- Todas las funciones ahora validan datos automáticamente
- Usa fuentes verificadas del sistema de curadores
- Inyecta URLs verificadas en prompts
- Manejo mejorado de errores con contexto de validación

**Funciones actualizadas:**
- `getOverview()` - Validación automática
- `getSpecGuide()` - Validación automática
- `getRotationGuide()` - Validación automática
- `getAddons()` - Validación automática
- `getDungeonTips()` - Validación automática

### 3. Hooks React

#### `hooks/useClassOrchestrator.ts`
- Hook principal para validación de curadores
- Genera reportes de salud del sistema
- Valida clases individuales
- Integración con componentes React

#### `hooks/useValidatedGuideContent.ts`
- Hook para obtener guías validadas
- Valida datos antes de cada fetch
- Proporciona estado de validación
- Manejo de errores integrado

### 4. Componentes UI

#### `components/CuratorDashboard.tsx`
- Panel admin para gestionar curadores
- Visualiza estado de salud del sistema
- Muestra métricas de calidad de datos
- Detalle de estado por clase
- Recomendaciones automáticas

## Flujo de Validación

```
Usuario solicita guía
    ↓
Hook valida datos
    ├→ ¿Clase existe?
    ├→ ¿Especialización válida?
    ├→ ¿Mazmorra existe?
    ├→ ¿Datos actuales?
    └→ ¿Calidad >= 80%?
    ↓
¿Todo válido?
    ├→ SÍ: Obtiene fuentes verificadas
    └→ NO: Retorna error detallado
    ↓
Gemini recibe datos verificados
    ↓
Genera guía precisa
```

## Validaciones Automáticas

Antes de cada llamada a Gemini se valida:

1. **Clase**
   - Existe en WOW_CLASSES
   - Tiene campos requeridos
   - Estado del curador no es crítico

2. **Especialización** (si aplica)
   - Existe para la clase
   - Tiene rol válido
   - Datos son actuales

3. **Mazmorra** (si aplica)
   - Existe en DUNGEONS
   - Tiene información de expansión
   - Es de la temporada actual

4. **Calidad de Datos**
   - Integridad >= 80%
   - Sin problemas críticos
   - Fuentes verificadas disponibles

5. **Parches**
   - Detecta si clase fue afectada
   - Verifica si datos necesitan actualización
   - Alerta si datos están desactualizados

## Fuentes de Datos Verificadas

**Prioridad 1 (Oficial):**
- Blizzard Official Patch Notes
- WoW Class Forums

**Prioridad 2 (Comunidad):**
- Wowhead Class Guides
- Icy Veins Guides

**Prioridad 3 (Especializada):**
- Method Guides
- Raider.io Community

## Uso en Componentes

### Ejemplo Simple

```typescript
import { useValidatedGuide } from '../hooks/useValidatedGuideContent.ts';

export const SpecGuide = ({ wowClass, spec }) => {
  const { content, isLoading, isValid, error } = useValidatedGuide(
    wowClass,
    spec,
    'spec',
    undefined,
    { autoFetch: true }
  );

  if (!isValid) return <ErrorMessage />;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <MarkdownContent content={content} />;
};
```

### Con Validación Manual

```typescript
import { useValidatedGuideContent } from '../hooks/useValidatedGuideContent.ts';

export const MultiGuide = ({ wowClass, spec }) => {
  const guide = useValidatedGuideContent();

  const handleFetch = async () => {
    await guide.fetchRotationGuide(wowClass, spec);
  };

  return (
    <div>
      <button onClick={handleFetch} disabled={guide.isLoading}>
        Obtener Rotación
      </button>
      {guide.isValidating && <p>Validando datos...</p>}
      {guide.content && <MarkdownContent content={guide.content} />}
    </div>
  );
};
```

## Monitoreo y Reportes

### Salud del Sistema

```typescript
import { generateHealthCheckReport } from '../services/classOrchestratorService.ts';

const report = generateHealthCheckReport();
console.log(`Sistema: ${report.systemHealth}`); // healthy | warning | critical
console.log(`Clases listas: ${report.orchestratorReport.readyClasses}`);
console.log(`Calidad: ${report.integrityReport.metrics.overallQuality}%`);
```

### Estado de Clase Específica

```typescript
import { orchestrateClassCheck } from '../services/classOrchestratorService.ts';

const status = orchestrateClassCheck('warrior');
console.log(`¿Lista? ${status.isReadyForGemini}`);
console.log(`Problemas: ${status.issues.join(', ')}`);
```

## Mantenimiento

### Cuando hay nuevo parche

```typescript
import { addNewPatch } from '../services/patchMonitor.ts';

addNewPatch({
  version: '11.1.0',
  releaseDate: new Date('2024-12-10'),
  expansion: 'The War Within',
  majorChanges: ['Balance changes'],
  affectedClasses: ['warrior', 'paladin'],
  affectedSpecs: ['arms', 'fury'],
});
```

### Actualizar curador de clase

```typescript
import { updateClassCuratorData } from '../services/dataCurator.ts';

updateClassCuratorData('warrior', {
  dataIntegrity: 98,
  validationStatus: 'valid',
  notes: ['Updated for patch 11.1.0'],
});
```

## Beneficios

✅ **Previene Alucinaciones** - Solo datos verificados llegan a Gemini
✅ **Datos Actuales** - Detecta automáticamente cuándo actualizar
✅ **Calidad Garantizada** - Puntuaciones de integridad >= 80%
✅ **Trazabilidad** - Sabe exactamente qué fuentes se usaron
✅ **Monitoreo** - Dashboard para ver salud del sistema
✅ **Mantenimiento Fácil** - Actualizar datos es simple
✅ **Escalable** - Fácil agregar nuevas clases/specs
✅ **Integración Transparente** - Funciona automáticamente

## Archivos Creados

```
services/
├── dataCurator.ts                    (Gestor de curadores)
├── dataIntegrityValidator.ts         (Validador de integridad)
├── patchMonitor.ts                   (Monitor de parches)
├── classOrchestratorService.ts       (Orquestador principal)
└── geminiService.ts                  (Mejorado con validación)

hooks/
├── useClassOrchestrator.ts           (Hook de curadores)
└── useValidatedGuideContent.ts       (Hook de guías validadas)

components/
└── CuratorDashboard.tsx              (Panel admin)

.kiro/specs/
├── class-curator-system.md           (Especificación completa)
└── CURATOR_INTEGRATION_GUIDE.md      (Guía de integración)
```

## Próximos Pasos

1. **Integrar en componentes existentes**
   - Reemplazar llamadas directas a `geminiService`
   - Usar `useValidatedGuide` en lugar de `useGuideContent`

2. **Agregar CuratorDashboard al admin**
   - Mostrar en panel de administración
   - Permitir actualizar datos manualmente

3. **Configurar monitoreo automático**
   - Alertas cuando calidad baja
   - Notificaciones de nuevos parches

4. **Documentar en README**
   - Explicar sistema a nuevos desarrolladores
   - Incluir ejemplos de uso

## Documentación

- **Especificación completa**: `.kiro/specs/class-curator-system.md`
- **Guía de integración**: `.kiro/CURATOR_INTEGRATION_GUIDE.md`
- **Este resumen**: `.kiro/CURATOR_SYSTEM_SUMMARY.md`

## Conclusión

El sistema de curadores es una capa de validación robusta que garantiza que todas las guías generadas por IA se basan en datos verificados y actuales. Previene alucinaciones, mantiene la calidad alta y es fácil de mantener y escalar.
