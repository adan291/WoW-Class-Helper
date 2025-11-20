# Curator System Integration Guide

## Overview

El sistema de curadores está completamente integrado con el servicio Gemini. Todas las solicitudes de guías ahora pasan por validación automática antes de ser enviadas a la API.

## Cambios Realizados

### 1. Servicio Gemini Mejorado (`services/geminiService.ts`)

**Nuevas características:**
- Validación automática de datos de clase antes de cada llamada
- Integración con el orquestador de curadores
- Uso de fuentes verificadas del sistema de curadores
- Manejo mejorado de errores con contexto de validación

**Funciones actualizadas:**
```typescript
// Todas estas funciones ahora validan datos automáticamente
export const getOverview(wowClass, sourceUrls?, customSourceUrls?)
export const getSpecGuide(wowClass, spec, sourceUrls?, customSourceUrls?)
export const getRotationGuide(wowClass, spec, sourceUrls?, customSourceUrls?)
export const getAddons(wowClass, sourceUrls?, customSourceUrls?)
export const getDungeonTips(wowClass, spec, dungeonName?, sourceUrls?, customSourceUrls?)
```

**Flujo de validación:**
```
Solicitud de guía
    ↓
validateClassDataBeforeGeneration()
    ├→ Valida clase existe
    ├→ Valida especialización (si aplica)
    ├→ Valida mazmorra (si aplica)
    └→ Obtiene fuentes verificadas
    ↓
¿Datos válidos?
    ├→ SÍ: Usa fuentes verificadas + custom sources
    └→ NO: Lanza error con detalles
    ↓
generateContentWithGemini()
```

### 2. Hook Mejorado (`hooks/useValidatedGuideContent.ts`)

**Nuevo hook principal:**
```typescript
const {
  content,
  isLoading,
  isValidating,
  isValid,
  validationErrors,
  dataQuality,
  fetchOverview,
  fetchSpecGuide,
  fetchRotationGuide,
  fetchAddons,
  fetchDungeonTips,
  error,
  clearError,
} = useValidatedGuideContent({
  customSourceUrls: ['https://example.com/guide']
});
```

**Hook simplificado para casos específicos:**
```typescript
const guide = useValidatedGuide(
  wowClass,
  spec,
  'rotation', // 'overview' | 'spec' | 'rotation' | 'addons' | 'dungeon'
  dungeonName,
  { autoFetch: true }
);
```

### 3. Servicios de Soporte

**Data Curator Service** (`services/dataCurator.ts`)
- Gestiona configuración de curadores por clase
- Mantiene fuentes de datos verificadas
- Calcula puntuaciones de integridad

**Data Integrity Validator** (`services/dataIntegrityValidator.ts`)
- Valida estructura de datos
- Calcula métricas de calidad
- Genera reportes de integridad

**Patch Monitor** (`services/patchMonitor.ts`)
- Rastrea versiones de parches
- Identifica clases afectadas
- Detecta cuándo actualizar datos

**Class Orchestrator Service** (`services/classOrchestratorService.ts`)
- Orquesta toda la validación
- Prepara contextos para Gemini
- Genera reportes de salud del sistema

## Uso en Componentes

### Ejemplo 1: Obtener guía de especialización

```typescript
import { useValidatedGuide } from '../hooks/useValidatedGuideContent.ts';

export const SpecGuideComponent = ({ wowClass, spec }) => {
  const {
    content,
    isLoading,
    isValid,
    validationErrors,
    dataQuality,
    error,
  } = useValidatedGuide(wowClass, spec, 'spec', undefined, {
    autoFetch: true,
  });

  if (!isValid) {
    return (
      <div className="error">
        <p>Datos no válidos:</p>
        <ul>
          {validationErrors.map(err => <li key={err}>{err}</li>)}
        </ul>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <p className="text-sm text-gray-400">
        Calidad de datos: {dataQuality.toFixed(1)}%
      </p>
      <MarkdownContent content={content} />
    </div>
  );
};
```

### Ejemplo 2: Obtener múltiples guías

```typescript
import { useValidatedGuideContent } from '../hooks/useValidatedGuideContent.ts';

export const MultiGuideComponent = ({ wowClass, spec }) => {
  const guide = useValidatedGuideContent({
    customSourceUrls: ['https://wowhead.com/guides']
  });

  const handleFetchRotation = async () => {
    await guide.fetchRotationGuide(wowClass, spec);
  };

  const handleFetchAddons = async () => {
    await guide.fetchAddons(wowClass);
  };

  return (
    <div className="space-y-4">
      <button onClick={handleFetchRotation} disabled={guide.isLoading}>
        Obtener Rotación
      </button>
      <button onClick={handleFetchAddons} disabled={guide.isLoading}>
        Obtener Addons
      </button>

      {guide.isValidating && <p>Validando datos...</p>}
      {guide.isLoading && <p>Cargando guía...</p>}
      {guide.error && <ErrorMessage message={guide.error} />}
      {guide.content && <MarkdownContent content={guide.content} />}
    </div>
  );
};
```

### Ejemplo 3: Con panel de curadores

```typescript
import { CuratorDashboard } from '../components/CuratorDashboard.tsx';

export const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <h1>Panel de Administración</h1>
      <CuratorDashboard />
    </div>
  );
};
```

## Flujo de Datos Completo

