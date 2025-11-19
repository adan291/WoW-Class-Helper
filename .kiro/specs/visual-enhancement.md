# WoW AI Class Helper - Visual Enhancement Spec

**Status**: Planning  
**Priority**: High  
**Scope**: UI/UX improvements with WoW theming

---

## Vision

Enhance the visual design to blend **World of Warcraft aesthetics** with **modern/futuristic UI**, creating an immersive experience that feels both authentic to WoW and cutting-edge.

---

## Design Goals

1. **WoW Authenticity**: Use iconic WoW visual elements (class colors, armor styles, fantasy elements)
2. **Modern Futurism**: Maintain sleek, contemporary design with smooth animations
3. **Visual Hierarchy**: Clear, intuitive navigation with visual depth
4. **Immersion**: Dark fantasy atmosphere with glowing accents
5. **Performance**: Keep animations smooth and lightweight

---

## Proposed Enhancements

### 1. Class Icons & Visuals

#### Current State
- Simple SVG icons for classes
- Basic color coding

#### Proposed Improvements
- **Enhanced Class Icons**: More detailed, WoW-style icons with:
  - Armor/weapon silhouettes
  - Class-specific symbols (runes, spells, etc.)
  - Glowing effects matching class colors
  - Hover animations with scale and glow

- **Class Cards**: Replace simple buttons with:
  - Large class icon with glow effect
  - Class name with fantasy font
  - Role indicator (Tank/Healer/DPS)
  - Spec count badge
  - Hover: Lift effect, enhanced glow, spec preview

- **Color Palette**: Use official WoW class colors:
  - Warrior: #C79C6E (Bronze)
  - Paladin: #F58CBA (Pink)
  - Hunter: #ABD473 (Green)
  - Rogue: #FFF569 (Yellow)
  - Priest: #FFFFFF (White)
  - Death Knight: #C41E3A (Red)
  - Shaman: #0070DD (Blue)
  - Mage: #3FC7EB (Cyan)
  - Warlock: #9482CA (Purple)
  - Monk: #00FF96 (Jade)
  - Druid: #FF7D0A (Orange)
  - Demon Hunter: #A335EE (Violet)
  - Evoker: #33937F (Teal)

### 2. Header & Navigation

#### Current State
- Simple header with title and role selector

#### Proposed Improvements
- **Animated Header**:
  - WoW-style logo with glow effect
  - Animated background with subtle parallax
  - Role selector with icon indicators
  - Admin mode indicator with special styling

- **Navigation Tabs**:
  - Icons + text for each tab
  - Animated underline on active tab
  - Hover effects with color transitions
  - Tab icons match class color

### 3. Class Hub Layout

#### Current State
- Basic grid layout with tabs

#### Proposed Improvements
- **Hero Section**:
  - Large class icon with glow
  - Class name with fantasy font
  - Spec selector with visual cards
  - Animated background matching class color

- **Tab Navigation**:
  - Larger, more prominent tabs
  - Icon + text combination
  - Smooth transitions between tabs
  - Active tab has glow effect

- **Content Area**:
  - Bordered frame with WoW-style edges
  - Subtle background pattern
  - Glowing borders matching class color
  - Smooth scroll animations

### 4. Specialization Display

#### Current State
- Simple spec buttons

#### Proposed Improvements
- **Spec Cards**:
  - Spec icon with glow
  - Spec name with role indicator
  - Description text
  - Hover: Lift effect, enhanced glow
  - Active: Glowing border, background highlight

- **Role Indicators**:
  - Tank: Shield icon + color
  - Healer: Cross/plus icon + color
  - DPS: Sword icon + color
  - Support: Star icon + color

### 5. Guide Content Display

#### Current State
- Plain markdown rendering

#### Proposed Improvements
- **Content Frame**:
  - WoW-style border with corner decorations
  - Glowing edges matching class color
  - Subtle background texture
  - Smooth animations on load

- **Typography**:
  - Fantasy font for headers (e.g., "Exo" or similar)
  - Better spacing and hierarchy
  - Highlighted ability names with tooltips
  - Stat priorities with visual indicators

- **Visual Elements**:
  - Ability icons with tooltips
  - Stat priority bars with class colors
  - Talent tree visualization (if applicable)
  - Dungeon difficulty indicators

### 6. Animations & Effects

#### Proposed Animations
- **Glow Effects**: Class-colored glows on hover/active
- **Lift Effects**: Cards lift on hover with shadow
- **Fade Transitions**: Smooth fade between tabs
- **Pulse Effects**: Subtle pulse on important elements
- **Shimmer Effects**: Shimmer on class icons
- **Parallax**: Subtle parallax on background

#### Performance Considerations
- Use CSS animations (GPU accelerated)
- Debounce hover effects
- Lazy load animations
- Reduce motion option for accessibility

### 7. Dark Theme Enhancement

#### Current State
- Basic dark gray background

