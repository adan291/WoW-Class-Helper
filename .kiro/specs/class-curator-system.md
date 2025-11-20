# Class Curator System Specification

## Overview

The Class Curator System is an orchestration layer that ensures all data passed to the Gemini API is accurate, current, and verified against authoritative WoW sources. It prevents AI hallucinations by validating class data, specializations, and patch information before guide generation.

## Architecture

### Core Components

#### 1. Data Curator Service (`services/dataCurator.ts`)
**Purpose**: Manages class data validation and source verification

**Key Features**:
- Maintains curator configuration for each WoW class
- Tracks data sources (Blizzard, Wowhead, Icy Veins, etc.)
- Monitors data integrity scores (0-100)
- Tracks last update timestamps
- Validates data freshness

**Primary Sources** (by priority):
1. Blizzard Official Patch Notes
2. WoW Class Forums
3. Wowhead Class Guides
4. Icy Veins Guides
5. Method Guides
6. Raider.io Community

**Key Functions**:
- `validateClassData(classId)` - Returns curator report with status
- `getVerifiedSources(classId)` - Gets active source URLs for a class
- `updateClassCuratorData(classId, updates)` - Updates curator metadata
- `needsDataRefresh(classId, patchVersion)` - Checks if refresh needed

#### 2. Data Integrity Validator (`services/dataIntegrityValidator.ts`)
**Purpose**: Validates data structure and accuracy

**Key Features**:
- Validates WoW class existence and structure
- Validates specialization data
- Validates dungeon information
- Calculates data quality metrics
- Generates integrity reports

**Validation Checks**:
- Class ID exists in constants
- Class has required fields (name, color, specs)
- Specializations have valid roles (Tank, Healer, Damage)
- Dungeons exist and have expansion info
- Data integrity scores >= 80%

**Key Functions**:
- `validateWowClass(classId)` - Validates class data
- `validateSpecialization(classId, specId)` - Validates spec data
- `validateDungeon(dungeonName)` - Validates dungeon data
- `validateGuideRequest(classId, specId?, dungeonName?)` - Full validation
- `calculateDataQualityMetrics()` - Overall quality assessment

#### 3. Patch Monitor Service (`services/patchMonitor.ts`)
**Purpose**: Tracks WoW patch updates and affected classes

**Key Features**:
- Maintains patch history with release dates
- Tracks which classes/specs are affected by patches
- Monitors current patch version
- Generates patch update reports

**Patch Information Tracked**:
- Version number
- Release date
- Expansion
- Major changes
- Affected classes
- Affected specializations

**Key Functions**:
- `getCurrentPatchVersion()` - Gets active patch
- `updateCurrentPatchVersion(newVersion)` - Updates patch
- `wasClassAffectedByLatestPatch(classId)` - Checks if class needs refresh
- `checkForPatchUpdates(previousPatch)` - Detects new patches
- `addNewPatch(patchInfo)` - Adds new patch to history

#### 4. Class Orchestrator Service (`services/classOrchestratorService.ts`)
**Purpose**: Main orchestration layer coordinating all validation

**Key Features**:
- Coordinates curator, validator, and patch monitor
- Prepares Gemini-ready contexts
- Generates comprehensive reports
- Validates complete guide requests

**Key Functions**:
- `orchestrateClassCheck(classId)` - Full class validation
- `prepareGeminiContext(context)` - Prepares verified context for API
- `validateAndPrepareGuideRequest(...)` - Validates guide request
- `generateOrchestratorReport()` - Full system report
- `generateHealthCheckReport()` - System health status

### React Integration

#### Hook: `useClassOrchestrator`
**Purpose**: React hook for component integration

**Features**:
- Auto-validation on mount
- Real-time validation status
- Health check reporting
- Callback support for validation changes

**Usage**:
```typescript
const {
  isValid,
  orchestratorStatus,
  geminiContext,
  issues,
  warnings,
  validateGuideRequest,
} = useClassOrchestrator({ autoValidate: true });
```

#### Hook: `useGuideValidation`
**Purpose**: Simplified validation for specific guide requests

**Usage**:
```typescript
const { isValid, context, errors } = useGuideValidation(
  classId,
  specId,
  dungeonName
);
```

#### Component: `CuratorDashboard`
**Purpose**: Admin interface for curator management

**Features**:
- System health overview
- Data quality metrics
- Class status details
- Patch information
- Recommendations
- Auto-refresh capability

## Data Flow

### Guide Generation Flow

