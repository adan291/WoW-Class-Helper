# WoW AI Class Helper - Requisitos Mejorados

## 1. Visión General

**Nombre**: WoW AI Class Helper  
**Descripción**: Plataforma de guías de experto para World of Warcraft que genera contenido personalizado usando IA generativa (Gemini API).

**Objetivos Principales**:
- Proporcionar guías precisas y verificables para todas las clases y especializaciones
- Permitir inyección de fuentes personalizadas para usuarios Admin
- Mantener rendimiento óptimo con caché inteligente
- Garantizar accesibilidad y diseño responsivo

**Usuarios Objetivo**:
- Jugadores casuales (User)
- Jugadores experimentados (Master)
- Administradores de contenido (Admin)

---

## 2. Requisitos Funcionales

### RF1: Descubrimiento y Selección de Clases

**Descripción**: Los usuarios pueden explorar y seleccionar clases de WoW.

**Requisitos**:
- Mostrar todas las 13 clases con iconos únicos
- Agrupar clases por rol (Tank, Healer, Damage)
- Permitir búsqueda por nombre de clase
- Permitir filtrado por rol
- Mostrar contador de especializaciones por clase
- Implementar sistema de favoritos con persistencia en localStorage
- Mostrar favoritos primero en listas ordenadas

**Criterios de Aceptación**:
- ✅ Todas las 13 clases visibles en la pantalla de selección
- ✅ Búsqueda funciona con coincidencias parciales
- ✅ Filtros de rol funcionan correctamente
- ✅ Favoritos persisten después de recargar la página
- ✅ Interfaz es accesible (WCAG 2.1 AA)

---

### RF2: Selección de Especialización y Enrutamiento

**Descripción**: Los usuarios pueden seleccionar una especialización y acceder a diferentes tipos de guías.

**Requisitos**:
- Mostrar todas las especializaciones de la clase seleccionada
- Mostrar iconos, nombres y descripciones de especializaciones
- Mostrar indicador de rol para cada especialización
- Permitir selección de especialización
- Mantener especialización seleccionada al cambiar de pestaña
- Proporcionar 5 tipos de guías: Overview, Builds, Rotations, Addons, Dungeons

**Criterios de Aceptación**:
- ✅ Todas las specs de la clase visible
- ✅ Especialización persiste al cambiar de pestaña
- ✅ Todas las 5 pestañas accesibles
- ✅ Navegación entre pestañas es rápida (< 1s)

---

### RF3: Generación de Guías con Verificación de Fuentes

**Descripción**: El sistema genera guías de contenido usando Gemini API con atribución de fuentes.

**Requisitos**:
- Generar contenido usando Gemini 2.5 Flash
- Incluir atribución de fuentes en cada guía
- Mostrar estado de carga durante la generación
- Permitir actualización/regeneración de contenido
- Incluir tooltips de habilidades con información de cooldown y spell ID
- Formatear contenido en markdown

**Criterios de Aceptación**:
- ✅ Contenido generado en < 5 segundos
- ✅ Cada guía incluye al menos una fuente
- ✅ Estado de carga visible durante generación
- ✅ Tooltips de habilidades parsean correctamente
- ✅ Contenido formateado correctamente

---

### RF4: Estrategias Específicas de Mazmorras

**Descripción**: Los usuarios pueden obtener estrategias específicas por mazmorra.

**Requisitos**:
- Mostrar lista de mazmorras filtrada por expansión
- Ordenar mazmorras alfabéticamente
- Permitir selección de mazmorra específica
- Generar estrategias específicas por rol
- Incluir explicaciones de mecánicas y posicionamiento

**Criterios de Aceptación**:
- ✅ Filtro de expansión funciona correctamente
- ✅ Mazmorras ordenadas alfabéticamente
- ✅ Estrategias generadas por rol
- ✅ Contenido incluye mecánicas y posicionamiento

---

### RF5: Roles de Usuario y Capacidades de Admin

**Descripción**: El sistema soporta tres roles de usuario con diferentes capacidades.

**Requisitos**:
- Implementar tres roles: User, Master, Admin
- Mostrar panel de Admin solo para usuarios Admin
- Permitir inyección de URLs personalizadas (Admin)
- Las URLs personalizadas sobrescriben el conocimiento por defecto
- Proporcionar botón de regeneración con fuentes personalizadas
- Mantener registro de inyecciones de fuentes personalizadas

**Criterios de Aceptación**:
- ✅ Panel de Admin oculto para User y Master
- ✅ URLs personalizadas inyectadas correctamente
- ✅ Contenido regenerado con fuentes personalizadas
- ✅ Acceso a Admin no es accesible vía URL

---

### RF6: Renderizado de Contenido y Formato

**Descripción**: El contenido markdown se renderiza correctamente con todos los elementos soportados.

**Requisitos**:
- Soportar headers (h1-h6)
- Soportar listas (ordenadas y desordenadas)
- Soportar bold, italic, strikethrough
- Soportar bloques de código con syntax highlighting
- Soportar tablas con bordes y estilos
- Soportar blockquotes con bordes izquierdos
- Soportar tooltips de habilidades: `[Nombre]{Cooldown: X sec, ID: SpellID, Description: ...}`
- Prevenir vulnerabilidades XSS

