# WoW AI Class Helper - Guía Rápida

## 🚀 Inicio Rápido

### 1. Setup Inicial
```bash
# Instalar dependencias
npm install

# Configurar API key
# Editar .env.local y agregar:
# GEMINI_API_KEY=tu_clave_aqui

# Ejecutar en desarrollo
npm run dev
```

### 2. Estructura del Proyecto

```
src/
├── App.tsx                 # Componente principal
├── index.tsx               # Punto de entrada
├── constants.ts            # Datos de clases, specs, dungeons
├── types.ts                # Tipos TypeScript
│
├── components/             # Componentes React
│   ├── ClassHub.tsx        # Hub principal
│   ├── ClassSelection.tsx  # Selección de clase
│   ├── ErrorBoundary.tsx   # Manejo de errores
│   └── icons/              # Iconos SVG
│
├── services/               # Lógica de negocio
│   ├── geminiService.ts    # Integración Gemini API
│   ├── cacheService.ts     # Caché de contenido
│   ├── markdownProcessor.ts # Procesamiento markdown
│   └── validationService.ts # Validación de datos
│
└── hooks/                  # Custom React hooks
    └── useGuideContent.ts  # Hook para guías
```

## 📚 Documentación

### Para Entender el Proyecto
1. **README.md** - Instrucciones de setup
2. **.kiro/specs/README.md** - Índice de especificaciones
3. **.kiro/steering/project-standards.md** - Estándares de código

### Para Implementar Features
1. **.kiro/specs/requirements-improved.md** - Qué debe hacer
2. **.kiro/specs/design-improved.md** - Cómo debe funcionar
3. **.kiro/specs/tasks-improved.md** - Tareas específicas

### Para Integración con Gemini
- **.kiro/steering/gemini-api-guidelines.md** - Guía de API

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo

# Build
npm run build            # Compilar para producción
npm run preview          # Previsualizar build

# Testing
npm test                 # Ejecutar tests una vez
npm run test:watch       # Modo watch para tests
```

## 🎯 Flujo de Trabajo

### Agregar una Nueva Feature
1. Leer requisito en `requirements-improved.md`
2. Revisar diseño en `design-improved.md`
3. Seguir estándares en `project-standards.md`
4. Implementar componente/servicio
5. Escribir tests
6. Validar contra correctness properties

### Debugging
1. Revisar error en consola
2. Identificar qué correctness property falla
3. Leer implementación en `design-improved.md`
4. Revisar test cases relacionados
5. Corregir y validar

## 📋 Checklist de Calidad

Antes de hacer commit:
- [ ] Código sigue `project-standards.md`
- [ ] Tests pasan: `npm test`
- [ ] No hay errores TypeScript
- [ ] Componentes son accesibles (WCAG 2.1 AA)
- [ ] Responsive en mobile/tablet/desktop
- [ ] Manejo de errores implementado
- [ ] Documentación actualizada

## 🔑 Conceptos Clave

### Correctness Properties (CP)
Propiedades matemáticas que garantizan corrección:
- CP1: Consistencia de clases/specs
- CP2: Precisión de filtrado de dungeons
- CP3: Consistencia de generación de contenido
- CP4: Persistencia de favoritos
- CP5: Inyección de fuentes personalizadas
- CP6: Fidelidad de renderizado markdown
- CP7: Recuperación de errores
- CP8: Control de acceso por rol
- CP9: Gestión de estados de carga
- CP10: Diseño responsivo
- CP11: Validación de precisión de datos
- CP12: Atribución de fuentes

### Acceptance Criteria (AC)
Requisitos funcionales del usuario:
- AC1: Descubrimiento de clases y especializaciones
- AC2: Selección de especialización y enrutamiento
- AC3: Generación de guías con verificación de fuentes
- AC4: Estrategias específicas de dungeons
- AC5: Roles de usuario y capacidades de admin
- AC6: Renderizado y formato de contenido
- AC7: Manejo y recuperación de errores
- AC8: Diseño responsivo y rendimiento

## 🚨 Troubleshooting

### "GEMINI_API_KEY no definida"
```bash
# Crear .env.local en la raíz
echo "GEMINI_API_KEY=tu_clave_aqui" > .env.local
```

### Tests fallan
```bash
# Limpiar caché y reinstalar
rm -r node_modules package-lock.json
npm install
npm test
```

### Build falla
```bash
# Verificar TypeScript
npx tsc --noEmit

# Limpiar dist
rm -r dist
npm run build
```

## 📞 Recursos

- **Gemini API**: https://ai.google.dev/
- **React Docs**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vitest**: https://vitest.dev/

## 🎓 Próximos Pasos

1. Leer `requirements-improved.md` para entender features
2. Revisar `design-improved.md` para arquitectura
3. Ejecutar `npm run dev` y explorar la app
4. Leer `project-standards.md` antes de escribir código
5. Implementar features siguiendo `tasks-improved.md`

---

**Última actualización**: Noviembre 19, 2025  
**Estado**: ✅ Proyecto limpio y listo para desarrollo
