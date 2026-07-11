## 2026-07-11 - [Stable Sync Pattern]
**Learning:** Using React state for internal mutexes (like `isSyncing`) in hooks that manage effects can lead to redundant execution loops. If a state change triggers a callback recreation which is a dependency of an effect, the effect re-runs unnecessarily.
**Action:** Use `useRef` for internal flags and the "latest ref" pattern for state access in stable callbacks to prevent dependency churn and effect re-runs.
