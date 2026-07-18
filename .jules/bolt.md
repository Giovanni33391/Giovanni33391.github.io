# Bolt's Journal

## 2025-03-05 - [React useMemo & Repeated Array Iterations Anti-pattern]
**Learning:** Performing repeated array filter/reduction passes inside `useMemo` hooks (like $O(7N)$ filter scans over user-completed logs) leads to major performance degradation as local state/history grows over time. It generates massive garbage collection overhead by repeatedly allocating temporary arrays. Using a single-pass `Map` grouping structure optimizes this to $O(N)$ and keeps the main thread buttery smooth.
**Action:** Always watch out for nested iteration scans on local user datasets, especially inside high-frequency hooks or dashboard summary render loops. Use custom Map/Hash indexes instead of multi-filter passes.
