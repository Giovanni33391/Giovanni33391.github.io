# Bolt's Performance Optimization Journal ⚡

## 2026-07-20 - [Optimize weeklyActivity logic]
**Learning:** Performing multiple `.filter` passes on an un-indexed or long array in a rendering loop or React hook creates an unnecessary performance bottleneck. By changing an O(7N) multi-filter approach into a single-pass O(N) hash map grouping algorithm, we can prevent redundant array traversals and improve responsiveness on data-heavy client states.
**Action:** Always favor a single-pass hash map grouping over multi-pass `.filter` operations when processing or aggregating lists for dashboard charts or timeline summaries.
