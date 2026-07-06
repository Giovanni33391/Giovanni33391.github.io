## 2025-05-14 - Optimized Rendering and Callback Stability
**Learning:** In a dashboard with frequent state updates (like completing challenges), components like `ChallengeCard` and `StatsDashboard` re-render on every global state change. Wrapping them in `React.memo` and stabilizing the callbacks in `useOnePercent` with `useRef` significantly reduces the rendering overhead.
**Action:** Always memoize individual list items in dashboards and use functional updates/refs for hook callbacks to maintain stable references.
