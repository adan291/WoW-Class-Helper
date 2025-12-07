# Requirements Document

## Introduction

Ethernal Guild Manager es un sistema completo de gestión de guilds para World of Warcraft que permite a las guilds administrar aplicaciones de reclutamiento, roster de miembros, calendario de eventos, análisis de rendimiento con IA, y configuración personalizada. El sistema soporta múltiples roles de usuario (Guild Master, Officer, Member, User sin guild) con control de acceso basado en roles.

## Glossary

- **Guild**: Organización de jugadores en World of Warcraft con nombre, descripción y configuración personalizada
- **Application**: Solicitud de ingreso a una guild con información del jugador, clase, especialización y experiencia
- **Roster**: Lista de miembros activos de una guild con sus roles y rangos
- **Role**: Función del personaje en el juego (Tank, Healer, DPS)
- **UserRole**: Nivel de permisos del usuario (Administrator/Guild Master, Officer, Member, User)
- **WoW Class**: Clase de personaje en World of Warcraft (Warrior, Paladin, Hunter, etc.)
- **WoW Spec**: Especialización dentro de una clase (Arms, Fury, Protection para Warrior)
- **Item Level (ilvl)**: Nivel de equipo del personaje que indica su poder
- **Warcraft Logs**: Servicio externo para análisis de rendimiento en combate
- **Custom Question**: Pregunta personalizada definida por la guild para el formulario de aplicación
- **Guild Perk**: Beneficio o ventaja que ofrece la guild a sus miembros
- **Guild Event**: Evento programado de la guild (Raid, Mythic+, PvP, Social)

## Requirements

### Requirement 1

**User Story:** As a player, I want to apply to a guild, so that I can join an organized group for raiding and other activities.

#### Acceptance Criteria

1. WHEN a user visits the apply page THEN the System SHALL display a form with guild selection, character information fields, and custom guild questions
2. WHEN a user selects a WoW class THEN the System SHALL populate the specialization dropdown with valid specs for that class and display the class icon
3. WHEN a user submits an application with valid data THEN the System SHALL create a new application with PENDING status and display a portal animation confirmation
4. WHEN a user submits an application with invalid data (empty fields, invalid logs URL, item level below 450) THEN the System SHALL display specific validation errors and prevent submission
5. WHEN a user selects a guild THEN the System SHALL load that guild's custom questions, raid experience options, and availability slots

### Requirement 2

**User Story:** As a guild officer, I want to review and manage applications, so that I can recruit suitable players for the guild.

#### Acceptance Criteria

1. WHEN an officer views the admin page THEN the System SHALL display all applications for their guild with player name, class, role, item level, and status
2. WHEN an officer filters applications by class, role, status, raid experience, or availability THEN the System SHALL display only matching applications
3. WHEN an officer sorts applications by date or player name THEN the System SHALL reorder the list accordingly
4. WHEN an officer clicks on an application THEN the System SHALL display a modal with complete application details including custom question answers
5. WHEN an officer changes an application status (Pending, Accepted, Rejected) THEN the System SHALL update the status immediately and persist the change
6. WHEN an officer clicks edit on an application THEN the System SHALL navigate to the apply page pre-filled with application data for editing

### Requirement 3

**User Story:** As a guild member, I want to view the guild roster, so that I can see who is in the guild and their roles.

#### Acceptance Criteria

1. WHEN a member views the roster page THEN the System SHALL display all guild members with name, class, role, and rank
2. WHEN a member searches for a player by name THEN the System SHALL filter the roster to show matching members
3. WHEN a member sorts the roster by name, class, role, or rank THEN the System SHALL reorder the list with secondary sort by name
4. WHEN an officer or admin views the roster THEN the System SHALL display a notes button for each member
5. WHEN an officer edits member notes THEN the System SHALL save the notes and close the modal

### Requirement 4

**User Story:** As a guild officer, I want to manage guild events on a calendar, so that members can see scheduled activities.

#### Acceptance Criteria

1. WHEN a user views the calendar page THEN the System SHALL display a monthly calendar grid with events for the current month
2. WHEN a user navigates to previous or next month THEN the System SHALL update the calendar to show that month's events
3. WHEN an officer or admin clicks add event THEN the System SHALL display a modal form for creating a new event with title, date, type, and description
4. WHEN an officer creates an event THEN the System SHALL add the event to the calendar and display it on the corresponding day
5. WHEN an officer hovers over an event THEN the System SHALL display a delete button to remove the event
6. WHEN the current day is displayed THEN the System SHALL highlight it with a gold ring indicator

### Requirement 5

**User Story:** As a guild admin, I want to configure guild settings, so that I can customize the recruitment process and guild information.

