# Hook: Lint on File Save

**Trigger**: When a TypeScript/TSX file is saved

**Description**: Automatically check for TypeScript and linting errors whenever a code file is saved, providing immediate feedback on syntax and type issues.

**Actions**:

1. Run diagnostics on the saved file
2. Display any errors or warnings in the Problems panel
3. Suggest fixes for common issues

**Files Monitored**: `**/*.ts`, `**/*.tsx`

**Frequency**: On every save

**Notes**:

- Helps catch errors early before testing
- Integrates with Kiro's diagnostic tools
- Non-blocking (doesn't prevent save)
