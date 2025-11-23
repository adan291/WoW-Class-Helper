# Hook: Type Definition Consistency Check

**Trigger**: When `types.ts` is modified

**Description**: Automatically verify that type definitions are used consistently across the codebase and catch orphaned or unused types.

**Validations**:

1. All exported types are used in at least one file
2. No circular type dependencies
3. Type names follow PascalCase convention
4. All interface properties are documented
5. Union types are properly defined
6. Generic types have proper constraints

**Actions**:

1. Scan all `.ts` and `.tsx` files for type usage
2. Identify unused type definitions
3. Check for naming convention violations
4. Verify type imports in components
5. Report unused types and suggest removal

**Files Monitored**: `types.ts`, `**/*.tsx`, `**/*.ts`

**Frequency**: On types.ts save

**Notes**:

- Keeps codebase clean and maintainable
- Prevents type pollution
- Ensures consistency across project
- Helps with refactoring and cleanup