```
User Request
    ↓
validateAndPrepareGuideRequest()
    ↓
orchestrateClassCheck()
    ├→ validateClassData() [Curator]
    ├→ validateGuideRequest() [Validator]
    └→ checkForPatchUpdates() [Patch Monitor]
    ↓
prepareGeminiContext()
    ├→ getVerifiedSources()
    └→ Merge custom sources
    ↓
GeminiReadyContext
    ↓
Gemini API Call
```

### Validation Checks

1. **Class Validation**
   - Class exists in WOW_CLASSES
   - Has required fields
   - Curator status is not critical

2. **Specialization Validation**
   - Spec exists for class
   - Has valid role
   - Data is current

3. **Dungeon Validation**
   - Dungeon exists in DUNGEONS
   - Has expansion info
   - Is current season

4. **Patch Validation**
   - Check if class affected by latest patch
   - Verify data freshness
   - Flag if refresh needed

5. **Data Quality Validation**
   - Integrity score >= 80%
   - No critical curator issues
   - All sources active

## Status Levels

### Curator Status
- **healthy**: All checks pass, data is current
- **warning**: Minor issues, data may need review
- **critical**: Major issues, data should not be used

### Validation Confidence
- **100%**: All checks pass, all sources verified
- **80-99%**: Minor warnings, safe to use
- **<80%**: Should not be used for Gemini

### System Health
- **healthy**: All classes ready, no critical issues
- **warning**: Some classes have issues
- **critical**: Multiple classes affected, immediate action needed

## Integration with Gemini Service

### Modified Flow

```typescript
// Before: Direct API call
const guide = await getSpecGuide(wowClass, spec, sourceUrls);

// After: Validated API call
const validation = validateAndPrepareGuideRequest(
  classId,
  specId,
  undefined,
  sourceUrls
);

if (validation.isValid && validation.context) {
  const guide = await getSpecGuide(
    wowClass,
    spec,
    validation.context.verifiedSourceUrls.join('\n')
  );
}
```

## Maintenance Tasks

### Daily
- Monitor system health via `generateHealthCheckReport()`
- Check for critical issues
- Review curator reports

### Weekly
- Update patch information when new patches release
- Refresh class data if affected by patches
- Review data quality metrics

### Monthly
- Comprehensive data audit
- Update source URLs if needed
- Review and update curator configurations

### As Needed
- Add new classes/specs
- Update dungeon information
- Adjust data quality thresholds
- Add new data sources

## Configuration

### Adding a New Class Curator

```typescript
// In CLASS_CURATOR_CONFIG
warrior: {
  classId: 'warrior',
  className: 'Warrior',
  lastUpdated: new Date(),
  patchVersion: '11.0.0',
  sources: PRIMARY_SOURCES.official.concat(PRIMARY_SOURCES.community),
  dataIntegrity: 95,
  validationStatus: 'valid',
  notes: ['Notes about the class'],
}
```

### Adding a New Patch

```typescript
addNewPatch({
  version: '11.1.0',
  releaseDate: new Date('2024-12-10'),
  expansion: 'The War Within',
  majorChanges: ['Change 1', 'Change 2'],
  affectedClasses: ['warrior', 'paladin'],
  affectedSpecs: ['arms', 'fury', 'holy_paladin'],
});
```

## Error Handling

### Validation Failures
- Return detailed error messages
- Suggest remediation steps
- Log to console for debugging
- Prevent Gemini API calls

### Data Quality Issues
- Flag in curator report
- Suggest data refresh
- Provide alternative sources
- Alert admin via dashboard

### Patch Updates
- Detect new patches automatically
- Flag affected classes
- Recommend guide updates
- Track update status

## Future Enhancements

### Phase 2
- Automated source URL validation
- Real-time patch detection
- Scheduled data refresh jobs
- Email alerts for critical issues

### Phase 3
- Integration with WoW API
- Automatic class balance tracking
- Ability tooltip validation
- Talent tree verification

### Phase 4
- Machine learning for data quality prediction
- Automated source reliability scoring
- Predictive patch impact analysis
- Community feedback integration

## Testing

### Unit Tests
- Validate class/spec/dungeon validation
- Test curator status calculations
- Test patch detection logic
- Test data quality metrics

### Integration Tests
- Test full orchestration flow
- Test Gemini context preparation
- Test hook integration
- Test dashboard rendering

### Manual Testing
- Verify curator dashboard displays correctly
- Test validation with invalid data
- Test patch update scenarios
- Test custom source URL injection

## Monitoring

### Key Metrics
- System health status
- Data quality scores
- Class readiness percentage
- Validation success rate
- Average validation time

### Alerts
- Critical issues detected
- Data quality below threshold
- Patch updates available
- Source unavailability
- Validation failures

## Documentation

- This spec file
- Inline code comments
- Hook usage examples
- Component prop documentation
- Service function documentation
