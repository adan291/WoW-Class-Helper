# Ejemplo de Integración del Sistema de Curadores

## Antes vs Después

### ANTES: Sin validación

```typescript
// components/SpecGuideTab.tsx
import { useGuideContent } from '../hooks/useGuideContent.ts';
import { WOW_CLASSES } from '../constants.ts';

export const SpecGuideTab = ({ classId, specId }) => {
  const wowClass = WOW_CLASSES.find(c => c.id === classId);
  const spec = wowClass?.specs.find(s => s.id === specId);

  const { content, isLoading, error } = useGuideContent(
    'spec',
    wowClass,
    spec
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <MarkdownContent content={content} />;
};
```

**Problemas:**
- ❌ No valida que la clase existe
- ❌ No valida que la especialización es válida
- ❌ No verifica si datos están actualizados
- ❌ No sabe la calidad de los datos
- ❌ Puede enviar datos inventados a Gemini

### DESPUÉS: Con validación de curadores

```typescript
// components/SpecGuideTab.tsx
import { useValidatedGuide } from '../hooks/useValidatedGuideContent.ts';
import { WOW_CLASSES } from '../constants.ts';

export const SpecGuideTab = ({ classId, specId }) => {
  const wowClass = WOW_CLASSES.find(c => c.id === classId);
  const spec = wowClass?.specs.find(s => s.id === specId);

  const {
    content,
    isLoading,
    isValidating,
    isValid,
    validationErrors,
    dataQuality,
    error,
  } = useValidatedGuide(wowClass, spec, 'spec', undefined, {
    autoFetch: true,
  });

  // Mostrar errores de validación
  if (!isValid) {
    return (
      <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Datos no válidos</h3>
        <ul className="text-red-300 text-sm space-y-1">
          {validationErrors.map(err => (
            <li key={err}>• {err}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Mostrar estado de validación
  if (isValidating) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span>Validando datos...</span>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      {/* Mostrar calidad de datos */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Calidad de datos:</span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                dataQuality >= 90
                  ? 'bg-green-500'
                  : dataQuality >= 80
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${dataQuality}%` }}
            ></div>
          </div>
          <span className="text-gray-300 font-semibold">{dataQuality.toFixed(1)}%</span>
        </div>
      </div>

      {/* Contenido de la guía */}
      <MarkdownContent content={content} />
    </div>
  );
};
```

**Beneficios:**
- ✅ Valida que la clase existe
- ✅ Valida que la especialización es válida
- ✅ Verifica si datos están actualizados
- ✅ Muestra calidad de los datos
- ✅ Solo envía datos verificados a Gemini
- ✅ Mejor experiencia de usuario

## Ejemplo 2: Componente con Múltiples Guías

### ANTES

```typescript
// components/ClassGuidePanel.tsx
import { useGuideContent } from '../hooks/useGuideContent.ts';

export const ClassGuidePanel = ({ wowClass, spec }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const overview = useGuideContent('overview', wowClass);
  const specGuide = useGuideContent('spec', wowClass, spec);
  const rotation = useGuideContent('rotation', wowClass, spec);
  const addons = useGuideContent('addons', wowClass);

  return (
    <div>
      <TabNavigation
        tabs={['Overview', 'Spec', 'Rotation', 'Addons']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <Content isLoading={overview.isLoading} content={overview.content} />
      )}
      {activeTab === 'spec' && (
        <Content isLoading={specGuide.isLoading} content={specGuide.content} />
      )}
      {activeTab === 'rotation' && (
        <Content isLoading={rotation.isLoading} content={rotation.content} />
      )}
      {activeTab === 'addons' && (
        <Content isLoading={addons.isLoading} content={addons.content} />
      )}
    </div>
  );
};
```

### DESPUÉS

```typescript
// components/ClassGuidePanel.tsx
import { useValidatedGuideContent } from '../hooks/useValidatedGuideContent.ts';

export const ClassGuidePanel = ({ wowClass, spec }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const guide = useValidatedGuideContent({
    customSourceUrls: ['https://wowhead.com/guides'],
  });

  const handleTabChange = async (tab) => {
    setActiveTab(tab);

    // Fetch content for the selected tab
    switch (tab) {
      case 'overview':
        await guide.fetchOverview(wowClass);
        break;
      case 'spec':
        await guide.fetchSpecGuide(wowClass, spec);
        break;
      case 'rotation':
        await guide.fetchRotationGuide(wowClass, spec);
        break;
      case 'addons':
        await guide.fetchAddons(wowClass);
        break;
    }
  };

  return (
    <div>
      <TabNavigation
        tabs={['Overview', 'Spec', 'Rotation', 'Addons']}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Mostrar estado de validación */}
      {guide.isValidating && (
        <div className="text-blue-400 text-sm">Validando datos...</div>
      )}

      {/* Mostrar errores de validación */}
      {!guide.isValid && guide.validationErrors.length > 0 && (
        <div className="bg-red-900/20 border border-red-500 p-3 rounded text-red-400 text-sm">
          {guide.validationErrors.join(', ')}
        </div>
      )}

      {/* Mostrar calidad de datos */}
      {guide.isValid && guide.dataQuality < 90 && (
        <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded text-yellow-400 text-sm">
          Calidad de datos: {guide.dataQuality.toFixed(1)}%
        </div>
      )}

      {/* Contenido */}
      {guide.isLoading && <LoadingSpinner />}
      {guide.error && <ErrorMessage message={guide.error} />}
      {guide.content && <MarkdownContent content={guide.content} />}
    </div>
  );
};
```

**Mejoras:**
- ✅ Validación automática por tab
- ✅ Muestra estado de validación
- ✅ Alerta sobre calidad baja
- ✅ Mejor manejo de errores
- ✅ Fuentes personalizadas soportadas

## Ejemplo 3: Con Panel de Curadores

```typescript
// components/AdminPanel.tsx
import { CuratorDashboard } from './CuratorDashboard.tsx';
import { useClassOrchestrator } from '../hooks/useClassOrchestrator.ts';