```
Usuario solicita guía
    ↓
Componente llama useValidatedGuide()
    ↓
Hook llama fetchSpecGuide()
    ↓
geminiService.getSpecGuide()
    ↓
validateClassDataBeforeGeneration()
    ├→ orchestrateClassCheck()
    ├→ validateAndPrepareGuideRequest()
    └→ prepareGeminiContext()
    ↓
¿Validación exitosa?
    ├→ SÍ: Obtiene fuentes verificadas
    └→ NO: Retorna error
    ↓
generateContentWithGemini()
    ├→ Inyecta fuentes verificadas
    └→ Llama API Gemini
    ↓
Retorna contenido validado
    ↓
Componente renderiza guía
```

## Validaciones Automáticas

### Antes de cada llamada a Gemini:

1. **Validación de Clase**
   - ✅ Clase existe en WOW_CLASSES
   - ✅ Tiene campos requeridos (name, color, specs)
   - ✅ Estado del curador no es crítico

2. **Validación de Especialización** (si aplica)
   - ✅ Especialización existe para la clase
   - ✅ Tiene rol válido (Tank, Healer, Damage)
   - ✅ Datos son actuales

3. **Validación de Mazmorra** (si aplica)
   - ✅ Mazmorra existe en DUNGEONS
   - ✅ Tiene información de expansión
   - ✅ Es de la temporada actual

4. **Validación de Calidad**
   - ✅ Puntuación de integridad >= 80%
   - ✅ Sin problemas críticos del curador
   - ✅ Fuentes verificadas disponibles

5. **Validación de Parches**
   - ✅ Detecta si clase fue afectada por último parche
   - ✅ Verifica si datos necesitan actualización
   - ✅ Alerta si datos están desactualizados

## Manejo de Errores

### Errores de Validación

```typescript
try {
  const guide = await geminiService.getSpecGuide(wowClass, spec);
} catch (error) {
  // Error contiene detalles de validación
  // Ejemplo: "Data validation failed: Class not found: invalid_id"
  console.error(error.message);
}
```

### Errores de Calidad de Datos

```typescript
const { context } = validateAndPrepareGuideRequest(classId, specId);

if (context && context.dataQuality < 80) {
  console.warn(`Calidad de datos baja: ${context.dataQuality}%`);
  // Mostrar advertencia al usuario
}
```

### Errores de Parches

```typescript
const status = orchestrateClassCheck(classId);

if (status.recommendations.includes('Class was affected by latest patch')) {
  // Mostrar notificación de que datos pueden estar desactualizados
}
```

## Monitoreo y Reportes

### Generar reporte de salud del sistema

```typescript
import { generateHealthCheckReport } from '../services/classOrchestratorService.ts';

const report = generateHealthCheckReport();

console.log(`Sistema: ${report.systemHealth}`);
console.log(`Clases listas: ${report.orchestratorReport.readyClasses}`);
console.log(`Calidad general: ${report.integrityReport.metrics.overallQuality.toFixed(1)}%`);
```

### Verificar estado de una clase específica

```typescript
import { orchestrateClassCheck } from '../services/classOrchestratorService.ts';

const status = orchestrateClassCheck('warrior');

console.log(`¿Lista para Gemini? ${status.isReadyForGemini}`);
console.log(`Problemas: ${status.issues.join(', ')}`);
console.log(`Recomendaciones: ${status.recommendations.join(', ')}`);
```

## Actualización de Datos

### Cuando se lanza un nuevo parche

```typescript
import { addNewPatch } from '../services/patchMonitor.ts';

addNewPatch({
  version: '11.1.0',
  releaseDate: new Date('2024-12-10'),
  expansion: 'The War Within',
  majorChanges: ['Balance changes', 'Mythic+ tuning'],
  affectedClasses: ['warrior', 'paladin'],
  affectedSpecs: ['arms', 'fury', 'holy_paladin'],
});
```

### Actualizar configuración de curador

```typescript
import { updateClassCuratorData } from '../services/dataCurator.ts';

updateClassCuratorData('warrior', {
  dataIntegrity: 98,
  validationStatus: 'valid',
  notes: ['Updated for patch 11.1.0'],
});
```

## Mejores Prácticas

1. **Siempre usar hooks validados**
   - Usa `useValidatedGuide` o `useValidatedGuideContent`
   - No llames directamente a `geminiService` sin validación

2. **Mostrar estado de validación**
   - Indica al usuario si datos están siendo validados
   - Muestra calidad de datos en la UI
   - Alerta sobre problemas de validación

3. **Manejar errores apropiadamente**
   - Captura errores de validación
   - Proporciona mensajes claros al usuario
   - Sugiere acciones correctivas

4. **Monitorear salud del sistema**
   - Revisa reportes regularmente
   - Actualiza datos cuando hay nuevos parches
   - Mantén puntuaciones de integridad altas

5. **Usar fuentes personalizadas**
   - Pasa `customSourceUrls` cuando sea necesario
   - Combina con fuentes verificadas del curador
   - Valida URLs personalizadas

## Troubleshooting

### "Data validation failed: Class not found"
- Verifica que el ID de clase es correcto
- Asegúrate que la clase existe en `constants.ts`

### "Data quality below threshold"
- Revisa el estado del curador en el dashboard
- Actualiza datos si hay nuevo parche
- Verifica que las fuentes están activas

### "Specialization data validation failed"
- Verifica que el ID de especialización es correcto
- Asegúrate que la especialización existe para la clase
- Revisa que el rol es válido (Tank, Healer, Damage)

### "Dungeon not found"
- Verifica que el nombre de mazmorra es exacto
- Asegúrate que la mazmorra existe en `constants.ts`
- Revisa que es de la temporada actual

## Próximos Pasos

1. Integrar con componentes existentes
2. Actualizar llamadas a `geminiService` en componentes
3. Reemplazar hooks antiguos con `useValidatedGuide`
4. Agregar CuratorDashboard al panel admin
5. Configurar monitoreo automático de salud
