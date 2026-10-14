---
name: frontend-expert
description: >-
  Expert guidance for architecting, building, styling, optimizing, and auditing modern frontend web applications. Use when creating UI components, designing CSS design token systems, optimizing Core Web Vitals (LCP, INP, CLS), implementing accessibility (WCAG AA), fluid layouts, state management, or micro-interactions.
---

# Frontend Expert Engineering Runbook

High-performance, visually compelling, accessible frontend engineering guidelines.

---

## The 6 Golden Rules of Modern Frontend

1. **Design Token Hierarchy Over Ad-Hoc Values**:
   - Never hardcode raw hex colors or arbitrary pixel margins inline. Build on a two-tier token system:
     - *Primitive Tokens*: `--color-slate-900: #0f172a`, `--space-4: 1rem`
     - *Semantic Tokens*: `--bg-surface: var(--color-slate-900)`, `--text-primary: var(--color-slate-50)`
2. **Prioritize Interaction to Next Paint (INP) & Core Web Vitals**:
   - Keep JavaScript tasks under 50ms. Never block the main thread with heavy synchronous computations (use Web Workers or chunk with `scheduler.yield()` / `requestIdleCallback()`).
   - Prevent layout shifts (CLS = 0) by reserving aspect ratios and explicit sizes on images, video containers, and dynamic banner slots.
3. **Accessibility (a11y) as an Invariant, Not an Afterthought**:
   - Every interactive control must be keyboard-operable (`Tab`, `Enter`, `Space`, `Escape`).
   - Use semantic HTML (`<button>`, `<dialog>`, `<nav>`, `<main>`) over `<div>` with `onClick`.
   - Maintain a minimum 4.5:1 contrast ratio for normal text and 3:1 for large text / graphical UI components.
4. **Resilient Data States**:
   - Every async UI element must cleanly handle 4 distinct states: **Idle / Initial**, **Loading / Skeleton**, **Success**, and **Error with Retry**.
5. **Fluid, Container-Aware Responsive Design**:
   - Favor CSS Container Queries (`@container`) for component modularity.
   - Use `clamp()` for fluid typography and spacing rather than endless breakpoint overrides.
6. **Intentional Motion & Respect for User Preferences**:
   - Use subtle, spring-based micro-interactions to provide immediate feedback on hover, focus, and click.
   - Always wrap continuous animations or transforms in `@media (prefers-reduced-motion: no-preference)`.

---

## Architecture Blueprint

```text
[ Global Token Layer ] (CSS Custom Properties: colors, spacing, radius, typography)
         │
         ▼
[ Primitive Components ] (Button, Input, Card, Modal, Dropdown, Badge)
         │
         ▼
[ Composite Patterns ] (Forms, Data Tables, Navbars, Dashboards, Feed)
         │
         ▼
[ App State & Data Layer ] (Server Cache, Local State, Optimistic Updates)
```

---

## Token & Theme Foundation (Vanilla CSS)

```css
:root {
  /* Primitive Palette */
  --slate-950: #020617;
  --slate-900: #0f172a;
  --slate-800: #1e293b;
  --slate-400: #94a3b8;
  --slate-100: #f1f5f9;
  --indigo-500: #6366f1;
  --indigo-400: #818cf8;

  /* Typography Scale (Fluid) */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --text-3xl: clamp(1.875rem, 1.6rem + 1.25vw, 2.5rem);

  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Elevation & Blur */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --glass-bg: rgba(15, 23, 42, 0.75);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-backdrop: blur(12px);

  /* Semantic Default (Dark Theme) */
  --bg-app: var(--slate-950);
  --bg-surface: var(--slate-900);
  --bg-elevated: var(--slate-800);
  --text-primary: var(--slate-100);
  --text-secondary: var(--slate-400);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --accent-primary: var(--indigo-500);
  --accent-hover: var(--indigo-400);
}

[data-theme="light"] {
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-elevated: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border-subtle: rgba(0, 0, 0, 0.08);
  --accent-primary: #4f46e5;
  --accent-hover: #4338ca;
}
```

---

## Key Decision Matrix

| Challenge | Recommended Pattern | Reference Guide |
| :--- | :--- | :--- |
| **Component Layouts & Responsive Cards** | Use **CSS Container Queries** (`container-type: inline-size`) instead of global viewport breakpoints | [Design Systems & Tokens](./references/design-systems-and-tokens.md) |
| **Janky Animations / High INP** | Animate **only `transform` and `opacity`**; avoid animating `width`, `height`, `margin`, or `top` | [Performance & Web Vitals](./references/performance-and-web-vitals.md) |
| **Large Lists / Infinite Scrolling** | Use **DOM Virtualization** (`@tanstack/virtual` or custom `IntersectionObserver` windowing) | [Performance & Web Vitals](./references/performance-and-web-vitals.md) |
| **Instant User Feedback** | Implement **Optimistic UI Updates** with rollback on network failure | [State & Data Fetching](./references/state-and-data-fetching.md) |
| **Modal / Dialog Windows** | Use native `<dialog>` element with `showModal()` to get automatic focus trapping and backdrop handling | [Accessibility & Interactions](./references/accessibility-and-interactions.md) |

---

## Production Readiness Checklist

- [ ] Semantic HTML used (`<main>`, `<header>`, `<nav>`, `<article>`, `<button>`).
- [ ] Responsive without horizontal scroll on all viewports (320px to 4K).
- [ ] Fluid typography and spacing via `clamp()` and CSS variables.
- [ ] Color contrast satisfies WCAG AA (>= 4.5:1 text, >= 3:1 UI boundaries).
- [ ] Keyboard navigable with visible `:focus-visible` outline rings.
- [ ] Cumulative Layout Shift (CLS) prevented by setting aspect-ratio/width/height on images and media containers.
- [ ] Async actions provide loading skeletons or spinners and informative error states with retry buttons.
- [ ] Micro-interactions feel snappy (< 200ms transitions) and honor `prefers-reduced-motion`.

---

## Detailed References

- [Design Systems, Tokens & Dark Mode Architecture](./references/design-systems-and-tokens.md)
- [Core Web Vitals & Frontend Performance Optimization](./references/performance-and-web-vitals.md)
- [State Management, Data Fetching & Optimistic UI](./references/state-and-data-fetching.md)
- [Accessibility (WCAG AA), Focus Trapping & Micro-Interactions](./references/accessibility-and-interactions.md)