#### Proposed Improvements
- **Layered Backgrounds**:
  - Deep dark base (#0a0e27)
  - Slightly lighter panels (#1a1f3a)
  - Accent colors with transparency
  - Subtle gradients

- **Lighting Effects**:
  - Glowing borders on interactive elements
  - Subtle shadows for depth
  - Class-colored accent lighting
  - Neon-like effects on active elements

- **Texture & Patterns**:
  - Subtle noise texture
  - WoW-inspired patterns (runes, armor)
  - Gradient overlays
  - Animated background elements

### 8. Admin Panel Enhancement

#### Current State
- Basic yellow-themed admin panel

#### Proposed Improvements
- **Admin Styling**:
  - More prominent admin indicator
  - Special admin-only visual effects
  - Enhanced configuration UI
  - Admin-specific color scheme (gold/purple)

- **Admin Features**:
  - Visual URL validation feedback
  - Admin-only animations
  - Special admin mode badge
  - Enhanced error messages for admin

### 9. Error & Loading States

#### Current State
- Basic loading spinner and error messages

#### Proposed Improvements
- **Loading States**:
  - Animated WoW-style loading spinner
  - Class-colored loading bar
  - Shimmer effect on content placeholders
  - Loading text with animation

- **Error States**:
  - Class-colored error borders
  - Animated error icons
  - Enhanced error messages with icons
  - Retry button with hover effects

### 10. Responsive Design Enhancement

#### Current State
- Basic responsive layout

#### Proposed Improvements
- **Mobile Optimizations**:
  - Touch-friendly card sizes
  - Simplified animations on mobile
  - Optimized font sizes
  - Better spacing for mobile

- **Tablet Optimizations**:
  - Balanced layout
  - Larger touch targets
  - Optimized grid

- **Desktop Enhancements**:
  - Full visual effects
  - Hover animations
  - Detailed tooltips

---

## Implementation Tasks

### Phase 1: Foundation (Priority: High)
- [ ] Create enhanced class icon components
- [ ] Update color palette with WoW colors
- [ ] Implement glow effects
- [ ] Add hover animations

### Phase 2: Header & Navigation (Priority: High)
- [ ] Redesign header with animations
- [ ] Enhance tab navigation
- [ ] Add role indicators
- [ ] Implement smooth transitions

### Phase 3: Class Hub (Priority: High)
- [ ] Create hero section
- [ ] Redesign spec cards
- [ ] Enhance content frame
- [ ] Add visual borders

### Phase 4: Content Display (Priority: Medium)
- [ ] Enhance typography
- [ ] Add ability icons
- [ ] Implement stat visualizations
- [ ] Add dungeon indicators

### Phase 5: Effects & Polish (Priority: Medium)
- [ ] Add animations
- [ ] Implement shimmer effects
- [ ] Add parallax effects
- [ ] Polish transitions

### Phase 6: Admin & States (Priority: Medium)
- [ ] Enhance admin panel
- [ ] Improve loading states
- [ ] Enhance error states
- [ ] Add visual feedback

---

## Design Principles

1. **WoW First**: Every visual element should feel authentic to WoW
2. **Modern Touch**: Blend fantasy with contemporary design
3. **Performance**: Animations should be smooth and lightweight
4. **Accessibility**: Maintain WCAG compliance
5. **Consistency**: Use consistent colors, spacing, and effects
6. **Immersion**: Create an immersive, engaging experience

---

## Color Palette

### Class Colors (Official WoW)
```
Warrior:      #C79C6E
Paladin:      #F58CBA
Hunter:       #ABD473
Rogue:        #FFF569
Priest:       #FFFFFF
Death Knight: #C41E3A
Shaman:       #0070DD
Mage:         #3FC7EB
Warlock:      #9482CA
Monk:         #00FF96
Druid:        #FF7D0A
Demon Hunter: #A335EE
Evoker:       #33937F
```

### UI Colors
```
Background:   #0a0e27
Panel:        #1a1f3a
Border:       #2a3050
Text:         #e0e6ff
Accent:       Class-specific
```

---

## Typography

### Fonts
- **Headers**: Fantasy font (e.g., "Exo", "Orbitron", or WoW-inspired)
- **Body**: Clean sans-serif (e.g., "Inter", "Roboto")
- **Monospace**: For code/stats (e.g., "Fira Code")

### Sizes
- **H1**: 3xl (36px)
- **H2**: 2xl (28px)
- **H3**: xl (20px)
- **Body**: base (16px)
- **Small**: sm (14px)

---

## Animation Guidelines

### Timing
- **Fast**: 150ms (hover effects)
- **Normal**: 300ms (transitions)
- **Slow**: 500ms (page transitions)

### Easing
- **Ease-in-out**: Default for most animations
- **Ease-out**: For entrance animations
- **Ease-in**: For exit animations

### Effects
- **Glow**: Subtle, class-colored
- **Lift**: 4-8px elevation
- **Shimmer**: Subtle, 2-3 second duration
- **Pulse**: Subtle, 2-3 second duration

---

## Accessibility Considerations

- [ ] Maintain WCAG 2.1 AA compliance
- [ ] Provide `prefers-reduced-motion` support
- [ ] Ensure sufficient color contrast
- [ ] Keep keyboard navigation working
- [ ] Add ARIA labels for animations
- [ ] Test with screen readers

---

## Performance Targets

- [ ] Animations: 60 FPS
- [ ] Load time: < 3 seconds
- [ ] Animation frame rate: Smooth on all devices
- [ ] No layout shifts during animations

---

## Success Metrics

- [ ] Visual design feels authentically WoW
- [ ] Modern/futuristic aesthetic maintained
- [ ] All animations smooth and performant
- [ ] User engagement increased
- [ ] Accessibility maintained
- [ ] Performance targets met

---

## Next Steps

1. Review and approve design direction
2. Create design mockups/prototypes
3. Implement Phase 1 (Foundation)
4. Gather feedback
5. Continue with remaining phases

---

## References

- WoW Official Colors: https://wow.gamepedia.com/Class
- Modern UI Trends: Glassmorphism, Neumorphism
- Animation Libraries: Framer Motion, React Spring
- Icon Libraries: Heroicons, Tabler Icons

---

*Spec created: November 19, 2025*  
*Status: Ready for implementation*
