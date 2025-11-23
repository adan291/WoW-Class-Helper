# Hook: Pre-Build Validation

**Trigger**: Before running `npm run build`

**Description**: Automatically run comprehensive checks before building to catch issues early and ensure production-ready code.

**Checks**:

1. TypeScript compilation check (no type errors)
2. All required environment variables present
3. No console.log statements in production code (except errors)
4. No TODO or FIXME comments in critical files
5. All imports are resolvable
6. No unused variables or imports
7. Verify Gemini API key is configured

**Actions**:

1. Run `tsc --noEmit` for type checking
2. Scan for environment variable usage
3. Check for debug statements
4. Validate import paths
5. Report any issues and block build if critical

**Command**: `npm run build`

**Frequency**: Before each build

**Notes**:

- Prevents shipping broken code to production
- Catches configuration issues early
- Ensures code quality standards
- Saves debugging time in production
