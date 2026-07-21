# Bolt's Performance Journal

## 2025-07-21 - Hook Callback Stabilization & Hash Map Aggregation
**Learning:** Decoupling hook callbacks (like `completeChallenge` and `deleteChallenge`) from parent state arrays using a `useRef` mutable container achieves perfect referential stability. Previously, every state change recreated these handlers, leading to downstream `React.memo()` invalidation on all `ChallengeCard` elements. In addition, nested mapping filters over lists (such as the weekly activity log check) scale poorly. Aggregating logs in a single-pass `Map` reduced time complexity from $O(7N)$ to $O(N)$.
**Action:** Always check hook callback dependency arrays for state collections, and utilize the latest-ref pattern when passing callbacks to list-rendered elements.
