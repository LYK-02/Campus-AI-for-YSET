# Design Systems, Tokens & Dark Mode Architecture

## 1. Two-Tier Design Token Architecture

A robust design system separates primitive values (the palette and scales) from semantic tokens (how those primitives are applied to the interface).

```css
/* ==========================================================================
   1. PRIMITIVE LAYER (Raw Scales - Never reference directly in components)
   ========================================================================== */
:root {
  /* Slate Scale */
  --primitive-slate-50:  #f8fafc;
  --primitive-slate-100: #f1f5f9;
  --primitive-slate-200: #e2e8f0;
  --primitive-slate-700: #334155;
  --primitive-slate-800: #1e293b;
  --primitive-slate-900: #0f172a;
  --primitive-slate-950: #020617;

  /* Accent (Violet/Indigo) */
  --primitive-violet-500: #8b5cf6;
  --primitive-violet-600: #7c3aed;
  --primitive-violet-400: #a78bfa;

  /* Status Colors */
  --primitive-emerald-500: #10b981;
  --primitive-rose-500:    #f43f5e;
  --primitive-amber-500:   #f59e0b;

  /* Spacing Scale (8pt grid foundation) */
  --space-0-5: 0.125rem; /* 2px */
  --space-1:   0.25rem;  /* 4px */
  --space-2:   0.5rem;   /* 8px */
  --space-3:   0.75rem;  /* 12px */
  --space-4:   1rem;     /* 16px */
  --space-6:   1.5rem;   /* 24px */
  --space-8:   2rem;     /* 32px */
  --space-12:  3rem;     /* 48px */

  /* Radius Scale */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
}

/* ==========================================================================
   2. SEMANTIC LAYER (Context-aware variables used in component styles)
   ========================================================================== */
:root, [data-theme="dark"] {
  --bg-app:          var(--primitive-slate-950);
  --bg-surface:      var(--primitive-slate-900);
  --bg-surface-elevated: var(--primitive-slate-800);
  --bg-interactive:  var(--primitive-slate-800);
  --bg-interactive-hover: var(--primitive-slate-700);

  --text-primary:    var(--primitive-slate-50);
  --text-secondary:  #94a3b8;
  --text-muted:      #64748b;

  --border-subtle:   rgba(255, 255, 255, 0.08);
  --border-strong:   rgba(255, 255, 255, 0.16);

  --brand-primary:   var(--primitive-violet-500);
  --brand-hover:     var(--primitive-violet-400);

  --status-success:  var(--primitive-emerald-500);
  --status-danger:   var(--primitive-rose-500);
  --status-warning:  var(--primitive-amber-500);

  --glass-bg:        rgba(15, 23, 42, 0.75);
  --glass-border:    rgba(255, 255, 255, 0.12);
  --glass-blur:      blur(16px);
}

[data-theme="light"] {
  --bg-app:          var(--primitive-slate-50);
  --bg-surface:      #ffffff;
  --bg-surface-elevated: var(--primitive-slate-100);
  --bg-interactive:  var(--primitive-slate-100);
  --bg-interactive-hover: var(--primitive-slate-200);

  --text-primary:    var(--primitive-slate-900);
  --text-secondary:  var(--primitive-slate-700);
  --text-muted:      #94a3b8;

  --border-subtle:   rgba(0, 0, 0, 0.08);
  --border-strong:   rgba(0, 0, 0, 0.16);

  --brand-primary:   var(--primitive-violet-600);
  --brand-hover:     var(--primitive-violet-500);

  --glass-bg:        rgba(255, 255, 255, 0.8);
  --glass-border:    rgba(0, 0, 0, 0.08);
  --glass-blur:      blur(16px);
}
```

---

## 2. Fluid Typography with `clamp()`

Eliminate brittle font-size media query overrides with fluid formulas:

```css
/* clamp(MIN, VAL, MAX) */
:root {
  /* Fluid Body: 16px at 320px viewport, scales to 18px at 1280px */
  --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);

  /* Fluid H3: 20px -> 24px */
  --text-h3: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);

  /* Fluid H2: 24px -> 32px */
  --text-h2: clamp(1.5rem, 1.3rem + 1vw, 2rem);

  /* Fluid H1: 32px -> 48px */
  --text-h1: clamp(2rem, 1.6rem + 2vw, 3rem);
}
```

---

## 3. Container Queries for True Component Modularity

Instead of checking the entire browser viewport width (`@media (min-width: ...)`), check the container width that wraps the component:

```css
/* Card Container Definition */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Default vertical layout (for narrow columns or mobile sidebars) */
.product-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Switches to horizontal card when wrapper has at least 420px width */
@container card (min-width: 420px) {
  .product-card {
    flex-direction: row;
    align-items: center;
  }

  .product-card-thumbnail {
    width: 140px;
    height: 140px;
    flex-shrink: 0;
  }
}
```

---

## 4. Theme Switching Implementation (Zero Flash of Incorrect Theme)

To prevent Flash of Unstyled Theme (FOUT), execute inline script in the `<head>` before rendering body:

```html
<script>
  (function () {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```