export const AdminPanel = () => {
  const { healthReport, getHealthReport, isLoading } = useClassOrchestrator({
    autoValidate: true,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button
          onClick={() => getHealthReport()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Dashboard de curadores */}
      <CuratorDashboard />

      {/* Resumen rápido */}
      {healthReport && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Clases Listas</p>
            <p className="text-2xl font-bold text-green-400">
              {healthReport.orchestratorReport.readyClasses}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Con Advertencias</p>
            <p className="text-2xl font-bold text-yellow-400">
              {healthReport.orchestratorReport.warningClasses}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Críticas</p>
            <p className="text-2xl font-bold text-red-400">
              {healthReport.orchestratorReport.criticalClasses}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Calidad General</p>
            <p className="text-2xl font-bold text-blue-400">
              {healthReport.integrityReport.metrics.overallQuality.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Ejemplo 4: Manejo de Errores Avanzado

```typescript
// components/RobustGuideComponent.tsx
import { useValidatedGuide } from '../hooks/useValidatedGuideContent.ts';
import { orchestrateClassCheck } from '../services/classOrchestratorService.ts';

export const RobustGuideComponent = ({ classId, specId }) => {
  const wowClass = WOW_CLASSES.find(c => c.id === classId);
  const spec = wowClass?.specs.find(s => s.id === specId);

  const guide = useValidatedGuide(wowClass, spec, 'spec', undefined, {
    autoFetch: true,
  });

  // Verificar estado del curador
  const curatorStatus = orchestrateClassCheck(classId);

  return (
    <div className="space-y-4">
      {/* Mostrar estado del curador */}
      {curatorStatus.curatorStatus.status === 'critical' && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
          <h3 className="text-red-400 font-semibold mb-2">
            ⚠️ Problemas Críticos Detectados
          </h3>
          <ul className="text-red-300 text-sm space-y-1">
            {curatorStatus.issues.map(issue => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
          <div className="mt-3 text-red-300 text-sm">
            <strong>Recomendaciones:</strong>
            <ul className="mt-1 space-y-1">
              {curatorStatus.recommendations.map(rec => (
                <li key={rec}>→ {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mostrar advertencias */}
      {curatorStatus.curatorStatus.status === 'warning' && (
        <div className="bg-yellow-900/20 border border-yellow-500 p-4 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">
            ⚠️ Advertencias
          </h3>
          <ul className="text-yellow-300 text-sm space-y-1">
            {curatorStatus.validationStatus.warnings.map(warning => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mostrar contenido si es válido */}
      {guide.isValid && (
        <div>
          {/* Barra de calidad */}
          <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Calidad de Datos</span>
              <span className="text-gray-300 font-semibold">
                {guide.dataQuality.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  guide.dataQuality >= 90
                    ? 'bg-green-500'
                    : guide.dataQuality >= 80
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${guide.dataQuality}%` }}
              ></div>
            </div>
          </div>

          {/* Contenido */}
          {guide.isLoading && <LoadingSpinner />}
          {guide.error && <ErrorMessage message={guide.error} />}
          {guide.content && <MarkdownContent content={guide.content} />}
        </div>
      )}

      {/* Mostrar si no es válido */}
      {!guide.isValid && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
          <h3 className="text-red-400 font-semibold mb-2">
            No se puede cargar la guía
          </h3>
          <p className="text-red-300 text-sm mb-3">
            Los datos no pasaron la validación:
          </p>
          <ul className="text-red-300 text-sm space-y-1">
            {guide.validationErrors.map(err => (
              <li key={err}>• {err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

## Checklist de Integración

- [ ] Reemplazar `useGuideContent` con `useValidatedGuide`
- [ ] Agregar manejo de `isValid` y `validationErrors`
- [ ] Mostrar `dataQuality` en la UI
- [ ] Mostrar estado de `isValidating`
- [ ] Agregar CuratorDashboard al panel admin
- [ ] Probar con datos inválidos
- [ ] Probar con datos de baja calidad
- [ ] Verificar que Gemini recibe fuentes correctas
- [ ] Documentar cambios en README
- [ ] Entrenar al equipo en el nuevo sistema

## Conclusión

La integración es simple y proporciona beneficios significativos:
- Mejor calidad de datos
- Mejor experiencia de usuario
- Mejor mantenibilidad
- Mejor monitoreo
