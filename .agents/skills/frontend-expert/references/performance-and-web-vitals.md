# Core Web Vitals & Frontend Performance Optimization

## 1. Interaction to Next Paint (INP)

INP measures how quickly a page responds visually to user interactions (clicks, taps, keypresses). Target: **< 200ms**.

### Anti-Pattern: Blocking the Main Thread
```javascript
// BAD: Freezes the main thread for 400ms, causing horrible INP
function filterLargeDataset(items, query) {
  const results = items.filter(item => complexRegExp(item, query));
  renderItems(results);
}
```

### Best Practice: Chunking with `scheduler.yield()`
Break up heavy operations so the browser can paint the UI and respond to user inputs between chunks:

```javascript
async function processInChunks(items, processItem, chunkSize = 100) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(processItem);

    // Yield control back to browser to maintain 60fps & low INP
    if ('scheduler' in window && 'yield' in window.scheduler) {
      await window.scheduler.yield();
    } else {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

### Eliminating Layout Thrashing (Forced Synchronous Layout)
Avoid interleaving DOM reads (which force geometric recalculations) and DOM writes:

```javascript
// BAD: Forces layout calculation on every loop iteration
cards.forEach(card => {
  const width = card.offsetWidth; // READ (Forces layout)
  card.style.height = `${width * 0.75}px`; // WRITE (Invalidates layout)
});

// GOOD: Batch all reads first, then batch all writes
const measurements = cards.map(card => card.offsetWidth); // BATCH READS
cards.forEach((card, i) => {
  card.style.height = `${measurements[i] * 0.75}px`; // BATCH WRITES
});
```

---

## 2. Largest Contentful Paint (LCP)

LCP measures when the main content of a page has likely rendered. Target: **< 2.5s**.

### Golden Rules for LCP Images:
1. **Never Lazy-Load the LCP Element**: Remove `loading="lazy"` from hero banners and above-the-fold images.
2. **Assign `fetchpriority="high"`**:
   ```html
   <img 
     src="/images/hero-dashboard.webp" 
     alt="Platform Analytics Overview" 
     width="1200" 
     height="675"
     fetchpriority="high"
     decoding="async"
   />
   ```
3. **Preload the LCP Image in the `<head>`**:
   ```html
   <link rel="preload" as="image" href="/images/hero-dashboard.webp" fetchpriority="high">
   ```
4. **Use Modern Image Formats**: Convert PNG/JPEG to WebP or AVIF (typically 30-60% smaller file size).

---

## 3. Cumulative Layout Shift (CLS)

CLS measures visual stability. Unexpected shifts degrade UX and penalize SEO. Target: **< 0.1**.

### 1. Always Reserve Explicit Dimensions or Aspect Ratios
```css
/* Reserve ratio before image loads */
.image-container {
  aspect-ratio: 16 / 9;
  background-color: var(--bg-surface-elevated);
  overflow: hidden;
  border-radius: var(--radius-md);
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 2. Reserve Space for Dynamic Components & Ads
Never let dynamically injected banners or toasts push content down. Use fixed min-heights or overlay drawers:
```css
.announcement-banner-slot {
  min-height: 48px; /* Pre-allocated space prevents page content jump */
}
```

---

## 4. Hardware-Accelerated CSS Animations

Never animate layout or paint triggers (`width`, `height`, `padding`, `margin`, `top`, `left`). Animate **only Composite Properties**:
- `transform: translate3d(x, y, z)`
- `transform: scale()`
- `transform: rotate()`
- `opacity`

```css
/* High-Performance Smooth Transition */
.interactive-card {
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 180ms ease,
              border-color 180ms ease;
  will-change: transform; /* Hint GPU layer */
}

.interactive-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```
