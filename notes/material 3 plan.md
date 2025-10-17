# Material 3 Expressive Makeover Plan

## Overview

Transform Crackulator into a Material 3 expressive experience with dynamic color, elevated typography, smooth animations, and modern component design. Keep it slick, keep it fire.

## Design Principles

### Material 3 Core Values
- **Expressive** - Bold colors, dynamic theming, personality
- **Adaptive** - Responds to user preferences and context
- **Personal** - Customizable, user-centric design
- **Accessible** - High contrast, clear hierarchy, touch-friendly

### Crackulator Vibe
- Clean calculator aesthetic with personality
- Mobile-first with smooth interactions
- Professional but not boring
- Fast, responsive, tactile

## Color System

### Dynamic Color Implementation

#### Color Roles
Material 3 uses a tonal palette system with semantic color roles:

**Primary Colors**
- `primary` - Main brand color, key actions
- `on-primary` - Text/icons on primary
- `primary-container` - Highlights, selections
- `on-primary-container` - Text on primary container

**Secondary Colors**
- `secondary` - Supporting actions
- `on-secondary` - Text/icons on secondary
- `secondary-container` - Less prominent highlights
- `on-secondary-container` - Text on secondary container

**Tertiary Colors**
- `tertiary` - Complementary accents
- `on-tertiary` - Text/icons on tertiary
- `tertiary-container` - Accent highlights
- `on-tertiary-container` - Text on tertiary container

**Surface Colors**
- `surface` - Default backgrounds
- `on-surface` - Default text/icons
- `surface-variant` - Secondary backgrounds
- `on-surface-variant` - Secondary text
- `surface-container-lowest` to `surface-container-highest` - Elevation surfaces

**Utility Colors**
- `error` / `on-error` - Error states
- `outline` - Borders, dividers
- `outline-variant` - Subtle borders

#### Suggested Color Palette

**Light Theme**
```css
/* Primary - Vibrant purple/blue */
--md-sys-color-primary: #6750A4;
--md-sys-color-on-primary: #FFFFFF;
--md-sys-color-primary-container: #EADDFF;
--md-sys-color-on-primary-container: #21005D;

/* Secondary - Teal accent */
--md-sys-color-secondary: #625B71;
--md-sys-color-on-secondary: #FFFFFF;
--md-sys-color-secondary-container: #E8DEF8;
--md-sys-color-on-secondary-container: #1D192B;

/* Tertiary - Orange pop */
--md-sys-color-tertiary: #7D5260;
--md-sys-color-on-tertiary: #FFFFFF;
--md-sys-color-tertiary-container: #FFD8E4;
--md-sys-color-on-tertiary-container: #31111D;

/* Surfaces */
--md-sys-color-surface: #FEF7FF;
--md-sys-color-on-surface: #1D1B20;
--md-sys-color-surface-variant: #E7E0EC;
--md-sys-color-on-surface-variant: #49454F;

/* Surfaces by elevation */
--md-sys-color-surface-container-lowest: #FFFFFF;
--md-sys-color-surface-container-low: #F7F2FA;
--md-sys-color-surface-container: #F3EDF7;
--md-sys-color-surface-container-high: #ECE6F0;
--md-sys-color-surface-container-highest: #E6E0E9;

/* Utility */
--md-sys-color-error: #B3261E;
--md-sys-color-on-error: #FFFFFF;
--md-sys-color-error-container: #F9DEDC;
--md-sys-color-on-error-container: #410E0B;
--md-sys-color-outline: #79747E;
--md-sys-color-outline-variant: #CAC4D0;
```

**Dark Theme**
```css
/* Primary */
--md-sys-color-primary: #D0BCFF;
--md-sys-color-on-primary: #381E72;
--md-sys-color-primary-container: #4F378B;
--md-sys-color-on-primary-container: #EADDFF;

/* Secondary */
--md-sys-color-secondary: #CCC2DC;
--md-sys-color-on-secondary: #332D41;
--md-sys-color-secondary-container: #4A4458;
--md-sys-color-on-secondary-container: #E8DEF8;

/* Tertiary */
--md-sys-color-tertiary: #EFB8C8;
--md-sys-color-on-tertiary: #492532;
--md-sys-color-tertiary-container: #633B48;
--md-sys-color-on-tertiary-container: #FFD8E4;

/* Surfaces */
--md-sys-color-surface: #1D1B20;
--md-sys-color-on-surface: #E6E0E9;
--md-sys-color-surface-variant: #49454F;
--md-sys-color-on-surface-variant: #CAC4D0;

/* Surfaces by elevation */
--md-sys-color-surface-container-lowest: #0F0D13;
--md-sys-color-surface-container-low: #1D1B20;
--md-sys-color-surface-container: #211F26;
--md-sys-color-surface-container-high: #2B2930;
--md-sys-color-surface-container-highest: #36343B;

/* Utility */
--md-sys-color-error: #F2B8B5;
--md-sys-color-on-error: #601410;
--md-sys-color-error-container: #8C1D18;
--md-sys-color-on-error-container: #F9DEDC;
--md-sys-color-outline: #938F99;
--md-sys-color-outline-variant: #49454F;
```

