# WoW AI Class Helper - Kiro Configuration

This directory contains Kiro configuration files for the WoW AI Class Helper project, including specifications, design documents, steering guidelines, and automation hooks.

## Directory Structure

```
.kiro/
├── specs/                          # Feature specifications
│   ├── wow-class-helper.md        # Requirements and acceptance criteria
│   └── wow-class-helper-design.md # Architecture and design decisions
├── steering/                       # Project guidelines and standards
│   ├── project-standards.md       # Code style, conventions, and best practices
│   ├── gemini-api-guidelines.md   # API integration and prompt engineering
│   └── README.md                  # This file
└── hooks/                          # Automation hooks
    ├── on-file-save-lint.md       # Lint on TypeScript file save
    ├── on-gemini-service-update.md # Validate Gemini service changes
    ├── on-component-creation.md   # Component scaffolding template
    ├── on-constants-update.md     # Validate game data consistency
    ├── on-build-prepare.md        # Pre-build validation checks
    └── on-types-update.md         # Type definition consistency
```

## Specifications

### wow-class-helper.md

**Purpose**: Define what the application does and what users can do with it.

**Contains**:

- 8 acceptance criteria covering all major features
- Technical requirements and dependencies
- Data structure specifications
- Performance considerations
- Out-of-scope items

**Use When**:

- Planning new features
- Writing tests
- Validating implementation completeness

### wow-class-helper-design.md

**Purpose**: Explain how the application is built and why design decisions were made.

**Contains**:

- Component hierarchy and architecture
- State management strategy
- 10 correctness properties with implementations
- Integration points (Gemini API, LocalStorage)
- Performance optimizations
- Error handling strategy
- Security considerations
- Testing strategy
- Future enhancement roadmap

**Use When**:

- Implementing new features
- Debugging complex issues
- Optimizing performance
- Planning refactoring

## Steering Guidelines

### project-standards.md

**Purpose**: Establish coding standards and best practices for the entire project.

**Covers**:

- TypeScript conventions and strict mode
- React component patterns and hooks usage
- File organization and naming conventions
- UI/UX design system and responsive breakpoints
- Accessibility requirements
- WoW theming guidelines
- API integration patterns
- Data management and state handling
- Error handling and validation
- Testing strategies
- Performance optimization targets
- Documentation standards
- Security best practices
- Deployment procedures

**Automatically Applied To**: All files in the project

### gemini-api-guidelines.md

**Purpose**: Provide specific guidance for Gemini API integration and prompt engineering.

**Covers**:

- Model selection and configuration
- Prompt engineering best practices
- Ability tooltip format specification
- Source URL injection strategy
- Error handling for API failures
- Performance optimization and caching
- Security considerations for API keys
- Testing strategies with mock responses
- Future enhancement phases

**Automatically Applied To**: `services/geminiService.ts`

## Automation Hooks

Hooks automate repetitive tasks and enforce standards. They trigger on specific events:

### on-file-save-lint.md

- **Trigger**: TypeScript/TSX file save
- **Action**: Run diagnostics and report errors
- **Benefit**: Catch errors immediately during development

### on-gemini-service-update.md

- **Trigger**: `services/geminiService.ts` modification
- **Action**: Validate error handling and prompt structure
- **Benefit**: Prevent accidental removal of critical functionality

### on-component-creation.md

- **Trigger**: New `.tsx` file in `components/` directory
- **Action**: Scaffold component with proper TypeScript typing
- **Benefit**: Ensure consistency and save boilerplate time

### on-constants-update.md

- **Trigger**: `constants.ts` modification
- **Action**: Validate game data consistency with types
- **Benefit**: Catch data integrity issues early

### on-build-prepare.md

- **Trigger**: Before `npm run build`
- **Action**: Run comprehensive pre-build checks
- **Benefit**: Prevent shipping broken code to production

### on-types-update.md

- **Trigger**: `types.ts` modification
- **Action**: Check type usage and consistency
- **Benefit**: Keep codebase clean and maintainable

## Quick Reference

### When Starting Development

1. Read `specs/wow-class-helper.md` to understand requirements
2. Review `steering/project-standards.md` for coding conventions
3. Check `specs/wow-class-helper-design.md` for architecture

### When Adding a Feature

1. Update specs if requirements change
2. Follow component patterns in `project-standards.md`
3. Use hooks to validate your changes
4. Test against acceptance criteria

### When Integrating with Gemini API

1. Review `steering/gemini-api-guidelines.md`
2. Follow prompt engineering best practices
3. Implement proper error handling
4. Test with mock responses

### When Debugging

1. Check `specs/wow-class-helper-design.md` for correctness properties
2. Review error handling in `project-standards.md`
3. Validate data consistency with hooks
4. Check console logs and error messages

## Key Principles

### Correctness

- All features must meet acceptance criteria
- Correctness properties ensure consistent behavior
- Data integrity is validated automatically

### Consistency

- All code follows project standards
- Components follow established patterns
- Naming conventions are enforced

### Quality

- Errors are caught early via hooks
- Pre-build validation prevents production issues
- Type safety is enforced throughout

### Maintainability

- Clear documentation for all decisions
- Consistent code style across project
- Automated checks reduce manual review

## Integration with Kiro

These configuration files integrate with Kiro's features:

- **Specs**: Used for feature planning and implementation tracking
- **Steering**: Automatically applied to relevant files during development
- **Hooks**: Trigger automated checks and validations

To view or manage hooks in Kiro:

1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Search for "Open Kiro Hook UI"
3. View, create, or modify hooks

## Future Enhancements

### Phase 2

- Add E2E test specifications
- Create performance benchmarking guidelines
- Add deployment checklist

### Phase 3

- Add API documentation standards
- Create component library documentation
- Add accessibility audit procedures

### Phase 4

- Add monitoring and observability guidelines
- Create incident response procedures
- Add analytics tracking standards

## Support

For questions about:

- **Requirements**: See `specs/wow-class-helper.md`
- **Architecture**: See `specs/wow-class-helper-design.md`
- **Code Standards**: See `steering/project-standards.md`
- **API Integration**: See `steering/gemini-api-guidelines.md`
- **Automation**: See individual hook files in `hooks/`
