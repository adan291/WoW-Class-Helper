# Hook: Validate Constants Data Structure

**Trigger**: When `constants.ts` is modified

**Description**: Automatically validate that game data in constants.ts maintains consistency with types.ts and catches data integrity issues.

**Validations**:
1. All WOW_CLASSES have valid IDs matching type definitions
2. Each class has at least one specialization
3. All specializations have valid role types (Tank, Healer, Damage)
4. All dungeons have valid expansion names
5. No duplicate class or dungeon entries
6. Color values are valid hex codes

**Actions**:
1. Parse constants.ts and types.ts
2. Cross-reference data structures
3. Report any mismatches or inconsistencies
4. Suggest corrections for invalid data

**Files Monitored**: `constants.ts`, `types.ts`

**Frequency**: On constants.ts save

**Notes**:
- Prevents runtime errors from data inconsistencies
- Ensures game data accuracy
- Catches typos in class/spec names
- Validates color format for UI rendering