### Implementation Strategy
1. Create CSS custom properties for all color roles
2. Use `prefers-color-scheme` media query for automatic theme switching
3. Allow manual theme override (optional future feature)
4. Update all components to use semantic color tokens instead of hardcoded colors

## Typography

### Material 3 Type Scale

Material 3 uses a comprehensive type scale with display, headline, title, body, and label variants.

```css
/* Display - Largest text, hero sections */
--md-sys-typescale-display-large: 400 57px/64px var(--font-family-ui);
--md-sys-typescale-display-medium: 400 45px/52px var(--font-family-ui);
--md-sys-typescale-display-small: 400 36px/44px var(--font-family-ui);

/* Headline - High-emphasis, short text */
--md-sys-typescale-headline-large: 400 32px/40px var(--font-family-ui);
--md-sys-typescale-headline-medium: 400 28px/36px var(--font-family-ui);
--md-sys-typescale-headline-small: 400 24px/32px var(--font-family-ui);

/* Title - Medium-emphasis, short text */
--md-sys-typescale-title-large: 500 22px/28px var(--font-family-ui);
--md-sys-typescale-title-medium: 500 16px/24px var(--font-family-ui);
--md-sys-typescale-title-small: 500 14px/20px var(--font-family-ui);

/* Body - Longer text */
--md-sys-typescale-body-large: 400 16px/24px var(--font-family-ui);
--md-sys-typescale-body-medium: 400 14px/20px var(--font-family-ui);
--md-sys-typescale-body-small: 400 12px/16px var(--font-family-ui);

/* Label - Buttons, tabs, labels */
--md-sys-typescale-label-large: 500 14px/20px var(--font-family-ui);
--md-sys-typescale-label-medium: 500 12px/16px var(--font-family-ui);
--md-sys-typescale-label-small: 500 11px/16px var(--font-family-ui);

/* Code - Monospace for calculations */
--md-sys-typescale-code-medium: 400 14px/20px var(--font-family-mono);
```

### Typography Mapping for Crackulator

| Component | Type Scale |
|-----------|------------|
| Modal titles | `headline-small` |
| Tab names | `title-small` |
| File names | `title-medium` |
| Button labels | `label-large` |
| Editor content | `code-medium` (Roboto Mono) |
| Results | `code-medium` (Roboto Mono) |
| Line numbers | `label-small` (Roboto Mono) |
| Variable buttons | `label-medium` |
| Notifications | `body-medium` |
| Help text | `body-small` |

## Elevation & Surfaces

### Material 3 Elevation System

Material 3 uses surface tint instead of shadows for most elevation. Each elevated surface gets progressively more primary color tint.

**Elevation Levels:**
- **Level 0** - `surface` - Base layer
- **Level 1** - `surface-container-low` - Tabs, bottom bars
- **Level 2** - `surface-container` - Cards at rest
- **Level 3** - `surface-container-high` - Modals, dialogs
- **Level 4** - `surface-container-highest` - Top app bar (scrolled)
- **Level 5** - Custom for floating action buttons (FAB)

### Shadows (Subtle)

Material 3 uses minimal shadows for tactile feedback.

