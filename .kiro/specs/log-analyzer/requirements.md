# Requirements Document

## Introduction

Log Analyzer es un módulo de análisis de logs de combate de World of Warcraft que permite a los jugadores cargar archivos de log, visualizar habilidades enemigas y de jugadores, ver una línea de tiempo del encuentro, generar estrategias con IA, y practicar mecánicas en un mini-juego interactivo. El sistema utiliza Gemini AI para clasificación inteligente de habilidades y generación de estrategias.

## Glossary

- **Combat Log**: Archivo de texto generado por WoW que registra todos los eventos de combate (CLEU format)
- **CLEU**: Combat Log Event Unfiltered - formato estándar de logs de WoW
- **Spell**: Habilidad o hechizo usado en combate
- **SpellStats**: Estadísticas agregadas de una habilidad (daño, frecuencia, objetivos)
- **LogSummary**: Resumen procesado de un log de combate
- **Encounter**: Encuentro de combate (generalmente un boss)
- **Role**: Función del jugador (Tank, Healer, Melee DPS, Ranged DPS)
- **Hostile Spell**: Habilidad usada por enemigos contra jugadores
- **Friendly Spell**: Habilidad usada por jugadores contra enemigos
- **Timeline**: Visualización temporal de eventos de combate
- **Mini-Game**: Juego de práctica de mecánicas basado en el encuentro

## Requirements

### Requirement 1

**User Story:** As a player, I want to upload a combat log file, so that I can analyze my raid or dungeon performance.

#### Acceptance Criteria

1. WHEN a user visits the upload page THEN the System SHALL display a drag-and-drop area and file input for .txt and .log files
2. WHEN a user uploads a valid combat log file THEN the System SHALL parse the file and extract encounter information, spells, and combatants
3. WHEN a user uploads an empty file (0 bytes) THEN the System SHALL display an error message indicating the file is empty
4. WHEN a user uploads a file with no valid WoW combat log events THEN the System SHALL display an error message indicating no valid events found
5. WHEN parsing fails for any reason THEN the System SHALL display a user-friendly error message and allow retry
6. WHEN a user clicks "Load Demo Data" THEN the System SHALL load mock Ragnaros encounter data for demonstration

### Requirement 2

**User Story:** As a player, I want to view abilities categorized by role, so that I can understand which mechanics affect each role.

#### Acceptance Criteria

1. WHEN a user views the Abilities tab THEN the System SHALL display hostile spells categorized by role (Tank, Healer, Melee, Ranged)
2. WHEN the Gemini API key is configured THEN the System SHALL use AI to classify spells by role and provide descriptions
3. WHEN the Gemini API key is not configured THEN the System SHALL use fallback heuristics (high damage = Tank, multi-target = Healer, etc.)
4. WHEN a user manually reclassifies a spell THEN the System SHALL update the spell's role assignment immediately
5. WHEN a user searches for a spell by name THEN the System SHALL filter the displayed spells to match the search term (case-insensitive)
6. WHEN a user filters by role THEN the System SHALL display only spells assigned to that role
7. WHEN a user switches to "Outgoing" view THEN the System SHALL display player damage spells sorted by total damage

### Requirement 3

**User Story:** As a player, I want to view a timeline of abilities, so that I can understand the encounter's pacing and mechanics timing.

#### Acceptance Criteria

1. WHEN a user views the Timeline tab THEN the System SHALL display a horizontal timeline with time markers
2. WHEN displaying the timeline THEN the System SHALL show each hostile spell as a row with cast events as dots
3. WHEN displaying cast events THEN the System SHALL size the dots relative to the spell's average damage
4. WHEN a user hovers over a cast event THEN the System SHALL display a tooltip with spell name, time, and damage

### Requirement 4

**User Story:** As a player, I want AI-generated strategy guides, so that I can learn how to handle encounter mechanics.

#### Acceptance Criteria

1. WHEN a user views the Strategy tab THEN the System SHALL call Gemini AI to generate a phase-by-phase strategy guide
2. WHEN the AI generates a strategy THEN the System SHALL display it in formatted Markdown with phases, spell handling, and role-specific advice
3. WHEN the Gemini API key is not configured THEN the System SHALL display a message indicating an API key is required
4. IF the AI generation fails THEN the System SHALL display an error message with the failure reason

### Requirement 5

**User Story:** As a player, I want to practice encounter mechanics in a mini-game, so that I can improve my reaction time.

#### Acceptance Criteria

1. WHEN a user views the Practice tab THEN the System SHALL call Gemini AI to generate a mini-game configuration based on encounter spells
2. WHEN the mini-game starts THEN the System SHALL display a 2D arena with the player character
3. WHEN mechanics spawn THEN the System SHALL display visual indicators (dodge = avoid, soak = stand in)
4. WHEN the player takes damage THEN the System SHALL update the health bar and display damage numbers
5. WHEN the Gemini API key is not configured THEN the System SHALL use default fallback mechanics

### Requirement 6

**User Story:** As a player, I want to navigate between analysis tabs, so that I can access different views of my combat data.

#### Acceptance Criteria

1. WHEN data is loaded THEN the System SHALL enable navigation to Abilities, Timeline, Strategy, and Practice tabs
2. WHEN no data is loaded THEN the System SHALL disable navigation tabs except Upload
3. WHEN a user clicks a tab THEN the System SHALL display the corresponding content
4. WHEN data is loaded THEN the System SHALL display encounter name, duration, and event count in the header

### Requirement 7

**User Story:** As a player, I want the log parser to extract accurate data, so that my analysis is reliable.

#### Acceptance Criteria

1. WHEN parsing a log file THEN the System SHALL extract the encounter name from ENCOUNTER_START events
2. WHEN parsing SPELL_DAMAGE events THEN the System SHALL aggregate damage by spell and calculate averages
3. WHEN parsing SPELL_CAST_SUCCESS events THEN the System SHALL track cast counts and timestamps
4. WHEN parsing events THEN the System SHALL categorize spells as hostile (from Creature/Boss) or friendly (from Player)
5. WHEN parsing events THEN the System SHALL track unique targets for each spell
6. WHEN parsing completes THEN the System SHALL calculate encounter duration from first to last event

## Non-Functional Requirements

### NFR1: Performance

- Log file parsing SHALL complete in less than 5 seconds for files up to 10MB
- AI classification SHALL complete in less than 10 seconds
- Timeline rendering SHALL maintain 60fps for up to 100 spell types

### NFR2: Reliability

- Parser SHALL handle malformed lines gracefully without crashing
- AI service failures SHALL not prevent manual analysis features from working

### NFR3: Usability

- Error messages SHALL be user-friendly and actionable
- Loading states SHALL be displayed during async operations
- Demo data SHALL be available for users without log files

### NFR4: Security

- Gemini API key SHALL be stored in environment variables only
- Log file content SHALL be processed client-side only (no server upload)
