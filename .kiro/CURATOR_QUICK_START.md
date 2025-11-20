# Sistema de Curadores - Quick Start

## 30 Segundos

El sistema de curadores valida automáticamente todos los datos antes de enviarlos a Gemini. Reemplaza `useGuideContent` con `useValidatedGuide` y listo.

```typescript
// ANTES
const { content } = useGuideContent('spec', wowClass, spec);

// DESPUÉS
const { content, isValid, dataQuality } = useValidatedGuide(
  wowClass,
  spec,
  'spec'
);
```

## 5 Minutos

### 1. Entender el Flujo

```
Usuario → Hook Validado → Valida Datos → Gemini → Guía Precisa
```

### 2. Usar en Componente

```typescript
import { useValidatedGuide } from '../hooks/useValidatedGuideContent.ts';

export const MyComponent = ({ wowClass, spec }) => {
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

  if (!isValid) return <div>Datos inválidos: {validationErrors.join(', ')}</div>;
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Calidad: {dataQuality.toFixed(1)}%</p>
      <div>{content}</div>
    </div>
  );
};
```

### 3. Ver Dashboard

```typescript
import { CuratorDashboard } from '../components/CuratorDashboard.tsx';

export const AdminPanel = () => {
  return <CuratorDashboard />;
};
```

## 10 Minutos

### Validaciones Automáticas

El sistema valida automáticamente:

✅ Clase existe
✅ Especialización es válida
✅ Mazmorra existe
✅ Datos están actualizados
✅ Calidad >= 80%

Si algo falla, retorna error detallado.

### Estados Posibles

```typescript
// Validación exitosa
isValid === true
dataQuality >= 80

// Validación fallida
isValid === false
validationErrors = ['Class not found', ...]

// Validando
isValidating === true

// Cargando guía
isLoading === true

// Error en Gemini
error === 'Failed to generate content'
```

### Mostrar Calidad de Datos

```typescript
<div className="flex items-center gap-2">
  <span>Calidad:</span>
  <div className="w-32 h-2 bg-gray-700 rounded overflow-hidden">
    <div
      className={dataQuality >= 90 ? 'bg-green-500' : 'bg-yellow-500'}
      style={{ width: `${dataQuality}%` }}
    />
  </div>
  <span>{dataQuality.toFixed(1)}%</span>
</div>
```

## Tipos de Guías

```typescript
// Overview de clase
useValidatedGuide(wowClass, null, 'overview')

// Guía de especialización
useValidatedGuide(wowClass, spec, 'spec')

// Guía de rotación
useValidatedGuide(wowClass, spec, 'rotation')

// Guía de addons
useValidatedGuide(wowClass, null, 'addons')

// Tips de mazmorra
useValidatedGuide(wowClass, spec, 'dungeon', 'Ara-Kara')
```

## Manejo de Errores

```typescript
if (!isValid) {
  // Datos no pasaron validación
  console.error('Validation errors:', validationErrors);
  // Mostrar al usuario qué está mal
}

if (error) {
  // Error al generar contenido
  console.error('Generation error:', error);
  // Mostrar error genérico al usuario
}
```

## Fuentes Personalizadas

```typescript
const guide = useValidatedGuideContent({
  customSourceUrls: [
    'https://wowhead.com/guides/warrior',
    'https://icy-veins.com/wow/warrior-guide'
  ]
});

await guide.fetchSpecGuide(wowClass, spec);
```

## Monitoreo

### Salud del Sistema

```typescript
import { generateHealthCheckReport } from '../services/classOrchestratorService.ts';

const report = generateHealthCheckReport();

console.log(report.systemHealth); // 'healthy' | 'warning' | 'critical'
console.log(report.orchestratorReport.readyClasses); // Número de clases listas
console.log(report.integrityReport.metrics.overallQuality); // Porcentaje
```

### Estado de Clase

```typescript
import { orchestrateClassCheck } from '../services/classOrchestratorService.ts';

const status = orchestrateClassCheck('warrior');

console.log(status.isReadyForGemini); // true/false
console.log(status.issues); // Problemas encontrados
console.log(status.recommendations); // Qué hacer
```

## Actualizar Datos

### Nuevo Parche

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

### Actualizar Curador

```typescript
import { updateClassCuratorData } from '../services/dataCurator.ts';

updateClassCuratorData('warrior', {
  dataIntegrity: 98,
  validationStatus: 'valid',
  notes: ['Updated for patch 11.1.0'],
});
```

## Troubleshooting

### "Data validation failed: Class not found"
- Verifica que el ID de clase es correcto
- Asegúrate que la clase existe en `constants.ts`

### "Data quality below threshold"
- Revisa el dashboard
- Actualiza datos si hay nuevo parche
- Verifica que las fuentes están activas

### "Specialization data validation failed"
- Verifica que el ID de especialización es correcto
- Asegúrate que la especialización existe para la clase

### "Dungeon not found"
- Verifica que el nombre de mazmorra es exacto
- Asegúrate que la mazmorra existe en `constants.ts`

## Checklist de Integración

- [ ] Reemplazar `useGuideContent` con `useValidatedGuide`
- [ ] Agregar manejo de `isValid` y `validationErrors`
- [ ] Mostrar `dataQuality` en la UI
- [ ] Mostrar estado de `isValidating`
- [ ] Agregar CuratorDashboard al panel admin
- [ ] Probar con datos inválidos
- [ ] Probar con datos de baja calidad
- [ ] Verificar que Gemini recibe fuentes correctas

## Documentación Completa

- **Especificación:** `.kiro/specs/class-curator-system.md`
- **Guía de Integración:** `.kiro/CURATOR_INTEGRATION_GUIDE.md`
- **Ejemplos:** `.kiro/CURATOR_INTEGRATION_EXAMPLE.md`
- **Checklist:** `.kiro/CURATOR_IMPLEMENTATION_CHECKLIST.md`
- **Resumen:** `.kiro/CURATOR_SYSTEM_SUMMARY.md`
- **Completo:** `.kiro/CURATOR_SYSTEM_COMPLETE.md`

## Preguntas Frecuentes

**P: ¿Necesito cambiar mi código?**
R: Solo reemplaza `useGuideContent` con `useValidatedGuide`

**P: ¿Qué pasa si los datos no son válidos?**
R: Retorna error detallado, no llama a Gemini

**P: ¿Cómo agrego una nueva clase?**
R: Actualiza `CLASS_CURATOR_CONFIG` en `dataCurator.ts`

**P: ¿Cómo actualizo datos?**
R: Usa `updateClassCuratorData()` o `addNewPatch()`

**P: ¿Dónde veo la salud del sistema?**
R: En `CuratorDashboard` o con `generateHealthCheckReport()`

## Próximos Pasos

1. Integra en un componente
2. Prueba con datos válidos e inválidos
3. Agrega CuratorDashboard al admin
4. Escribe tests
5. Despliega a producción

---

**¿Necesitas ayuda?** Revisa la documentación completa en `.kiro/`