#### Acceptance Criteria

1. WHEN an admin or officer visits guild settings THEN the System SHALL display editable fields for guild name, description, and officer email
2. WHEN an admin modifies the guild name THEN the System SHALL allow the change only for users with Administrator role
3. WHEN an officer adds or removes custom recruitment questions THEN the System SHALL update the questions list immediately
4. WHEN an officer modifies raid experience options or availability slots THEN the System SHALL update the respective lists
5. WHEN an officer adds or removes guild perks THEN the System SHALL update the perks list with title and description
6. WHEN an officer saves guild settings THEN the System SHALL persist all changes and display a success message

### Requirement 6

**User Story:** As a player, I want to analyze my combat performance using AI, so that I can improve my gameplay.

#### Acceptance Criteria

1. WHEN a user visits the performance analyzer THEN the System SHALL display a form to select class, spec, and provide log data via URL or file upload
2. WHEN a user submits valid log data THEN the System SHALL call the Gemini AI service and display a loading spinner
3. WHEN the AI analysis completes THEN the System SHALL display summary cards with average DPS, ability uptime, performance percentile, and downtime
4. WHEN the AI analysis completes THEN the System SHALL display an ability usage chart with class-colored bars
5. WHEN the AI analysis completes THEN the System SHALL display common errors, comparison comments, and actionable recommendations with spell icons
6. IF the AI service fails THEN the System SHALL display a localized error message with visual error indicator
7. WHEN a user clicks download PDF THEN the System SHALL trigger the browser print dialog for the analysis report

### Requirement 7

**User Story:** As a guild member, I want to view the guild dashboard, so that I can access guild features and see announcements.

#### Acceptance Criteria

1. WHEN a user without a guild visits the guild page THEN the System SHALL display a message prompting them to apply to a guild
2. WHEN a guild member visits the guild page THEN the System SHALL display the guild name, description, and user's rank
3. WHEN an officer or admin visits the guild page THEN the System SHALL display management options including guild settings and recruitment links
4. WHEN a user views the guild page THEN the System SHALL display recent announcements from Discord integration
5. WHEN a user clicks connect Discord THEN the System SHALL simulate OAuth flow and display connected Discord ID
6. WHEN a user views the guild page THEN the System SHALL display quick links to roster, perks, and calendar

### Requirement 8

**User Story:** As a user, I want to authenticate and manage my session, so that I can access guild features securely.

#### Acceptance Criteria

1. WHEN a user visits a protected route without authentication THEN the System SHALL redirect to the login page
2. WHEN a user logs in with valid credentials THEN the System SHALL authenticate the user and redirect to the guild dashboard
3. IF the login API fails THEN the System SHALL display an error message and allow retry
4. WHEN a user logs out THEN the System SHALL clear the session and redirect to the login page
5. WHEN an authenticated user accesses the application THEN the System SHALL display their name and avatar in the header

### Requirement 9

**User Story:** As a user, I want to switch between languages and themes, so that I can use the application in my preferred settings.

#### Acceptance Criteria

1. WHEN a user clicks the language switcher THEN the System SHALL toggle between English and Spanish and update all UI text
2. WHEN a user clicks the theme toggle THEN the System SHALL switch between light and dark themes
3. WHEN a user changes theme THEN the System SHALL persist the preference to localStorage and apply it on next visit
4. WHEN the application loads THEN the System SHALL detect system color scheme preference if no saved preference exists

### Requirement 10

**User Story:** As a guild member, I want to view guild perks, so that I can understand the benefits of membership.

#### Acceptance Criteria

1. WHEN a member visits the perks page THEN the System SHALL display guild-specific perks if configured, otherwise default perks
2. WHEN displaying guild-specific perks THEN the System SHALL show a badge indicating they are exclusive to that guild
3. WHEN displaying perks THEN the System SHALL show each perk with title and description in a card layout

## Non-Functional Requirements

### NFR1: Performance

- Initial page load SHALL complete in less than 3 seconds
- Form validation SHALL provide feedback in less than 100ms
- AI analysis SHALL complete in less than 10 seconds

### NFR2: Accessibility

- All interactive elements SHALL be keyboard navigable
- Color contrast ratios SHALL meet WCAG 2.1 AA standards (≥ 4.5:1)
- All images and icons SHALL have appropriate alt text or aria-labels

### NFR3: Security

- API keys SHALL never be exposed in client-side code
- User input SHALL be validated before processing
- Protected routes SHALL require authentication

### NFR4: Internationalization

- All user-facing text SHALL support English and Spanish translations
- Date and time formats SHALL respect locale settings
