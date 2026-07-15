## 2025-05-15 - [O(N) Stats Computation]
**Learning:** Calculating weekly activity by filtering a flat list of logs for each day of the week results in an $O(7N)$ complexity. For users with large histories, this causes noticeable lag in the dashboard render cycle.
**Action:** Use an activity map (hash map) to initialize the target days and perform a single $O(N)$ pass over the logs. This ensures the stats dashboard remains fast regardless of history size.

## 2025-05-15 - [Referential Stability for Memoization]
**Learning:** `React.memo` is ineffective if props like `onComplete` change on every render. Hooks that manage state and provide callbacks must use stable references (via functional updates or refs) to allow downstream memoization to work.
**Action:** Decouple state from callback dependencies by using `useRef` for current state snapshots and functional updates for state transitions.
