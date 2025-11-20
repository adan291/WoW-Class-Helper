# Testing Guide - Sistema de Curadores

## 📋 Fase 3: Testing

### Tests Unitarios

#### classOrchestratorService.test.ts
**Ubicación:** `services/classOrchestratorService.test.ts`

**Cobertura:**
- ✅ `orchestrateClassCheck()` - Validación de clases
- ✅ `prepareGeminiContext()` - Preparación de contexto
- ✅ `validateAndPrepareGuideRequest()` - Validación completa
- ✅ `generateOrchestratorReport()` - Reportes
- ✅ `getClassesNeedingUpdate()` - Clases que necesitan actualización

**Casos de Prueba:**
```
✅ Validar clase válida
✅ Rechazar clase inválida
✅ Retornar estado del curador
✅ Retornar estado de validación
✅ Preparar contexto para clase válida
✅ Retornar null para clase inválida
✅ Incluir fuentes verificadas
✅ Incluir calidad de datos
✅ Validar clase solo
✅ Validar clase y spec
✅ Validar clase, spec y mazmorra
✅ Rechazar clase inválida
✅ Rechazar spec inválida
✅ Rechazar mazmorra inválida
✅ Generar reporte para todas las clases
✅ Incluir conteo de clases listas
✅ Incluir métricas de calidad
✅ Incluir recomendaciones
✅ Retornar array de clases
✅ Retornar nombres de clases
✅ Calidad de datos alta para todas las clases
✅ Calidad consistente de datos de clase
✅ Calidad consistente de datos de spec
✅ Validar todas las clases consistentemente
✅ Validar todas las specs consistentemente
```

**Ejecutar:**
```bash
npm run test services/classOrchestratorService.test.ts
```

### Tests de Integración

#### ClassHub.integration.test.tsx
**Ubicación:** `components/ClassHub.integration.test.tsx`

**Cobertura:**
- ✅ Renderizado del componente
- ✅ Navegación de tabs
- ✅ Selección de especialización
- ✅ Validación de estado
- ✅ Indicadores de validación
- ✅ Calidad de datos
- ✅ Manejo de errores
- ✅ Modo admin
- ✅ Carga de contenido
- ✅ Selección de mazmorra
- ✅ Caching

**Casos de Prueba:**
```
✅ Renderizar sin errores
✅ Renderizar navegación de tabs
✅ Renderizar selección de specs
✅ Mostrar indicador de validación
✅ Mostrar calidad de datos
✅ Cargar tab overview por defecto
✅ Cambiar tabs al hacer click
✅ Tener specs disponibles
✅ Actualizar contenido al cambiar spec
✅ Manejar errores de validación
✅ Mostrar panel admin en modo admin
✅ No mostrar panel admin en modo user
✅ Mostrar estado de carga
✅ Mostrar contenido después de cargar
✅ Mostrar selector de mazmorra en tab dungeons
✅ Tener filtro de expansión en tab dungeons
✅ Cachear contenido para prevenir llamadas redundantes
```

**Ejecutar:**
```bash
npm run test components/ClassHub.integration.test.tsx
```

### Tests Manuales

#### 1. Validación de Clase
**Pasos:**
1. Abre la aplicación
2. Selecciona una clase (ej: Warrior)
3. Observa el indicador de validación
4. Verifica que aparezca la calidad de datos

**Esperado:**
- ✅ Indicador de validación aparece brevemente
- ✅ Calidad de datos se muestra (95%+)
- ✅ Contenido se carga correctamente

#### 2. Cambio de Especialización
**Pasos:**
1. Selecciona una clase
2. Haz click en una especialización diferente
3. Observa la validación
4. Verifica que el contenido se actualice

**Esperado:**
- ✅ Validación ocurre automáticamente
- ✅ Contenido se actualiza
- ✅ Calidad de datos se muestra

#### 3. Cambio de Tab
**Pasos:**
1. Selecciona una clase
2. Haz click en diferentes tabs (Overview, Builds, Rotations, etc.)
3. Observa la validación en cada tab
4. Verifica que el contenido sea correcto

**Esperado:**
- ✅ Validación ocurre para cada tab
- ✅ Contenido es diferente para cada tab
- ✅ Calidad de datos se muestra

#### 4. Selección de Mazmorra
**Pasos:**
1. Selecciona una clase
2. Ve al tab "Dungeons"
3. Selecciona una expansión
4. Selecciona una mazmorra
5. Observa la validación

**Esperado:**
- ✅ Validación ocurre automáticamente
- ✅ Contenido se carga para la mazmorra
- ✅ Calidad de datos se muestra

