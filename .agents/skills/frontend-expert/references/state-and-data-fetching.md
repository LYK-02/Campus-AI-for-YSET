# State Management, Data Fetching & Optimistic UI

## 1. State Classification Hierarchy

Before reaching for a global store or state manager, classify state into its proper tier:

| Type | Scope | Storage Location | Example |
| :--- | :--- | :--- | :--- |
| **Local Ephemeral** | Single Component | `useState` / Component Class | Dropdown open/close, hover tooltips, form input value |
| **URL State** | Shareable / Deep-linkable | Query Params (`?tab=billing&page=2`) | Active filter, pagination index, search query |
| **Server State** | Shared Remote Async Data | SWR, TanStack Query, RTK Query | User profile, product list, notification count |
| **Global Client State** | App-wide Session/Preferences | Context, Zustand, Signal | Active theme (`dark`/`light`), auth token, shopping cart |

---

## 2. Optimistic UI Updates Pattern

Optimistic UI updates give users instantaneous feedback without waiting for server network roundtrips:

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

async function toggleTodoOptimistic(
  todoId: string, 
  currentState: Todo[], 
  updateState: (todos: Todo[]) => void
) {
  // 1. Snapshot previous state for rollback
  const previousTodos = [...currentState];

  // 2. Optimistically update local UI immediately
  const optimisticTodos = currentState.map(t => 
    t.id === todoId ? { ...t, completed: !t.completed } : t
  );
  updateState(optimisticTodos);

  try {
    // 3. Perform network call in background
    const response = await fetch(`/api/todos/${todoId}/toggle`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Server rejected toggle');
    }
  } catch (error) {
    // 4. Rollback to original state upon error
    console.error('Optimistic update failed, rolling back:', error);
    updateState(previousTodos);
    showToastNotification('Could not update todo. Changes reverted.', 'error');
  }
}
```

---

## 3. Resilient 4-State UI Components

Every component that renders asynchronous data must handle all 4 states gracefully:

```tsx
function ProjectList({ status, data, error, onRetry }) {
  // 1. Loading State (Use Skeletons that match final layout)
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-3 gap-4" aria-busy="true" aria-label="Loading projects">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  // 2. Error State (Actionable error with retry button)
  if (status === 'error') {
    return (
      <div className="error-banner" role="alert">
        <p className="error-message">Failed to load projects: {error.message}</p>
        <button onClick={onRetry} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  // 3. Empty State (Friendly empty state with primary CTA)
  if (data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">📁</div>
        <h3>No projects found</h3>
        <p>Get started by creating your first project workspace.</p>
        <button className="btn-primary">Create Project</button>
      </div>
    );
  }

  // 4. Success State
  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

---

## 4. High-Conversion Form UX Rules

1. **Inline Validation Timing**:
   - Do **not** show red error messages while the user is actively typing on an empty field.
   - Validate on `blur` (when user tabs away) or after the first form submit attempt.
2. **Accessible Form Linking**:
   - Link form errors directly to the input via `aria-describedby`:
     ```html
     <label for="user-email">Email Address</label>
     <input 
       id="user-email" 
       type="email" 
       aria-invalid="true" 
       aria-describedby="email-error" 
       required 
     />
     <span id="email-error" class="input-error" role="alert">
       Please enter a valid work email address.
     </span>
     ```
3. **Disable Double Submissions**:
   - Disable submit button and show loading spinner upon form submission to prevent duplicate charges or database inserts.
