---
name: Academic Utility
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#00668a'
  on-secondary: '#ffffff'
  secondary-container: '#40c2fd'
  on-secondary-container: '#004d6a'
  tertiary: '#4e5e68'
  on-tertiary: '#ffffff'
  tertiary-container: '#667781'
  on-tertiary-container: '#fbfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#d3e5f1'
  tertiary-fixed-dim: '#b7c9d5'
  on-tertiary-fixed: '#0c1e26'
  on-tertiary-fixed-variant: '#384953'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  display-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is tailored for an approachable, structured undergraduate engineering portal. It prioritizes clarity, intuitive information architecture, and ease of implementation. The visual aesthetic reflects a dependable academic utility: pragmatic, functional, and organized without unnecessary flourishes or experimental trends.

The interface evokes competence, calmness, and structure. It serves students, instructors, and evaluators who need immediate comprehension and zero cognitive friction. The design movement is pure **Corporate / Modern Minimalism**—embracing stark whitespace, rigid structural boundaries, predictable content hierarchy, and clean semantic layouts that are trivial to write with foundational HTML and CSS.

## Colors

The color palette utilizes standard, high-contrast digital utility hues built for screen legibility:

- **Primary (`#0284c7`)**: The principal brand and interactive tone. Applied to primary calls to action, active navigation tabs, links, and key focus states.
- **Secondary (`#38bdf8`)**: A vibrant sky blue utilized for supplementary indicators, selection outlines, and non-critical interactive elements.
- **Tertiary (`#e0f2fe`)**: An airy, ice-blue tint for tag backgrounds, active item highlights, alerts, and subtle table header accents.
- **Neutral (`#0f172a`)**: A deep slate navy serving as primary text for maximum contrast against crisp surfaces.

### Surface and Border Roles
- **Canvas Base**: `#f8fafc` provides a soft, eye-resting background.
- **Surface Elevation (Cards, Panels)**: `#ffffff`.
- **Structural Border**: `#e2e8f0` (1px solid on cards, dividers, and inputs).
- **Muted Text / Secondary Labels**: `#64748b`.

## Typography

The design system uses **Inter** across all typographic tokens. It provides a tall x-height, clear numeric distinctions, and exceptional rendering on varying monitors.

- Headings use medium to bold weights (`600`, `700`) to anchor scanning order without requiring oversized type.
- Body copy relies on standard regular weight (`400`) at comfortable line heights (`1.4`–`1.5`) for readable documentation, code snippets, and assignment lists.
- Labels, table column headers, and form titles leverage medium weight (`500`) for visual delineation without adding visual heaviness.

## Layout & Spacing

Layouts follow a clean, responsive fluid grid constructed via standard CSS Flexbox and CSS Grid layouts.

- **Grid Architecture**: Standard 12-column layout or direct auto-fit grids (`repeat(auto-fit, minmax(280px, 1fr))`) for card arrangements.
- **Breakpoints**:
  - **Mobile (< 768px)**: 1-column layouts, 1rem page margins, and compact component padding.
  - **Tablet (768px – 1024px)**: 2-column dashboards, 1.5rem gutters.
  - **Desktop (> 1024px)**: Full multi-column views, persistent sidebars (max-width 240px–260px), and capped central content containers (`max-width: 1200px`) centered horizontally.
- **Rhythm**: Spacing follows an 8-point base scale (`0.25rem` / `4px` through `2rem` / `32px`). Form elements and card bodies uniformly utilize `space-md` (16px) or `space-lg` (24px).

## Elevation & Depth

This system avoids heavy drop shadows, neon glows, skeuomorphic bevels, and backdrop blurs. Visual separation is accomplished entirely through **flat surface contrasts and clean outline tiers**:

- **Layer 0 (Base)**: `#f8fafc` canvas background.
- **Layer 1 (Cards, Tables, Panels)**: `#ffffff` surface bounded by a crisp `1px solid #e2e8f0` perimeter border.
- **Layer 2 (Dropdowns, Tooltips, Modals)**: Retains `#ffffff` background with the standard `1px solid #cbd5e1` boundary, reinforced only by a restrained ambient shadow: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **States (Hover, Active)**: Boundary borders transition to `#0284c7` (primary) without altering physical elevation or adding transform jumps.

## Shapes

The design uses standard, practical rounded corners across all components:
- Default elements (buttons, inputs, alerts, chips) carry a consistent **6px to 8px** radius (`0.375rem` to `0.5rem`).
- Larger containers and cards employ `rounded-lg` (16px / `1rem`) maximum.
- Micro tags and toggle indicators use subtle `0.25rem` (4px) rounding or pure functional pill borders where status distinction is critical.
- Shapes are geometrically crisp, avoiding pill extremes for major structural containers to ensure layout grids remain aligned and predictable.

## Components

### Buttons
- **Primary**: Solid background `#0284c7`, text `#ffffff`, border `none`, padding `0.5rem 1rem`, font weight `500`. Hover state `#0369a1`.
- **Secondary / Outline**: Background `#ffffff`, border `1px solid #cbd5e1`, text `#0f172a`. Hover state background `#f1f5f9`.
- **Destructive**: Background `#ef4444`, text `#ffffff`. Hover `#dc2626`.
- **Size Options**: Compact (`0.375rem 0.75rem`, 12px font) and Regular (`0.5rem 1rem`, 14px font). Height is locked to 36px or 40px for consistent vertical alignment.

### Cards
- Plain `#ffffff` background, `1px solid #e2e8f0` border, `rounded-md` (8px).
- Internal layout structured with three optional flex sections:
  - **Card Header**: Border-bottom `1px solid #f1f5f9`, padding `1rem`.
  - **Card Body**: Padding `1rem`.
  - **Card Footer**: Border-top `1px solid #f1f5f9`, background `#f8fafc`, padding `0.75rem 1rem`.

### Form Inputs & Selects
- Background `#ffffff`, border `1px solid #cbd5e1`, border-radius `6px`.
- Padding `0.5rem 0.75rem`, font size `14px`, text `#0f172a`.
- Focus state: Outline `2px solid #38bdf8`, border-color `#0284c7`.
- Helper text in `#64748b` placed `0.25rem` below input.

### Checkboxes & Radios
- Size `16px x 16px`, border `1px solid #94a3b8`, border radius `4px` (checkbox) or `50%` (radio).
- Checked state: `#0284c7` background with a crisp white tick or center circle.

### Badges & Chips
- Background `#e0f2fe`, text `#0369a1`, font size `12px`, weight `500`, padding `0.25rem 0.625rem`, border radius `4px`.
- Success status variant: `#dcfce7` background with `#15803d` text.
- Warning status variant: `#fef3c7` background with `#b45309` text.

### Tables
- Width `100%`, border-collapse `collapse`.
- **Header (`<th>`)**: Background `#f8fafc`, text `#475569`, font size `12px`, uppercase letter spacing `0.05em`, text-align `left`, padding `0.75rem 1rem`, border-bottom `1px solid #e2e8f0`.
- **Data Rows (`<td>`)**: Padding `0.75rem 1rem`, font size `14px`, border-bottom `1px solid #f1f5f9`. Hover state for rows: `#f8fafc`.