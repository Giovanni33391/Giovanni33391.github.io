## 2025-07-05 - [Optimizing AI-driven Habit Updates]
**Learning:** Sequential AI API calls in habit completion flows create a noticeable "UI freeze" (~1-3s). Moving these calls to background promises while providing immediate optimistic UI updates significantly improves perceived performance.
**Action:** Always prefer background AI generation for habit-related micro-tasks. Update local state with a "Generating..." placeholder and swap it when the promise resolves.

## 2025-07-05 - [Preventing Component Re-renders in Lists]
**Learning:** In habit tracking apps, updating one habit often triggers a full list re-render if the completion callback has a dependency on the full list.
**Action:** Use `React.useRef` to maintain a stable reference to the state within callbacks, or use the functional update pattern `setChallenges(prev => ...)` to remove state dependencies from `useCallback`, combined with `React.memo` on list items.
