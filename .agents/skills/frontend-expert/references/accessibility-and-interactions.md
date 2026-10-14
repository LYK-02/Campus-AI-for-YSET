# Accessibility (WCAG AA), Focus Trapping & Micro-Interactions

## 1. WCAG AA Accessibility Checklist

### Visual & Semantic Invariants
- [ ] **Contrast Ratio**: Minimum 4.5:1 for standard body text; 3:1 for large text (>= 18pt or bold >= 14pt) and UI boundary controls.
- [ ] **Color Independence**: Never convey status using color alone. Pair color with icons or textual labels (e.g. green circle + "Active", red exclamation + "Failed").
- [ ] **Semantic Buttons**: Use native `<button type="button">`. If an anchor `<a>` triggers an action instead of navigating to a URL, use a `<button>`.
- [ ] **Focus Rings**: Never use `outline: none` without providing an enhanced `:focus-visible` replacement:
  ```css
  :focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }
  ```

---

## 2. Modal Dialogs with Native `<dialog>`

The native `<dialog>` element automatically handles **focus trapping**, background scroll locking, and `Escape` key closing out of the box:

```html
<dialog id="settings-dialog" class="accessible-dialog" aria-labelledby="dialog-title">
  <div class="dialog-content">
    <header class="dialog-header">
      <h2 id="dialog-title">Account Preferences</h2>
      <button type="button" class="close-btn" aria-label="Close dialog" onclick="closeDialog()">✕</button>
    </header>

    <div class="dialog-body">
      <p>Configure your notification frequencies and security settings.</p>
      <!-- Form controls -->
    </div>

    <footer class="dialog-footer">
      <button type="button" class="btn-secondary" onclick="closeDialog()">Cancel</button>
      <button type="button" class="btn-primary">Save Changes</button>
    </footer>
  </div>
</dialog>

<script>
  const dialog = document.getElementById('settings-dialog');
  let triggerElement = null;

  function openDialog(trigger) {
    triggerElement = trigger; // Store trigger to restore focus on close
    dialog.showModal();       // Automatically traps focus and renders backdrop
  }

  function closeDialog() {
    dialog.close();
    triggerElement?.focus();  // Restore keyboard focus to caller
  }
</script>
```

```css
/* Styled Dialog & Backdrop */
.accessible-dialog {
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: var(--space-6);
  max-width: 520px;
  width: 90vw;
  box-shadow: var(--shadow-lg);
}

.accessible-dialog::backdrop {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
}
```

---

## 3. ARIA Rules of Thumb

1. **First Rule of ARIA**: Use native HTML elements before adding ARIA.
   - Use `<nav>` instead of `<div role="navigation">`.
   - Use `<button>` instead of `<div role="button" tabindex="0">`.
2. **Accessible Accordions / Menus**:
   ```html
   <button 
     type="button" 
     id="faq-btn-1" 
     aria-expanded="false" 
     aria-controls="faq-panel-1"
     onclick="toggleAccordion(this)">
     What is your refund policy?
   </button>
   
   <div 
     id="faq-panel-1" 
     role="region" 
     aria-labelledby="faq-btn-1" 
     hidden>
     <p>We offer a 30-day money-back guarantee on all plans.</p>
   </div>
   ```
3. **Screen Reader Announcements with `aria-live`**:
   ```html
   <div id="status-announcer" class="sr-only" aria-live="polite" aria-atomic="true">
     <!-- Dynamic text updates here are read aloud to screen readers -->
   </div>
   ```

---

## 4. Micro-Interactions & Reduced Motion

### The Spring Curve Formula
Use modern cubic-bezier easing to make interactive elements feel responsive and physical:

```css
:root {
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
}

.button-interactive {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--brand-primary);
  color: #fff;
  border-radius: var(--radius-md);
  transition: transform var(--duration-fast) var(--ease-spring),
              background-color var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease;
}

.button-interactive:hover {
  background: var(--brand-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
}

.button-interactive:active {
  transform: translateY(0) scale(0.98);
}
```

### Complete `prefers-reduced-motion` Coverage
Always disable rapid animations or continuous spinning for users with vestibular disorders:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
