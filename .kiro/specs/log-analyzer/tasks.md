# Implementation Plan

## Phase 1: Project Setup and Core Parser

- [ ] 1. Set up testing infrastructure for Log Analyzer
  - [ ] 1.1 Configure vitest for the log-analyzer module
    - Add test configuration for modules/log-analyzer
    - Create test utilities for generating mock log data
    - _Requirements: Testing Strategy_
  - [ ]\* 1.2 Create mock log generators for property tests
    - Generate valid CLEU format log lines
    - Generate various event types (SPELL_DAMAGE, SPELL_CAST_SUCCESS, ENCOUNTER_START)
    - _Requirements: Testing Strategy_

- [ ] 2. Implement and test log parser core functions
  - [ ] 2.1 Extract parseLogFile validation logic into testable functions
    - Create validateFileSize function
    - Create validateLogContent function
    - _Requirements: 1.3, 1.4_
  - [ ]\* 2.2 Write property test for empty file rejection
    - **Property 2: Empty File Rejection**
    - **Validates: Requirements 1.3**
  - [ ]\* 2.3 Write property test for invalid log rejection
    - **Property 3: Invalid Log Rejection**
    - **Validates: Requirements 1.4**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Log Parsing Logic

- [ ] 4. Implement spell category classification
  - [ ] 4.1 Extract category classification into testable function
    - Create classifySpellCategory function based on GUID prefix
    - _Requirements: 7.4_
  - [ ]\* 4.2 Write property test for spell category classification
    - **Property 4: Spell Category Classification**
    - **Validates: Requirements 7.4**

- [ ] 5. Implement damage aggregation
  - [ ] 5.1 Extract damage aggregation into testable function
    - Create aggregateSpellDamage function
    - Ensure avgDamage = totalDamage / count
    - _Requirements: 7.2_
  - [ ]\* 5.2 Write property test for damage aggregation accuracy
    - **Property 12: Damage Aggregation Accuracy**
    - **Validates: Requirements 7.2**

- [ ] 6. Implement encounter name extraction
  - [ ] 6.1 Extract encounter parsing into testable function
    - Create extractEncounterName function
    - _Requirements: 7.1_
  - [ ]\* 6.2 Write property test for encounter name extraction
    - **Property 14: Encounter Name Extraction**
    - **Validates: Requirements 7.1**

- [ ] 7. Implement log parsing validity
  - [ ] 7.1 Create comprehensive parseLogText function
    - Calculate duration as endTime - startTime
    - Track rawLineCount for valid events
    - _Requirements: 1.2, 7.6_
  - [ ]\* 7.2 Write property test for log parsing validity
    - **Property 1: Log Parsing Validity**
    - **Validates: Requirements 1.2, 7.6**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Abilities Tab Filtering

- [ ] 9. Implement spell search filtering
  - [ ] 9.1 Create filterSpellsBySearch utility function
    - Implement case-insensitive name matching
    - _Requirements: 2.5_
  - [ ]\* 9.2 Write property test for spell search filter accuracy
    - **Property 5: Spell Search Filter Accuracy**
    - **Validates: Requirements 2.5**

- [ ] 10. Implement role filtering
  - [ ] 10.1 Create getSpellsForRole utility function
    - Filter by role from AI classifications
    - _Requirements: 2.6_
  - [ ]\* 10.2 Write property test for role filter accuracy
    - **Property 6: Role Filter Accuracy**
    - **Validates: Requirements 2.6**

- [ ] 11. Implement outgoing spells sorting
  - [ ] 11.1 Create sortOutgoingSpells utility function
    - Sort by totalDamage descending
    - _Requirements: 2.7_
  - [ ]\* 11.2 Write property test for outgoing spells sort order
    - **Property 7: Outgoing Spells Sort Order**
    - **Validates: Requirements 2.7**

- [ ] 12. Implement manual reclassification
  - [ ] 12.1 Create handleManualRoleChange function
    - Update classifications state immediately
    - _Requirements: 2.4_
  - [ ]\* 12.2 Write property test for manual reclassification persistence
    - **Property 8: Manual Reclassification Persistence**
    - **Validates: Requirements 2.4**

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Timeline and Navigation

- [ ] 14. Implement timeline dot size calculation
  - [ ] 14.1 Create calculateDotSize utility function
    - Size proportional to avgDamage / maxDamage
    - Clamp between minSize and maxSize
    - _Requirements: 3.3_
  - [ ]\* 14.2 Write property test for timeline dot size proportionality
    - **Property 9: Timeline Dot Size Proportionality**
    - **Validates: Requirements 3.3**

- [ ] 15. Implement unique targets tracking
  - [ ] 15.1 Verify Set usage for target uniqueness
    - Ensure targets are stored in Set<string>
    - _Requirements: 7.5_
  - [ ]\* 15.2 Write property test for unique targets tracking
    - **Property 13: Unique Targets Tracking**
    - **Validates: Requirements 7.5**

- [ ] 16. Implement tab state management
  - [ ] 16.1 Create isTabEnabled utility function
    - Enable all tabs when data is loaded
    - Disable non-Upload tabs when data is null
    - _Requirements: 6.1, 6.2_
  - [ ]\* 16.2 Write property test for tab state based on data
    - **Property 10: Tab State Based on Data**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: AI Service and Fallbacks

- [ ] 18. Implement API key fallback behavior
  - [ ] 18.1 Create getAI utility with null return for missing key
    - Return null when VITE_GEMINI_API_KEY is not set
    - _Requirements: 2.3, 4.3, 5.5_
  - [ ] 18.2 Implement fallback responses in all AI functions
    - classifySpellsByRole: return empty object
    - generateStrategy: return "No API Key" message
    - generateMiniGameConfig: return default mechanics
    - _Requirements: 2.3, 4.3, 5.5_
  - [ ]\* 18.3 Write property test for API key fallback behavior
    - **Property 11: API Key Fallback Behavior**
    - **Validates: Requirements 2.3, 4.3, 5.5**

## Phase 6: Mini-Game Logic

- [ ] 19. Implement mini-game health system
  - [ ] 19.1 Create applyDamage utility function
    - Decrease health by damage amount
    - Clamp to minimum of 0
    - _Requirements: 5.4_
  - [ ]\* 19.2 Write property test for mini-game health update
    - **Property 15: Mini-Game Health Update**
    - **Validates: Requirements 5.4**

## Phase 7: Integration Testing

- [ ] 20. Integration tests
  - [ ]\* 20.1 Write integration tests for file upload flow
    - Test valid file upload and parsing
    - Test error handling for invalid files
    - _Requirements: 1.1-1.6_
  - [ ]\* 20.2 Write integration tests for abilities tab
    - Test search, filter, and sort functionality
    - Test manual reclassification
    - _Requirements: 2.1-2.7_
  - [ ]\* 20.3 Write integration tests for AI services
    - Test with mocked Gemini responses
    - Test fallback behavior
    - _Requirements: 4.1-4.4, 5.1-5.5_

- [ ] 21. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