#### 5. Modo Admin
**Pasos:**
1. Cambia a "Admin Mode" en el header
2. Observa el panel admin
3. Intenta agregar URLs personalizadas
4. Haz click en "Regenerate"

**Esperado:**
- ✅ Panel admin aparece
- ✅ Puedes agregar URLs
- ✅ Contenido se regenera con URLs personalizadas

#### 6. Errores de Validación
**Pasos:**
1. Intenta acceder a datos inválidos (si es posible)
2. Observa el manejo de errores
3. Verifica que se muestre un mensaje de error

**Esperado:**
- ✅ Errores se manejan gracefully
- ✅ Se muestra mensaje de error claro
- ✅ Hay opción de reintentar

#### 7. Caching
**Pasos:**
1. Carga una guía
2. Cambia a otro tab
3. Vuelve al tab anterior
4. Observa que el contenido se carga instantáneamente

**Esperado:**
- ✅ Contenido se carga del cache
- ✅ No hay indicador de carga
- ✅ Contenido es idéntico

#### 8. Validación en Staging
**Pasos:**
1. Despliega a staging
2. Ejecuta todos los tests manuales
3. Verifica en diferentes navegadores
4. Verifica en dispositivos móviles

**Esperado:**
- ✅ Todo funciona en staging
- ✅ Compatible con navegadores modernos
- ✅ Responsive en móviles

## 🧪 Ejecutar Tests

### Todos los tests
```bash
npm run test
```

### Tests específicos
```bash
npm run test services/classOrchestratorService.test.ts
npm run test components/ClassHub.integration.test.tsx
```

### Tests con cobertura
```bash
npm run test -- --coverage
```

### Tests en modo watch
```bash
npm run test -- --watch
```

## 📊 Cobertura Esperada

**Objetivo:** >= 80% de cobertura

**Desglose:**
- Services: 90%+
- Components: 85%+
- Hooks: 85%+
- Utils: 95%+

## ✅ Checklist de Testing

### Antes de Deployment

- [ ] Todos los tests unitarios pasan
- [ ] Todos los tests de integración pasan
- [ ] Cobertura >= 80%
- [ ] Tests manuales completados
- [ ] Validación en staging exitosa
- [ ] Sin errores en consola
- [ ] Sin warnings críticos
- [ ] Performance aceptable
- [ ] Responsive en móviles
- [ ] Compatible con navegadores

### Validaciones Específicas

- [ ] Validación de clase funciona
- [ ] Validación de especialización funciona
- [ ] Validación de mazmorra funciona
- [ ] Indicador de validación aparece
- [ ] Calidad de datos se muestra
- [ ] Errores se manejan correctamente
- [ ] Caching funciona
- [ ] Modo admin funciona
- [ ] URLs personalizadas funcionan
- [ ] Regeneración funciona

## 🐛 Debugging

### Habilitar logs de validación
```typescript
// En classOrchestratorService.ts
console.log('Validating class:', classId);
console.log('Validation result:', result);
```

### Verificar estado de validación
```typescript
// En ClassHub.tsx
console.log('isValidating:', isValidating);
console.log('validationErrors:', validationErrors);
console.log('dataQuality:', dataQuality);
```

### Verificar contexto de Gemini
```typescript
// En classOrchestratorService.ts
console.log('Gemini context:', geminiContext);
console.log('Verified sources:', geminiContext?.verifiedSourceUrls);
```

## 📈 Métricas de Éxito

### Funcionalidad
- ✅ 100% de tests pasan
- ✅ 0 errores críticos
- ✅ 0 warnings críticos

### Performance
- ✅ Validación < 100ms
- ✅ Carga de contenido < 5s
- ✅ Cambio de tab < 1s

### Calidad
- ✅ Cobertura >= 80%
- ✅ Código limpio
- ✅ Sin deuda técnica

## 🚀 Próximos Pasos

1. **Ejecutar tests unitarios**
   ```bash
   npm run test services/classOrchestratorService.test.ts
   ```

2. **Ejecutar tests de integración**
   ```bash
   npm run test components/ClassHub.integration.test.tsx
   ```

3. **Ejecutar tests manuales**
   - Seguir checklist de tests manuales

4. **Validar en staging**
   - Desplegar a staging
   - Ejecutar todos los tests manuales

5. **Deployment a producción**
   - Si todo pasa, desplegar a producción
   - Monitorear en producción

## 📞 Soporte

Si encuentras problemas durante testing:

1. Revisa los logs de la consola
2. Verifica que todos los servicios estén disponibles
3. Comprueba que los datos de prueba sean válidos
4. Consulta la documentación de debugging

---

**Versión:** 1.0.0
**Fecha:** 2024-11-20
**Estado:** Listo para Testing
