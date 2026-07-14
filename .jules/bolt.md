## 2025-05-15 - [Referential Stability for Memoization]
**Learning:** Destructuring helper functions from hooks (e.g., `const { isToday } = useOnePercent()`) can break `React.memo` if the hook returns a new object on every render.
**Action:** Import static helper functions directly from their modules or ensure they are wrapped in `useCallback` within the hook to maintain referential identity.

## 2025-05-15 - [Clean Workspace]
**Learning:** Long-running processes like `npm run dev > log.txt` create artifacts that shouldn't be committed.
**Action:** Always check for and remove temporary files (`*.log`, `/verification/*`) before submission.