```css
--md-sys-elevation-0: none;
--md-sys-elevation-1: 0px 1px 2px rgba(0, 0, 0, 0.3),
                       0px 1px 3px 1px rgba(0, 0, 0, 0.15);
--md-sys-elevation-2: 0px 1px 2px rgba(0, 0, 0, 0.3),
                       0px 2px 6px 2px rgba(0, 0, 0, 0.15);
--md-sys-elevation-3: 0px 4px 8px 3px rgba(0, 0, 0, 0.15),
                       0px 1px 3px rgba(0, 0, 0, 0.3);
--md-sys-elevation-4: 0px 6px 10px 4px rgba(0, 0, 0, 0.15),
                       0px 2px 3px rgba(0, 0, 0, 0.3);
--md-sys-elevation-5: 0px 8px 12px 6px rgba(0, 0, 0, 0.15),
                       0px 4px 4px rgba(0, 0, 0, 0.3);
```

### Elevation Mapping for Crackulator

| Component | Elevation Level | Surface |
|-----------|----------------|---------|
| Main editor container | 0 | `surface` |
| Tab bar | 1 | `surface-container-low` |
| Variable toolbar | 1 | `surface-container-low` |
| Modals | 3 | `surface-container-high` |
| Active tab | 2 | `surface-container` |
| Buttons (hover) | 1 | `surface-container-low` |

## Components Redesign

### Buttons

**Types:**
1. **Filled** - Highest emphasis (primary actions)
2. **Filled Tonal** - Medium-high emphasis (secondary actions)
3. **Outlined** - Medium emphasis
4. **Text** - Low emphasis
5. **Icon** - Action icons

**Specifications:**
- **Height**: 40px (touch target 48px)
- **Border Radius**: 20px (fully rounded)
- **Padding**: 24px horizontal, 10px vertical
- **Icon size**: 18px
- **Label**: `label-large`
- **State layers**: Hover (8% opacity), Focus (12%), Pressed (12%), Disabled (12%)

**Updated Button Styles:**
```css
/* Filled buttons - Primary actions */
.btn-filled {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  height: 40px;
  font: var(--md-sys-typescale-label-large);
  box-shadow: var(--md-sys-elevation-0);
  transition: box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
}

.btn-filled:hover {
  box-shadow: var(--md-sys-elevation-1);
  background-color: color-mix(in srgb, var(--md-sys-color-primary), var(--md-sys-color-on-primary) 8%);
}

/* Filled tonal - Secondary actions */
.btn-tonal {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  height: 40px;
  font: var(--md-sys-typescale-label-large);
}

/* Outlined buttons */
.btn-outlined {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 20px;
  padding: 10px 24px;
  height: 40px;
  font: var(--md-sys-typescale-label-large);
}

/* Icon buttons */
.btn-icon {
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface), transparent 92%);
}
```

### Text Fields (Inputs)

Material 3 text fields come in two variants:
1. **Filled** - Default, more visual weight
2. **Outlined** - Less emphasis, cleaner

**Specifications:**
- **Height**: 56px
- **Border Radius**: 4px (top) for filled, 4px (all) for outlined
- **Label**: `body-large` → `body-small` (animated)
- **Supporting text**: `body-small`

**Updated Input Styles:**
```css
/* Outlined text field */
.text-field-outlined {
  position: relative;
  width: 100%;
  height: 56px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 4px;
  padding: 16px;
  font: var(--md-sys-typescale-body-large);
  background-color: transparent;
  color: var(--md-sys-color-on-surface);
  transition: border-color 200ms;
}

.text-field-outlined:focus {
  outline: none;
  border: 2px solid var(--md-sys-color-primary);
  border-width: 2px;
}

.text-field-outlined:hover {
  border-color: var(--md-sys-color-on-surface);
}
```

### Tabs

Material 3 tabs use primary indicators and are more expressive.

**Specifications:**
- **Height**: 48px
- **Indicator height**: 3px
- **Active indicator**: `primary`
- **Label**: `title-small`
- **Icon**: 24px (optional)

**Updated Tab Styles:**
```css
.tab {
  position: relative;
  height: 48px;
  padding: 0 16px;
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  border: none;
  font: var(--md-sys-typescale-title-small);
  cursor: pointer;
  transition: color 200ms;
}

.tab:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface), transparent 92%);
}

.tab.active {
  color: var(--md-sys-color-primary);
}

.tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--md-sys-color-primary);
  transform: scaleX(0);
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tab.active::after {
  transform: scaleX(1);
}
```

### Modals (Dialogs)

Material 3 dialogs have rounded corners, tonal backgrounds, and clear actions.

**Specifications:**
- **Border Radius**: 28px
- **Background**: `surface-container-high`
- **Elevation**: Level 3
- **Max width**: 560px
- **Padding**: 24px