**Criterios de Aceptación**:
- ✅ Todos los elementos markdown renderizan correctamente
- ✅ No hay vulnerabilidades XSS
- ✅ Tooltips parsean y muestran correctamente
- ✅ Tablas tienen bordes y estilos apropiados
- ✅ Blockquotes tienen bordes izquierdos

---

### RF7: Manejo de Errores y Recuperación

**Descripción**: El sistema maneja errores gracefully y proporciona recuperación.

**Requisitos**:
- Validar selecciones de clase/spec/mazmorra
- Validar respuestas de API antes de renderizar
- Proporcionar valores por defecto para datos faltantes
- Mostrar mensajes de error claros y contextuales
- Proporcionar botón de reintentar con backoff exponencial
- Para Admin: sugerir verificar URLs personalizadas
- Mantener aplicación interactiva después de error

**Criterios de Aceptación**:
- ✅ Todos los errores capturados y registrados
- ✅ Mensajes de error son claros y accionables
- ✅ Aplicación permanece interactiva después de error
- ✅ Reintentos funcionan correctamente

---

### RF8: Diseño Responsivo y Rendimiento

**Descripción**: La aplicación funciona óptimamente en todos los dispositivos.

**Requisitos**:
- Adaptar layout a mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Sin scroll horizontal en mobile
- Touch targets ≥ 44px en mobile
- Carga inicial < 3 segundos
- Cambio de pestaña < 1 segundo
- Búsqueda/filtrado < 100ms
- Generación de guía < 5 segundos
- Implementar caché de contenido con TTL de 1 hora

**Criterios de Aceptación**:
- ✅ Layout adapta a todos los breakpoints
- ✅ Sin scroll horizontal en mobile
- ✅ Todos los targets de toque ≥ 44px
- ✅ Métricas de rendimiento cumplidas
- ✅ Caché funciona correctamente

---

## 3. Requisitos No Funcionales

### RNF1: Seguridad
- API key nunca se expone en logs o cliente
- Inyección de URLs validada antes de usar
- Entrada de usuario sanitizada
- Salida HTML escapada antes de renderizar

### RNF2: Accesibilidad
- WCAG 2.1 AA compliance
- Navegación por teclado completa
- Etiquetas ARIA apropiadas
- Ratios de contraste ≥ 4.5:1

### RNF3: Mantenibilidad
- TypeScript strict mode
- Componentes funcionales con hooks
- Código comentado explicando "por qué"
- Tests unitarios para funciones puras
- Tests de integración para flujos críticos

### RNF4: Escalabilidad
- Arquitectura preparada para agregar nuevas clases
- Datos en constantes para fácil actualización
- Servicios desacoplados
- Caché preparado para persistencia en BD

---

## 4. Restricciones

- **Navegador**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- **Dispositivos**: Mobile, Tablet, Desktop
- **API**: Gemini 2.5 Flash (modelo principal)
- **Datos**: 13 clases, 38 specs, 26 mazmorras (actuales)
- **Almacenamiento**: localStorage para favoritos (máx 5MB)

---

## 5. Dependencias

- React 19.2.0
- TypeScript 5.8
- Vite 6.2
- Google GenAI SDK 1.30
- Tailwind CSS (implícito)

---

## 6. Matriz de Trazabilidad

| RF | AC | CP | Tareas |
|---|---|---|---|
| RF1 | AC1 | CP1, CP11 | Implementar selección de clase |
| RF2 | AC2 | CP1, CP2 | Implementar selección de spec |
| RF3 | AC3 | CP3, CP12 | Implementar generación de guías |
| RF4 | AC4 | CP2 | Implementar filtrado de mazmorras |
| RF5 | AC5 | CP5, CP8 | Implementar roles de usuario |
| RF6 | AC6 | CP6 | Implementar renderizado markdown |
| RF7 | AC7 | CP7, CP9 | Implementar manejo de errores |
| RF8 | AC8 | CP10 | Implementar diseño responsivo |

---

## 7. Criterios de Éxito

- ✅ Todos los requisitos funcionales implementados
- ✅ Todos los requisitos no funcionales cumplidos
- ✅ 100% de aceptación criteria completado
- ✅ Todas las propiedades de corrección validadas
- ✅ Tests unitarios e integración con > 80% cobertura
- ✅ Performance targets cumplidos
- ✅ Accesibilidad WCAG 2.1 AA
- ✅ Cero vulnerabilidades de seguridad

---

## 8. Cambios Futuros

### Fase 2
- Soporte para PvP
- Integración con WoW API oficial
- Sistema de comentarios/feedback
- Exportación de guías (PDF)

### Fase 3
- Internacionalización (i18n)
- Addon de WoW integrado
- Sincronización en tiempo real
- Analytics y telemetría

### Fase 4
- Modelos fine-tuned para WoW
- Actualizaciones de conocimiento en tiempo real
- Integración con Discord
- Soporte para streaming
