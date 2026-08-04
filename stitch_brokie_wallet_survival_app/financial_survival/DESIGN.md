---
name: Financial Survival
colors:
  surface: '#fbf9f7'
  surface-dim: '#dbdad8'
  surface-bright: '#fbf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f1'
  surface-container: '#efedec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e4e2e0'
  on-surface: '#1b1c1b'
  on-surface-variant: '#544246'
  inverse-surface: '#30302f'
  inverse-on-surface: '#f2f0ee'
  outline: '#877276'
  outline-variant: '#dac0c5'
  surface-tint: '#9e3c5c'
  primary: '#9e3c5c'
  on-primary: '#ffffff'
  primary-container: '#f27fa0'
  on-primary-container: '#6e1637'
  inverse-primary: '#ffb1c4'
  secondary: '#645497'
  on-secondary: '#ffffff'
  secondary-container: '#c6b3fe'
  on-secondary-container: '#524284'
  tertiary: '#655a70'
  on-tertiary: '#ffffff'
  tertiary-container: '#ab9eb6'
  on-tertiary-container: '#3f3549'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e0'
  primary-fixed-dim: '#ffb1c4'
  on-primary-fixed: '#3f001a'
  on-primary-fixed-variant: '#7f2444'
  secondary-fixed: '#e8ddff'
  secondary-fixed-dim: '#cebdff'
  on-secondary-fixed: '#200c4f'
  on-secondary-fixed-variant: '#4c3c7d'
  tertiary-fixed: '#ecddf7'
  tertiary-fixed-dim: '#d0c1db'
  on-tertiary-fixed: '#20182a'
  on-tertiary-fixed-variant: '#4d4357'
  background: '#fbf9f7'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e0'
typography:
  display-currency:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  stack-gap: 16px
  card-inner: 20px
  margin-mobile: 16px
---

## Brand & Style
The design system is built around a "Financial Survival" narrative, blending the high stakes of a game with the necessity of personal budgeting. The brand personality is resilient, slightly irreverent, and highly motivating. It uses a **Modern-Tactile** style—mixing soft, approachable gradients with structured, game-like interface elements. 

The aesthetic is "Chaotic yet Clean": while the language and gamification elements (health bars, status effects) are high-energy, the UI remains functional and uncluttered to prevent financial anxiety. The goal is to evoke a sense of playfulness that masks the underlying discipline required for money management.

## Colors
The palette uses a soft lavender-to-blush gradient for the foundation, providing a "calm before the storm" atmosphere. 

- **Primary (#F27FA0):** Used for "Critical Actions"—primary buttons, "Level Up" notifications, and urgent financial warnings.
- **Secondary (#4B3B7C):** Used for deep-contrast text and structural hierarchy to ensure legibility against the soft backgrounds.
- **Surface (#FFFDFB):** High-polish cream cards that float above the gradient background.
- **Dark Mode:** Inverts the experience into a "Night Raid" aesthetic, using deep indigo/charcoal for the environment while keeping the vibrant coral accents for high visibility.

## Typography
The system utilizes **Plus Jakarta Sans** for its rounded, friendly terminals that maintain a modern, professional edge. 

- **Currency:** Large, bold weights are used for monetary values to emphasize the "Score" aspect of the app.
- **Labels:** Category tags and metadata use small-caps with wide tracking to mimic the "UI HUD" (Heads-Up Display) found in survival games.
- **Mobile Scale:** For mobile screens, `display-currency` scales down to 36px to prevent layout breaking while maintaining its visual weight.

## Layout & Spacing
The design system follows a **Fluid Grid** model optimized for mobile-first interaction. Layouts are built on an 8px rhythmic scale.

- **Safe Zones:** A generous 24px container padding ensures elements never feel cramped against the screen edges.
- **Card Stacks:** Vertical spacing between cards is fixed at 16px to create a clear "Inventory" feel.
- **Dynamic Breathing:** Use whitespace to separate "Safety Zones" (Surplus) from "Danger Zones" (Over-budget).

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. 

1. **The World (Background):** A fixed linear gradient that stays static as cards scroll over it.
2. **The Inventory (Cards):** Cream-colored cards use a low-offset, high-blur shadow (`0px 8px 24px rgba(75, 59, 124, 0.08)`) to appear as if floating just above the surface.
3. **The HUD (Action Layer):** Floating Action Buttons (FABs) and critical alerts use a higher elevation with more intense shadows to denote immediate interactability.

## Shapes
This design system uses a **Pill-shaped** philosophy. The primary radius is 24px, creating a friendly, "squishy" feel that reduces the stress typically associated with financial data. 

- **Cards:** 24px radius.
- **Buttons:** Fully pill-shaped (rounded-full).
- **Progress Bars:** Fully rounded ends to mimic "Health Bars" in video games.

## Components
- **Buttons:** The Primary FAB is a large, coral-pink circle with a white icon, positioned bottom-right. Secondary buttons are outline-only with a 2px stroke of the deep indigo.
- **Health-Bar Progress:** Instead of standard thin lines, progress bars are thick (12px height) with a container background of 10% opacity indigo and a solid coral or lavender fill representing spend.
- **Category Badges:** Circular containers with a 10% tint of the primary color, housing a single centered emoji or custom icon.
- **Status Chips:** Small, pill-shaped labels (e.g., "BROKE," "BALLIN'") using the `label-caps` type style and high-contrast background fills.
- **Input Fields:** Soft cream backgrounds with no border in their default state, gaining a 2px indigo border when active.
- **Survival Cards:** The main dashboard component, featuring a large currency display and a "Status" sub-header.