**Updated Modal Styles:**
```css
.modal-container {
  background-color: var(--md-sys-color-surface-container-high);
  border-radius: 28px;
  padding: 24px;
  max-width: 560px;
  width: 90%;
  box-shadow: var(--md-sys-elevation-3);
}

.modal-header {
  padding-bottom: 16px;
}

.modal-title {
  font: var(--md-sys-typescale-headline-small);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.modal-content {
  padding: 16px 0;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 24px;
}
```

### Cards

Material 3 cards come in three variants:
1. **Elevated** - Subtle shadow
2. **Filled** - Tonal background
3. **Outlined** - Border only

For file list items, use filled cards.

```css
.card-filled {
  background-color: var(--md-sys-color-surface-container-highest);
  border-radius: 12px;
  padding: 16px;
  color: var(--md-sys-color-on-surface);
  transition: background-color 200ms;
}

.card-filled:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-surface-container-highest), var(--md-sys-color-on-surface) 8%);
}
```

## Motion & Animation

### Material 3 Easing Curves

```css
/* Standard easing - Most animations */
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);

/* Emphasized easing - Important transitions */
--md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
--md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
--md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);

/* Legacy */
--md-sys-motion-easing-legacy: cubic-bezier(0.4, 0, 0.2, 1);
```

### Duration Scale

```css
--md-sys-motion-duration-short1: 50ms;   /* Small utility changes */
--md-sys-motion-duration-short2: 100ms;  /* Small expansion/collapse */
--md-sys-motion-duration-short3: 150ms;  /* Small transitions */
--md-sys-motion-duration-short4: 200ms;  /* Small full-screen transitions */
--md-sys-motion-duration-medium1: 250ms; /* Medium expansion/collapse */
--md-sys-motion-duration-medium2: 300ms; /* Medium transitions */
--md-sys-motion-duration-medium3: 350ms; /* Medium full-screen transitions */
--md-sys-motion-duration-medium4: 400ms; /* Large expansion/collapse */
--md-sys-motion-duration-long1: 450ms;   /* Large transitions */
--md-sys-motion-duration-long2: 500ms;   /* Large full-screen transitions */
--md-sys-motion-duration-long3: 550ms;   /* Extra large transitions */
--md-sys-motion-duration-long4: 600ms;   /* Extra large full-screen transitions */
```

### Key Animations for Crackulator

1. **Tab switching** - `medium2` (300ms) with `emphasized` easing
2. **Modal open/close** - `medium3` (350ms) with `emphasized-decelerate` / `emphasized-accelerate`
3. **Button press** - `short1` (50ms) scale + state layer
4. **Ripple effect** - `medium1` (250ms) expanding circle
5. **Variable insert** - `short3` (150ms) fade in
6. **Results update** - `short4` (200ms) slide in from right
7. **Notification** - `medium2` (300ms) slide down + fade

## State Layers

Material 3 uses state layers (color overlays) for interactive feedback.

```css
/* State layer opacity values */
--md-sys-state-hover-opacity: 0.08;
--md-sys-state-focus-opacity: 0.12;
--md-sys-state-pressed-opacity: 0.12;
--md-sys-state-dragged-opacity: 0.16;

/* Example implementation */
.interactive-element {
  position: relative;
  overflow: hidden;
}

.interactive-element::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity 200ms;
}

.interactive-element:hover::before {
  opacity: var(--md-sys-state-hover-opacity);
}

.interactive-element:active::before {
  opacity: var(--md-sys-state-pressed-opacity);
}
```

## Ripple Effect

Material 3 uses touch ripples for tactile feedback.

**Implementation options:**
1. CSS-only pseudo-element animation
2. JavaScript-based ripple (better control)

**JavaScript Ripple Function:**
```javascript
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple');

  button.appendChild(ripple);

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}
```

```css
.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.3;
  animation: ripple-animation 600ms ease-out;
  pointer-events: none;
}

@keyframes ripple-animation {
  from {
    transform: scale(0);
    opacity: 0.3;
  }
  to {
    transform: scale(2);
    opacity: 0;
  }
}
```

## Shape System

Material 3 uses consistent corner radius values.

```css
--md-sys-shape-corner-none: 0px;
--md-sys-shape-corner-extra-small: 4px;
--md-sys-shape-corner-small: 8px;
--md-sys-shape-corner-medium: 12px;
--md-sys-shape-corner-large: 16px;
--md-sys-shape-corner-extra-large: 28px;
--md-sys-shape-corner-full: 9999px;
```

