---
inclusion: always
---

# Steering Guidelines

This directory contains project-wide guidelines and standards that are automatically applied to relevant files during development.

## Files

### project-standards.md
**Scope**: All files in the project

Comprehensive coding standards covering:
- TypeScript conventions and strict mode
- React component patterns and hooks
- File organization and naming conventions
- UI/UX design system
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

**When to Reference**:
- Writing new components
- Implementing features
- Code reviews
- Refactoring existing code

### gemini-api-guidelines.md
**Scope**: `services/geminiService.ts`

Specific guidance for Gemini API integration:
- Model selection and configuration
- Prompt engineering best practices
- Ability tooltip format specification
- Source URL injection strategy
- Error handling for API failures
- Performance optimization and caching
- Security considerations for API keys
- Testing strategies with mock responses
- Future enhancement phases

**When to Reference**:
- Modifying Gemini service
- Creating new guide generation functions
- Implementing custom source URL features
- Debugging API integration issues

## How Steering Works

Steering files are automatically included in your development context based on:

1. **Always Included** (default):
   - `project-standards.md` - Applied to all files

2. **Conditionally Included** (fileMatch):
   - `gemini-api-guidelines.md` - Applied when editing `services/geminiService.ts`

3. **Manually Included** (via #):
   - Reference any steering file explicitly in chat with `#steering/filename.md`

## Quick Reference

### Code Style Questions
→ See `project-standards.md`

### API Integration Questions
→ See `gemini-api-guidelines.md`

### Component Patterns
→ See `project-standards.md` → React Components section

### Performance Optimization
→ See `project-standards.md` → Performance section

### Security Concerns
→ See `project-standards.md` → Security section

### Testing Strategy
→ See `project-standards.md` → Testing section

## Integration with Specs

These steering guidelines implement the design decisions from:
- `.kiro/specs/wow-class-helper-design.md` - Architecture and correctness properties
- `.kiro/specs/wow-class-helper.md` - Acceptance criteria

When implementing features:
1. Check specs for requirements
2. Follow steering guidelines for implementation
3. Validate against correctness properties
4. Use hooks for automated validation

## Updating Guidelines

When updating steering files:
1. Ensure changes align with project specs
2. Update related documentation
3. Communicate changes to team
4. Consider impact on existing code

## Examples

### Example 1: Adding a New Component
1. Read `project-standards.md` → React Components section
2. Follow the component structure pattern
3. Use TypeScript interfaces for props
4. Apply Tailwind classes from design system
5. Hook will validate on save

### Example 2: Modifying Gemini Service
1. Read `gemini-api-guidelines.md`
2. Ensure error handling is maintained
3. Follow prompt engineering best practices
4. Validate source URL handling
5. Hook will validate changes

### Example 3: Styling a New Feature
1. Read `project-standards.md` → UI/UX Standards
2. Use design system colors and spacing
3. Ensure responsive breakpoints
4. Check accessibility requirements
5. Validate contrast ratios

## Best Practices

- **Reference Early**: Check steering before starting work
- **Follow Patterns**: Use existing code as examples
- **Ask Questions**: If guidelines are unclear, ask for clarification
- **Keep Updated**: Review guidelines periodically for changes
- **Share Knowledge**: Help others understand the guidelines

## Support

For questions about:
- **Code Standards**: See `project-standards.md`
- **API Integration**: See `gemini-api-guidelines.md`
- **Architecture**: See `.kiro/specs/wow-class-helper-design.md`
- **Requirements**: See `.kiro/specs/wow-class-helper.md`
