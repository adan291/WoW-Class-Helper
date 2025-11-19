# Hook: Component Creation Template

**Trigger**: When a new `.tsx` file is created in the `components/` directory

**Description**: Automatically scaffold a new React component with proper TypeScript typing, prop interfaces, and project standards compliance.

**Template**:
```typescript
import React from 'react';

interface [ComponentName]Props {
  // Define props here
}

const [ComponentName]: React.FC<[ComponentName]Props> = ({ 
  // destructure props
}) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default [ComponentName];
```

**Actions**:
1. Create component file with proper structure
2. Add TypeScript interface for props
3. Include React.FC typing
4. Add export statement
5. Include placeholder JSX

**Files Affected**: `components/**/*.tsx`

**Frequency**: On new file creation

**Notes**:
- Ensures consistency across all components
- Enforces TypeScript best practices
- Saves time on boilerplate code
- Follows project naming conventions
