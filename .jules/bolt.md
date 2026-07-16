## 2025-05-22 - Dashboard Performance Optimization

**Learning:** The main dashboard was suffering from multiple performance anti-patterns:
1. **Unstable Callbacks**: Core action functions like `completeChallenge` in `useOnePercent` depended on the entire `challenges` array, causing all downstream components (like `ChallengeCard`) to re-render whenever *any* habit was updated.
2. **O(7N) Complexity**: The weekly activity stats were recalculating by filtering the entire logs array 7 times on every render.
3. **Missing Memoization**: Expensive components like `ChallengeCard` (with charts) and `StatsDashboard` were re-rendering on every parent state change (e.g., opening a modal).
4. **Hoisting**: Utility functions like `fetchNextAITask` were defined inside the hook, causing recreation on every render.

**Action:**
1. Use functional updates in `useState` to stabilize callbacks.
2. Hoist non-reactive utilities outside the hook.
3. Optimize stats calculation to O(N) using a hash map.
4. Apply `React.memo` and `useCallback` to prevent unnecessary re-renders.
