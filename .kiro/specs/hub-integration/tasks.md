# Implementation Plan

## Phase 1: Add Guild Manager to Hub

- [x] 1. Update HubPage with Guild Manager tool card
  - [x] 1.1 Add Guild Manager to TOOLS array
    - Add new ToolCard with id 'guild-manager'
    - Set path to '/guild-manager'
    - Set icon to '🏰' and color to '#8B5CF6'
    - Add features: Applications, Roster, Calendar, Performance Analyzer
    - _Requirements: 1.1, 1.2_
  - [ ]\* 1.2 Write property test for tool cards count
    - **Property 1: Tool Cards Count**
    - **Validates: Requirements 1.1**
  - [ ]\* 1.3 Write property test for tool card data completeness
    - **Property 2: Tool Card Data Completeness**
    - **Validates: Requirements 1.2**

## Phase 2: Configure Routing

- [x] 2. Add Guild Manager route to AppRouter
  - [x] 2.1 Add lazy import for Ethernal App
    - Import from './Ethernal/App' with React.lazy
    - _Requirements: 2.2, 3.2_
  - [x] 2.2 Add /guild-manager route
    - Create Route with path="/guild-manager"
    - Wrap with ProtectedRoute (requireAuth=false initially)
    - Use Suspense with ModuleLoader fallback
    - _Requirements: 2.1, 2.3, 3.3_
  - [ ]\* 2.3 Write property test for tool card navigation accuracy
    - **Property 3: Tool Card Navigation Accuracy**
    - **Validates: Requirements 1.4, 2.1**

## Phase 3: Add Hub Navigation to Ethernal

- [x] 3. Update Ethernal App with Hub link
  - [x] 3.1 Add Hub link to Ethernal header
    - Add Link component to "/" in the header navigation
    - Style consistently with existing navigation
    - _Requirements: 4.1, 4.2_
  - [ ]\* 3.2 Write property test for Hub link presence
    - **Property 4: Hub Link Presence in Modules**
    - **Validates: Requirements 4.1**

## Phase 4: Update Coming Soon Section

- [x] 4. Update Hub coming soon section
  - [x] 4.1 Remove Guild Manager from coming soon (if present)
    - Update the "More tools coming soon" section
    - Keep M+ Timer, Raid Planner, Achievement Tracker as coming soon
    - _Requirements: 1.1_

## Phase 5: Testing and Verification

- [ ] 5. Integration testing
  - [ ]\* 5.1 Write integration test for Hub to Guild Manager navigation
    - Test clicking Guild Manager card navigates to /guild-manager
    - Test Ethernal App renders correctly
    - _Requirements: 2.1, 2.2_
  - [ ]\* 5.2 Write integration test for Guild Manager to Hub navigation
    - Test clicking Hub link returns to /
    - _Requirements: 4.2_

- [x] 6. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
