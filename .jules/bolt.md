## 2025-05-14 - Dashboard Re-render Optimization
**Learning:** In a dashboard with many dynamic components (like `ChallengeCard`), every state change in the parent (e.g., selecting a day) causes a full re-render of all children unless memoization is explicitly used. Wrapping children in `React.memo` and ensuring stable props via `useMemo` and `useCallback` in the parent is critical for maintaining 60fps interactions as the list grows.
**Action:** Always wrap list items and expensive dashboard cards in `React.memo` and stabilize their callbacks in the parent component.