### Shape Mapping for Crackulator

| Component | Corner Radius |
|-----------|--------------|
| Buttons | `full` (20px explicit) |
| Icon buttons | `full` (circular) |
| Text fields | `extra-small` |
| Modals | `extra-large` |
| Cards | `medium` |
| Tabs | `none` (indicator only) |
| Tab container | `medium` (top corners) |
| Variable buttons | `small` |

## Implementation Phases

### Phase 1: Foundation (1-2 hours)
- [ ] Set up CSS custom properties for color system (light theme)
- [ ] Set up typography scale
- [ ] Set up elevation and shadow tokens
- [ ] Set up motion/easing tokens
- [ ] Set up shape tokens
- [ ] Test variables are accessible globally

### Phase 2: Core Components (2-3 hours)
- [ ] Update button styles (filled, tonal, outlined, icon)
- [ ] Add state layers to buttons
- [ ] Add ripple effect to buttons
- [ ] Update text input styles
- [ ] Update tab styles with new indicator
- [ ] Update tab animations

### Phase 3: Surfaces & Layout (1-2 hours)
- [ ] Update modal styles
- [ ] Update toolbar/header background
- [ ] Update tab bar surface
- [ ] Update variable toolbar surface
- [ ] Update editor container surface
- [ ] Apply proper elevation to all surfaces

### Phase 4: Dark Theme (1-2 hours)
- [ ] Set up dark theme color tokens
- [ ] Add `prefers-color-scheme` media query
- [ ] Test all components in dark mode
- [ ] Adjust any problematic contrasts

### Phase 5: Motion & Polish (2-3 hours)
- [ ] Add modal open/close animations
- [ ] Add tab switch animations
- [ ] Add results update animations
- [ ] Add notification animations
- [ ] Add micro-interactions (hover states, focus rings)
- [ ] Test all transitions feel smooth

### Phase 6: Icons & Details (1 hour)
- [ ] Ensure all Material Icons are properly sized
- [ ] Add icon states (hover, active, disabled)
- [ ] Update file list items to card style
- [ ] Add subtle dividers where needed
- [ ] Test touch targets (min 48x48px)

### Phase 7: Testing & Refinement (1-2 hours)
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify color contrast ratios (WCAG AA)
- [ ] Performance check (animations don't jank)
- [ ] Fix any bugs or inconsistencies

## Design Resources

### Material 3 References
- **Material Design 3**: https://m3.material.io/
- **Color System**: https://m3.material.io/styles/color/overview
- **Typography**: https://m3.material.io/styles/typography/overview
- **Elevation**: https://m3.material.io/styles/elevation/overview
- **Motion**: https://m3.material.io/styles/motion/overview
- **Components**: https://m3.material.io/components

### Tools
- **Material Theme Builder**: https://material-foundation.github.io/material-theme-builder/
  - Generate complete color schemes from a single color
  - Export as CSS, JSON, or design tokens
- **Color Palette Generator**: https://m3.material.io/theme-builder
  - Create custom palettes
  - Test accessibility
- **Material Symbols**: https://fonts.google.com/icons
  - Browse and download Material Icons

### Color Accessibility
- All color combinations should meet WCAG AA standards (4.5:1 for normal text)
- Use Material's built-in color roles (they're already tested for contrast)
- Test dark theme separately

## Notes & Considerations

### Performance
- Use CSS custom properties for easy theming
- Avoid excessive shadows (use surface tint instead)
- Keep animations under 400ms for snappiness
- Use `transform` and `opacity` for animations (GPU accelerated)

### Mobile-First
- Touch targets minimum 48x48px
- Comfortable thumb zones for primary actions
- Bottom navigation/toolbar easily reachable
- Larger tap areas for small icons

### Progressive Enhancement
- Start with functional styles
- Layer on animations and effects
- Ensure core functionality without JavaScript
- Test on low-end devices

### Accessibility
- Maintain focus indicators
- Support keyboard navigation
- Use semantic HTML
- Provide ARIA labels where needed
- Test with screen readers

### Future Enhancements
- Manual theme picker (light/dark/auto)
- Custom accent color picker
- Theme presets (blue, green, orange, etc.)
- Save user theme preference
- Export/import themes

---

**Let's make Crackulator look fresh as hell with Material 3** 🔥
